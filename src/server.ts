import { createServer } from 'http';
import { WebSocketServer as WSWebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './rooms';
import { PaymentFlowHandler } from './handlers/paymentFlow';
import { Logger } from './utils/logger';
import { isValidEvent } from './events';
import { WebSocketEvent } from './types';

export class WebSocketServer {
  private wss: WSWebSocketServer;
  private roomManager: RoomManager;
  private paymentHandler: PaymentFlowHandler;

  constructor(port: number = 8080) {
    // Criar servidor HTTP
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('WebSocket Payment Server está rodando!\n');
    });

    // Criar servidor WebSocket
    this.wss = new WSWebSocketServer({ server });
    
    // Inicializar gerenciadores
    this.roomManager = new RoomManager();
    this.paymentHandler = new PaymentFlowHandler(this.roomManager);

    // Configurar handlers do WebSocket
    this.setupWebSocketHandlers();

    // Iniciar servidor
    server.listen(port, () => {
      Logger.info(`Servidor WebSocket iniciado na porta ${port}`);
      Logger.info(`Acesse http://localhost:${port} para verificar o status`);
    });

    // Configurar limpeza periódica de salas vazias
    this.setupPeriodicCleanup();
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      Logger.info(`Nova conexão WebSocket: ${clientId}`);

      // Configurar handlers para esta conexão
      this.setupConnectionHandlers(ws, clientId);
    });

    this.wss.on('error', (error) => {
      Logger.error('Erro no servidor WebSocket:', error);
    });
  }

  private setupConnectionHandlers(ws: WebSocket, clientId: string): void {
    // Handler para mensagens recebidas
    ws.on('message', (data: Buffer) => {
      try {
        const message = data.toString();
        const event = JSON.parse(message);

        if (!isValidEvent(event)) {
          Logger.warn(`Evento inválido recebido de ${clientId}:`, event);
          this.sendErrorToClient(ws, 'Formato de evento inválido');
          return;
        }

        // Se for um evento JOIN_ROOM, adicionar o cliente à sala primeiro
        if (event.type === 'JOIN_ROOM') {
          const { roomId } = event.payload;
          this.roomManager.addClientToRoom(clientId, 'device1', roomId, ws);
        }
        // Se for um evento do device2, adicionar o cliente à sala se ainda não estiver
        else if (['ENTERED_SUMMARY', 'CLICKED_PROCEED', 'PAYMENT_METHOD_CHANGED', 'DATA_FILLED', 'CLICKED_PAY', 'PAYMENT_SUCCESS', 'PAYMENT_ERROR'].includes(event.type)) {
          const { roomId } = event.payload;
          if (!this.roomManager.isClientInRoom(clientId, roomId)) {
            this.roomManager.addClientToRoom(clientId, 'device2', roomId, ws);
          }
        }

        // Processar evento através do handler de pagamento
        this.paymentHandler.handleEvent(event as WebSocketEvent, clientId);

      } catch (error) {
        Logger.error(`Erro ao processar mensagem de ${clientId}:`, error);
        this.sendErrorToClient(ws, 'Erro ao processar mensagem');
      }
    });

    // Handler para desconexão
    ws.on('close', (code, reason) => {
      Logger.info(`Cliente ${clientId} desconectado (código: ${code}, motivo: ${reason})`);
      this.roomManager.removeClientFromRoom(clientId);
    });

    // Handler para erros de conexão
    ws.on('error', (error) => {
      Logger.error(`Erro na conexão do cliente ${clientId}:`, error);
      this.roomManager.removeClientFromRoom(clientId);
    });

    // Handler para pings (manter conexão ativa)
    ws.on('ping', () => {
      ws.pong();
    });

    // Enviar confirmação de conexão
    this.sendWelcomeMessage(ws, clientId);
  }

  private sendWelcomeMessage(ws: WebSocket, clientId: string): void {
    const welcomeEvent = {
      type: 'CONNECTION_ESTABLISHED',
      payload: {
        clientId,
        message: 'Conexão WebSocket estabelecida com sucesso',
        timestamp: Date.now(),
        supportedEvents: [
          'JOIN_ROOM',
          'ENTERED_SUMMARY',
          'CLICKED_PROCEED',
          'PAYMENT_METHOD_CHANGED',
          'DATA_FILLED',
          'CLICKED_PAY',
          'PAYMENT_SUCCESS',
          'PAYMENT_ERROR'
        ]
      }
    };

    try {
      ws.send(JSON.stringify(welcomeEvent));
    } catch (error) {
      Logger.error(`Erro ao enviar mensagem de boas-vindas para ${clientId}:`, error);
    }
  }

  private sendErrorToClient(ws: WebSocket, message: string): void {
    const errorEvent = {
      type: 'ERROR',
      payload: {
        message,
        timestamp: Date.now()
      }
    };

    try {
      ws.send(JSON.stringify(errorEvent));
    } catch (error) {
      Logger.error('Erro ao enviar mensagem de erro:', error);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPeriodicCleanup(): void {
    // Limpar salas vazias a cada 5 minutos
    setInterval(() => {
      const cleanedCount = this.roomManager.cleanupEmptyRooms();
      if (cleanedCount > 0) {
        Logger.info(`Limpeza automática: ${cleanedCount} salas vazias removidas`);
      }
    }, 5 * 60 * 1000);

    // Log de estatísticas a cada 10 minutos
    setInterval(() => {
      const stats = this.roomManager.getStats();
      Logger.info('Estatísticas do servidor:', stats);
    }, 10 * 60 * 1000);
  }

  // Método para obter estatísticas do servidor
  getStats() {
    return {
      ...this.roomManager.getStats(),
      totalConnections: this.wss.clients.size
    };
  }

  // Método para fechar o servidor graciosamente
  close(): void {
    Logger.info('Fechando servidor WebSocket...');
    
    // Fechar todas as conexões
    this.wss.clients.forEach((client) => {
      client.close(1000, 'Servidor sendo desligado');
    });
    
    // Fechar servidor
    this.wss.close(() => {
      Logger.info('Servidor WebSocket fechado com sucesso');
    });
  }
} 