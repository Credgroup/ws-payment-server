import { WebSocketEvent, Device2Events } from '../types';
import { EventTypes, createEvent, getDeviceTypeFromEvent } from '../events';
import { RoomManager } from '../rooms';
import { Logger } from '../utils/logger';

export class PaymentFlowHandler {
  constructor(private roomManager: RoomManager) {}

  // Handler principal para processar eventos do fluxo de pagamento
  handleEvent(event: WebSocketEvent, clientId: string): void {
    try {
      const deviceType = getDeviceTypeFromEvent(event);
      // Verificar se o evento tem roomId antes de usar
      const roomId = 'roomId' in event.payload ? event.payload.roomId : 'unknown';
      Logger.wsEvent(event.type, roomId, clientId);

      switch (event.type) {
        case EventTypes.JOIN_ROOM:
          this.handleJoinRoom(event, clientId);
          break;
        
        case EventTypes.ENTERED_SUMMARY:
          this.handleEnteredSummary(event, clientId);
          break;
        
        case EventTypes.CLICKED_PROCEED:
          this.handleClickedProceed(event, clientId);
          break;
        
        case EventTypes.PAYMENT_METHOD_CHANGED:
          this.handlePaymentMethodChanged(event, clientId);
          break;
        
        case EventTypes.DATA_FILLED:
          this.handleDataFilled(event, clientId);
          break;
        
        case EventTypes.CLICKED_PAY:
          this.handleClickedPay(event, clientId);
          break;
        
        case EventTypes.PAYMENT_SUCCESS:
          this.handlePaymentSuccess(event, clientId);
          break;
        
        case EventTypes.PAYMENT_ERROR:
          this.handlePaymentError(event, clientId);
          break;
        
        default:
          Logger.warn(`Tipo de evento não reconhecido: ${event.type}`);
          this.sendErrorToClient(clientId, `Tipo de evento não suportado: ${event.type}`);
      }
    } catch (error) {
      Logger.error(`Erro ao processar evento ${event.type}:`, error);
      this.sendErrorToClient(clientId, 'Erro interno do servidor');
    }
  }

  // Handler para quando o cliente entra na sala
  private handleJoinRoom(event: any, clientId: string): void {
    const { roomId, deviceId } = event.payload;
    
    Logger.info(`Cliente ${clientId} entrou na sala ${roomId}`);
    
    // Confirmar entrada na sala
    const confirmationEvent = createEvent(
      EventTypes.ROOM_JOINED,
      { roomId, deviceId, clientId },
      roomId
    );
    
    this.roomManager.sendToClient(clientId, confirmationEvent);
  }

  // Handler para quando o usuário entra na tela de resumo
  private handleEnteredSummary(event: Device2Events['ENTERED_SUMMARY'], clientId: string): void {
    const { roomId, deviceId } = event.payload;
    
    // Transmitir evento para outros clientes na sala
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.info(`Usuário ${deviceId} entrou na tela de resumo (sala ${roomId})`);
  }

  // Handler para quando o usuário clica em "prosseguir"
  private handleClickedProceed(event: Device2Events['CLICKED_PROCEED'], clientId: string): void {
    const { roomId, deviceId } = event.payload;
    
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.info(`Usuário ${deviceId} clicou em "prosseguir" (sala ${roomId})`);
  }

  // Handler para quando o método de pagamento é alterado
  private handlePaymentMethodChanged(event: Device2Events['PAYMENT_METHOD_CHANGED'], clientId: string): void {
    const { roomId, deviceId, method } = event.payload;
    
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.info(`Usuário ${deviceId} alterou método de pagamento para: ${method} (sala ${roomId})`);
  }

  // Handler para quando todos os dados foram preenchidos
  private handleDataFilled(event: Device2Events['DATA_FILLED'], clientId: string): void {
    const { roomId, deviceId, fields } = event.payload;
    
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.info(`Usuário ${deviceId} preencheu todos os dados: ${fields.join(', ')} (sala ${roomId})`);
  }

  // Handler para quando o usuário clica em "pagar"
  private handleClickedPay(event: Device2Events['CLICKED_PAY'], clientId: string): void {
    const { roomId, deviceId } = event.payload;
    
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.info(`Usuário ${deviceId} clicou em "pagar" (sala ${roomId})`);
  }

  // Handler para pagamento bem-sucedido
  private handlePaymentSuccess(event: Device2Events['PAYMENT_SUCCESS'], clientId: string): void {
    const { roomId, deviceId, transactionId, amount } = event.payload;
    
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.info(`Pagamento bem-sucedido: ${transactionId} - R$ ${amount} (sala ${roomId})`);
    
    // Opcional: fechar a sala após pagamento bem-sucedido
    // this.closeRoomAfterSuccess(roomId);
  }

  // Handler para erro no pagamento
  private handlePaymentError(event: Device2Events['PAYMENT_ERROR'], clientId: string): void {
    const { roomId, deviceId, error, code } = event.payload;
    
    this.roomManager.broadcastToRoom(roomId, event, clientId);
    Logger.error(`Erro no pagamento: ${error} (código: ${code}) - sala ${roomId}`);
  }

  // Enviar erro para um cliente específico
  private sendErrorToClient(clientId: string, message: string): void {
    const errorEvent = {
      type: EventTypes.ERROR,
      payload: {
        message,
        timestamp: Date.now()
      }
    };
    
    this.roomManager.sendToClient(clientId, errorEvent);
  }

  // Método opcional para fechar a sala após pagamento bem-sucedido
  private closeRoomAfterSuccess(roomId: string): void {
    const clients = this.roomManager.getClientsInRoom(roomId);
    
    // Notificar todos os clientes que a sala será fechada
    const closeEvent = {
      type: 'ROOM_CLOSED',
      payload: {
        roomId,
        reason: 'payment_success',
        timestamp: Date.now()
      }
    };
    
    clients.forEach(client => {
      this.roomManager.sendToClient(client.id, closeEvent);
    });
    
    Logger.info(`Sala ${roomId} fechada após pagamento bem-sucedido`);
  }
} 