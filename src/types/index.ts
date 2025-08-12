// Tipos base para eventos WebSocket
export interface BaseEvent {
  type: string;
  timestamp: number;
  roomId: string;
}

// Eventos enviados pelo Dispositivo 1 (gerador do link)
export interface Device1Events {
  JOIN_ROOM: {
    type: 'JOIN_ROOM';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
}

// Eventos enviados pelo Dispositivo 2 (processador do pagamento)
export interface Device2Events {
  ENTERED_SUMMARY: {
    type: 'ENTERED_SUMMARY';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
  
  CLICKED_PROCEED: {
    type: 'CLICKED_PROCEED';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
  
  PAYMENT_METHOD_CHANGED: {
    type: 'PAYMENT_METHOD_CHANGED';
    payload: {
      roomId: string;
      deviceId: string;
      method: string;
    };
  };
  
  DATA_FILLED: {
    type: 'DATA_FILLED';
    payload: {
      roomId: string;
      deviceId: string;
      fields: string[];
    };
  };
  
  CLICKED_PAY: {
    type: 'CLICKED_PAY';
    payload: {
      roomId: string;
      deviceId: string;
    };
  };
  
  PAYMENT_SUCCESS: {
    type: 'PAYMENT_SUCCESS';
    payload: {
      roomId: string;
      deviceId: string;
      transactionId: string;
      amount: number;
    };
  };
  
  PAYMENT_ERROR: {
    type: 'PAYMENT_ERROR';
    payload: {
      roomId: string;
      deviceId: string;
      error: string;
      code?: string;
    };
  };
}

// Eventos do sistema (enviados pelo servidor)
export interface SystemEvents {
  ROOM_JOINED: {
    type: 'ROOM_JOINED';
    payload: {
      roomId: string;
      deviceId: string;
      clientId: string;
    };
  };
  
  ERROR: {
    type: 'ERROR';
    payload: {
      message: string;
      timestamp: number;
    };
  };
  
  CONNECTION_ESTABLISHED: {
    type: 'CONNECTION_ESTABLISHED';
    payload: {
      clientId: string;
      message: string;
      timestamp: number;
      supportedEvents: string[];
    };
  };
}

// Union type para todos os eventos
export type WebSocketEvent = 
  | Device1Events['JOIN_ROOM']
  | Device2Events['ENTERED_SUMMARY']
  | Device2Events['CLICKED_PROCEED']
  | Device2Events['PAYMENT_METHOD_CHANGED']
  | Device2Events['DATA_FILLED']
  | Device2Events['CLICKED_PAY']
  | Device2Events['PAYMENT_SUCCESS']
  | Device2Events['PAYMENT_ERROR']
  | SystemEvents['ROOM_JOINED']
  | SystemEvents['ERROR']
  | SystemEvents['CONNECTION_ESTABLISHED'];

// Tipo para cliente conectado
export interface ConnectedClient {
  id: string;
  deviceType: 'device1' | 'device2';
  roomId: string;
  ws: any; // WebSocket instance
}

// Tipo para sala
export interface Room {
  id: string;
  clients: Map<string, ConnectedClient>;
  createdAt: number;
} 