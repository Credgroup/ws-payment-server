import { WebSocketEvent } from './types';

// Enum para tipos de eventos
export enum EventTypes {
  // Eventos do Dispositivo 1
  JOIN_ROOM = 'JOIN_ROOM',
  
  // Eventos do Dispositivo 2
  ENTERED_SUMMARY = 'ENTERED_SUMMARY',
  CLICKED_PROCEED = 'CLICKED_PROCEED',
  PAYMENT_METHOD_CHANGED = 'PAYMENT_METHOD_CHANGED',
  DATA_FILLED = 'DATA_FILLED',
  CLICKED_PAY = 'CLICKED_PAY',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  
  // Eventos do sistema
  ROOM_JOINED = 'ROOM_JOINED',
  CLIENT_DISCONNECTED = 'CLIENT_DISCONNECTED',
  ERROR = 'ERROR'
}

// Função para criar eventos com timestamp
export function createEvent<T extends WebSocketEvent>(
  eventType: T['type'],
  payload: Omit<T['payload'], 'timestamp'>,
  roomId: string
): T {
  return {
    type: eventType,
    payload: {
      ...payload,
      roomId,
      timestamp: Date.now()
    }
  } as T;
}

// Função para validar se um evento é válido
export function isValidEvent(event: any): event is WebSocketEvent {
  return (
    event &&
    typeof event === 'object' &&
    typeof event.type === 'string' &&
    event.payload &&
    typeof event.payload === 'object' &&
    typeof event.payload.roomId === 'string'
  );
}

// Função para obter o tipo de dispositivo baseado no evento
export function getDeviceTypeFromEvent(event: WebSocketEvent): 'device1' | 'device2' {
  const device1Events = [
    EventTypes.JOIN_ROOM
  ];
  
  const device2Events = [
    EventTypes.ENTERED_SUMMARY,
    EventTypes.CLICKED_PROCEED,
    EventTypes.PAYMENT_METHOD_CHANGED,
    EventTypes.DATA_FILLED,
    EventTypes.CLICKED_PAY,
    EventTypes.PAYMENT_SUCCESS,
    EventTypes.PAYMENT_ERROR
  ];
  
  if (device1Events.includes(event.type as EventTypes)) {
    return 'device1';
  } else if (device2Events.includes(event.type as EventTypes)) {
    return 'device2';
  }
  
  throw new Error(`Tipo de evento desconhecido: ${event.type}`);
} 