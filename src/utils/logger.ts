// Função de log customizada para o servidor WebSocket
export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any): void {
    const timestamp = this.getTimestamp();
    const logMessage = `[INFO] ${timestamp} - ${message}`;
    console.log(logMessage);
    
    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  }

  static warn(message: string, data?: any): void {
    const timestamp = this.getTimestamp();
    const logMessage = `[WARN] ${timestamp} - ${message}`;
    console.warn(logMessage);
    
    if (data) {
      console.warn('Data:', JSON.stringify(data, null, 2));
    }
  }

  static error(message: string, error?: any): void {
    const timestamp = this.getTimestamp();
    const logMessage = `[ERROR] ${timestamp} - ${message}`;
    console.error(logMessage);
    
    if (error) {
      console.error('Error details:', error);
    }
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = this.getTimestamp();
      const logMessage = `[DEBUG] ${timestamp} - ${message}`;
      console.log(logMessage);
      
      if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
      }
    }
  }

  // Logs específicos para WebSocket
  static wsConnect(clientId: string, roomId: string): void {
    this.info(`Cliente ${clientId} conectado à sala ${roomId}`);
  }

  static wsDisconnect(clientId: string, roomId: string): void {
    this.info(`Cliente ${clientId} desconectado da sala ${roomId}`);
  }

  static wsEvent(eventType: string, roomId: string, clientId: string): void {
    this.debug(`Evento ${eventType} recebido na sala ${roomId} do cliente ${clientId}`);
  }

  static wsBroadcast(eventType: string, roomId: string, recipientsCount: number): void {
    this.debug(`Evento ${eventType} transmitido na sala ${roomId} para ${recipientsCount} clientes`);
  }

  static roomCreated(roomId: string): void {
    this.info(`Sala ${roomId} criada`);
  }

  static roomDeleted(roomId: string): void {
    this.info(`Sala ${roomId} removida`);
  }
} 