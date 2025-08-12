// import { useEffect, useRef, useState, useCallback } from 'react';

// // Tipos baseados no servidor WebSocket
// interface BaseEvent {
//   type: string;
//   timestamp: number;
//   clientId: string;
// }

// interface JoinRoomEvent extends BaseEvent {
//   type: 'JOIN_ROOM';
//   payload: {
//     roomId: string;
//   };
// }

// interface RoomJoinedEvent extends BaseEvent {
//   type: 'ROOM_JOINED';
//   payload: {
//     roomId: string;
//     message: string;
//   };
// }

// interface Device2Event extends BaseEvent {
//   type: 'ENTERED_SUMMARY' | 'CLICKED_PROCEED' | 'CHANGED_PAYMENT_METHOD' | 'FILLED_ALL_DATA' | 'CLICKED_PAY' | 'PAYMENT_SUCCESS' | 'PAYMENT_ERROR';
//   payload: {
//     roomId: string;
//     message?: string;
//     error?: string;
//   };
// }

// type WebSocketEvent = JoinRoomEvent | RoomJoinedEvent | Device2Event;

// interface UseWebSocketOptions {
//   url: string;
//   roomId: string;
//   onConnect?: () => void;
//   onDisconnect?: () => void;
//   onError?: (error: Event) => void;
//   onDevice2Event?: (event: Device2Event) => void;
//   onRoomJoined?: (event: RoomJoinedEvent) => void;
// }

// interface UseWebSocketReturn {
//   isConnected: boolean;
//   isConnecting: boolean;
//   error: string | null;
//   sendEvent: (event: WebSocketEvent) => void;
//   connect: () => void;
//   disconnect: () => void;
// }

// export function useWebSocket({
//   url,
//   roomId,
//   onConnect,
//   onDisconnect,
//   onError,
//   onDevice2Event,
//   onRoomJoined
// }: UseWebSocketOptions): UseWebSocketReturn {
//   const [isConnected, setIsConnected] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const wsRef = useRef<WebSocket | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const reconnectAttemptsRef = useRef(0);
//   const maxReconnectAttempts = 5;

//   const generateClientId = useCallback(() => {
//     return `device1_${Math.random().toString(36).substring(2, 15)}`;
//   }, []);

//   const createEvent = useCallback((type: string, payload: any): WebSocketEvent => {
//     return {
//       type,
//       timestamp: Date.now(),
//       clientId: generateClientId(),
//       payload
//     };
//   }, [generateClientId]);

//   const sendEvent = useCallback((event: WebSocketEvent) => {
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify(event));
//       console.log('📤 WebSocket: Evento enviado:', event);
//     } else {
//       console.warn('⚠️ WebSocket: Não foi possível enviar evento - conexão não está aberta');
//     }
//   }, []);

//   const joinRoom = useCallback(() => {
//     const joinEvent = createEvent('JOIN_ROOM', { roomId });
//     sendEvent(joinEvent);
//   }, [createEvent, sendEvent, roomId]);

//   const connect = useCallback(() => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       console.log('🔗 WebSocket: Já conectado');
//       return;
//     }

//     if (isConnecting) {
//       console.log('⏳ WebSocket: Já tentando conectar...');
//       return;
//     }

//     setIsConnecting(true);
//     setError(null);

//     try {
//       console.log('🔌 WebSocket: Conectando...', url);
//       wsRef.current = new WebSocket(url);

//       wsRef.current.onopen = () => {
//         console.log('✅ WebSocket: Conectado com sucesso');
//         setIsConnected(true);
//         setIsConnecting(false);
//         reconnectAttemptsRef.current = 0;
//         onConnect?.();
        
//         // Entra na sala automaticamente após conectar
//         joinRoom();
//       };

//       wsRef.current.onmessage = (event) => {
//         try {
//           const data: WebSocketEvent = JSON.parse(event.data);
//           console.log('📥 WebSocket: Evento recebido:', data);

//           switch (data.type) {
//             case 'ROOM_JOINED':
//               console.log('🏠 WebSocket: Entrou na sala:', data.payload.roomId);
//               onRoomJoined?.(data as RoomJoinedEvent);
//               break;
            
//             case 'ENTERED_SUMMARY':
//             case 'CLICKED_PROCEED':
//             case 'CHANGED_PAYMENT_METHOD':
//             case 'FILLED_ALL_DATA':
//             case 'CLICKED_PAY':
//             case 'PAYMENT_SUCCESS':
//             case 'PAYMENT_ERROR':
//               console.log('📱 WebSocket: Evento do Device 2:', data.type, data.payload);
//               onDevice2Event?.(data as Device2Event);
//               break;
            
//             default:
//               console.log('❓ WebSocket: Evento desconhecido:', data.type);
//           }
//         } catch (parseError) {
//           console.error('❌ WebSocket: Erro ao processar mensagem:', parseError);
//         }
//       };

//       wsRef.current.onclose = (event) => {
//         console.log('🔌 WebSocket: Conexão fechada:', event.code, event.reason);
//         setIsConnected(false);
//         setIsConnecting(false);
//         onDisconnect?.();

//         // Reconexão automática se não foi fechado intencionalmente
//         if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
//           const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
//           console.log(`🔄 WebSocket: Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
//           reconnectTimeoutRef.current = setTimeout(() => {
//             reconnectAttemptsRef.current++;
//             connect();
//           }, delay);
//         }
//       };

//       wsRef.current.onerror = (error) => {
//         console.error('❌ WebSocket: Erro na conexão:', error);
//         setError('Erro na conexão WebSocket');
//         setIsConnecting(false);
//         onError?.(error);
//       };

//     } catch (error) {
//       console.error('❌ WebSocket: Erro ao criar conexão:', error);
//       setError('Erro ao criar conexão WebSocket');
//       setIsConnecting(false);
//     }
//   }, [url, isConnecting, onConnect, onDisconnect, onError, joinRoom]);

//   const disconnect = useCallback(() => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }

//     if (wsRef.current) {
//       console.log('🔌 WebSocket: Desconectando...');
//       wsRef.current.close(1000, 'Desconexão intencional');
//       wsRef.current = null;
//     }

//     setIsConnected(false);
//     setIsConnecting(false);
//     setError(null);
//     reconnectAttemptsRef.current = 0;
//   }, []);

//   // Cleanup ao desmontar
//   useEffect(() => {
//     return () => {
//       disconnect();
//     };
//   }, [disconnect]);

//   return {
//     isConnected,
//     isConnecting,
//     error,
//     sendEvent,
//     connect,
//     disconnect
//   };
// } 