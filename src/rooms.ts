import { WebSocket } from 'ws';
import { ConnectedClient, Room } from './types';
import { Logger } from './utils/logger';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private clients: Map<string, ConnectedClient> = new Map();

  // Criar ou obter uma sala
  getOrCreateRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      const room: Room = {
        id: roomId,
        clients: new Map(),
        createdAt: Date.now()
      };
      this.rooms.set(roomId, room);
      Logger.roomCreated(roomId);
    }
    return this.rooms.get(roomId)!;
  }

  // Adicionar cliente a uma sala
  addClientToRoom(clientId: string, deviceType: 'device1' | 'device2', roomId: string, ws: WebSocket): ConnectedClient {
    const room = this.getOrCreateRoom(roomId);
    
    const client: ConnectedClient = {
      id: clientId,
      deviceType,
      roomId,
      ws
    };

    room.clients.set(clientId, client);
    this.clients.set(clientId, client);
    
    Logger.wsConnect(clientId, roomId);
    Logger.info(`Cliente ${clientId} (${deviceType}) adicionado à sala ${roomId}`);
    
    return client;
  }

  // Remover cliente de uma sala
  removeClientFromRoom(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) {
      Logger.warn(`Tentativa de remover cliente inexistente: ${clientId}`);
      return;
    }

    const room = this.rooms.get(client.roomId);
    if (room) {
      room.clients.delete(clientId);
      Logger.wsDisconnect(clientId, client.roomId);
      
      // Se a sala ficou vazia, removê-la
      if (room.clients.size === 0) {
        this.rooms.delete(client.roomId);
        Logger.roomDeleted(client.roomId);
      }
    }

    this.clients.delete(clientId);
  }

  // Obter todos os clientes de uma sala
  getClientsInRoom(roomId: string): ConnectedClient[] {
    const room = this.rooms.get(roomId);
    if (!room) {
      return [];
    }
    return Array.from(room.clients.values());
  }

  // Obter cliente específico
  getClient(clientId: string): ConnectedClient | undefined {
    return this.clients.get(clientId);
  }

  // Verificar se um cliente está em uma sala
  isClientInRoom(clientId: string, roomId: string): boolean {
    const client = this.clients.get(clientId);
    return client?.roomId === roomId;
  }

  // Transmitir evento para todos os clientes de uma sala (exceto o remetente)
  broadcastToRoom(roomId: string, event: any, excludeClientId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      Logger.warn(`Tentativa de transmitir para sala inexistente: ${roomId}`);
      return;
    }

    let recipientsCount = 0;
    const eventString = JSON.stringify(event);

    for (const [clientId, client] of room.clients) {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(eventString);
          recipientsCount++;
        } catch (error) {
          Logger.error(`Erro ao enviar evento para cliente ${clientId}:`, error);
        }
      }
    }

    Logger.wsBroadcast(event.type, roomId, recipientsCount);
  }

  // Transmitir evento para um cliente específico
  sendToClient(clientId: string, event: any): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      Logger.warn(`Tentativa de enviar para cliente não conectado: ${clientId}`);
      return false;
    }

    try {
      client.ws.send(JSON.stringify(event));
      return true;
    } catch (error) {
      Logger.error(`Erro ao enviar evento para cliente ${clientId}:`, error);
      return false;
    }
  }

  // Obter estatísticas do servidor
  getStats(): {
    totalRooms: number;
    totalClients: number;
    rooms: Array<{ id: string; clientCount: number; createdAt: number }>;
  } {
    const rooms = Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      clientCount: room.clients.size,
      createdAt: room.createdAt
    }));

    return {
      totalRooms: this.rooms.size,
      totalClients: this.clients.size,
      rooms
    };
  }

  // Limpar salas vazias (útil para manutenção)
  cleanupEmptyRooms(): number {
    let cleanedCount = 0;
    
    for (const [roomId, room] of this.rooms) {
      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
        cleanedCount++;
        Logger.roomDeleted(roomId);
      }
    }

    if (cleanedCount > 0) {
      Logger.info(`${cleanedCount} salas vazias foram removidas`);
    }

    return cleanedCount;
  }
} 