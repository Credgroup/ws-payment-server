import { createServer } from 'http';
import { WebSocketServer as WSWebSocketServer, WebSocket } from 'ws';
import express from 'express';
import cors from 'cors';
import { RoomManager } from './rooms';
import { PaymentFlowHandler } from './handlers/paymentFlow';
import { Logger } from './utils/logger';
import { isValidEvent } from './events';
import { WebSocketEvent, BroadcastMessageRequest, ServerStatusResponse, ApiResponse } from './types';

export class WebSocketServer {
  private wss: WSWebSocketServer;
  private roomManager: RoomManager;
  private paymentHandler: PaymentFlowHandler;
  private app: express.Application;
  private serverStartTime: number;

  constructor(port: number = 8080) {
    this.serverStartTime = Date.now();
    
    // Criar aplicação Express
    this.app = express();
    
    // Configurar middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configurar rotas HTTP
    this.setupHttpRoutes();

    // Criar servidor HTTP
    const server = createServer(this.app);

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
      Logger.info(`API HTTP disponível em http://localhost:${port}/api`);
      Logger.info(`Status do servidor: http://localhost:${port}/api/server/status`);
    });

    // Configurar limpeza periódica de salas vazias
    this.setupPeriodicCleanup();
  }

  private setupHttpRoutes(): void {
    // Endpoint de status do servidor
    this.app.get('/api/server/status', (req, res) => {
      try {
        const stats = this.getStats();
        const statusResponse: ServerStatusResponse = {
          status: 'running',
          uptime: Date.now() - this.serverStartTime,
          totalConnections: stats.totalConnections,
          totalRooms: stats.totalRooms,
          timestamp: Date.now(),
          version: '1.0.0'
        };

        const apiResponse: ApiResponse<ServerStatusResponse> = {
          success: true,
          data: statusResponse,
          timestamp: Date.now()
        };

        res.json(apiResponse);
      } catch (error) {
        Logger.error('Erro ao obter status do servidor:', error);
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Erro interno do servidor',
          timestamp: Date.now()
        };
        res.status(500).json(errorResponse);
      }
    });

    // Endpoint para broadcast de mensagens
    this.app.post('/api/message/room/:roomId/broadcast', (req, res) => {
      try {
        const { roomId } = req.params;
        const { eventType, message, idSeguro }: BroadcastMessageRequest = req.body;
        Logger.info(`[API ESTIMULADA] Broadcast recebido para sala ${roomId}: ${eventType} (${idSeguro})`); 

        // Validação dos campos obrigatórios
        if (!eventType || !message || !idSeguro) {
          const errorResponse: ApiResponse = {
            success: false,
            error: 'Campos obrigatórios: eventType, message, idSeguro',
            timestamp: Date.now()
          };
          return res.status(400).json(errorResponse);
        }

        // Verificar se a sala existe
        if (!this.roomManager.roomExists(roomId)) {
          Logger.info(`[API ESTIMULADA] Sala ${roomId} não encontrada`);
          const errorResponse: ApiResponse = {
            success: false,
            error: `Sala ${roomId} não encontrada`,
            timestamp: Date.now()
          };
          return res.status(404).json(errorResponse);
        }

        // Criar evento para broadcast
        const broadcastEvent = {
          type: eventType,
          payload: {
            message,
            idSeguro,
            timestamp: Date.now(),
            source: 'api'
          }
        };

        // Enviar para todos os clientes na sala
        const sentCount = this.roomManager.broadcastToRoom(roomId, broadcastEvent, undefined);

        Logger.info(`[API ESTIMULADA] Broadcast enviado para sala ${roomId}: ${eventType} (${sentCount} clientes)`);

        const successResponse: ApiResponse = {
          success: true,
          data: {
            roomId,
            eventType,
            message,
            idSeguro,
            sentToClients: sentCount,
            timestamp: Date.now()
          },
          timestamp: Date.now()
        };

        res.json(successResponse);

      } catch (error) {
        Logger.error('Erro ao fazer broadcast:', error);
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Erro interno do servidor',
          timestamp: Date.now()
        };
        res.status(500).json(errorResponse);
      }
    });

    // Endpoint de health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Endpoint raiz
    this.app.get('/', (req, res) => {
      res.json({
        message: 'WebSocket Payment Server está rodando!',
        endpoints: {
          status: '/api/server/status',
          broadcast: '/api/message/room/:roomId/broadcast',
          health: '/health'
        },
        timestamp: Date.now()
      });
    });

    // Middleware de tratamento de erros
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      Logger.error('Erro na API HTTP:', err);
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Erro interno do servidor',
        timestamp: Date.now()
      };
      res.status(500).json(errorResponse);
    });
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
          const { roomId } = event.payload as { roomId: string; deviceId: string };
          this.roomManager.addClientToRoom(clientId, 'device1', roomId, ws);
        }
        // Se for um evento do device2, adicionar o cliente à sala se ainda não estiver
        else if (['ENTERED_SUMMARY', 'CLICKED_PROCEED', 'PAYMENT_METHOD_CHANGED', 'DATA_FILLED', 'CLICKED_PAY', 'PAYMENT_SUCCESS', 'PAYMENT_ERROR'].includes(event.type)) {
          const { roomId } = event.payload as { roomId: string; deviceId: string };
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