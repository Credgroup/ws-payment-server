// Exemplo simples de cliente WebSocket para o Payment Server
const WebSocket = require('ws');

class PaymentClient {
  constructor(serverUrl = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.roomId = null;
    this.deviceId = null;
    this.deviceType = null;
  }

  connect(deviceType, deviceId, roomId) {
    this.deviceType = deviceType;
    this.deviceId = deviceId;
    this.roomId = roomId;

    this.ws = new WebSocket(this.serverUrl);

    this.ws.on('open', () => {
      console.log(`✅ ${deviceType} conectado ao servidor`);
      
      if (deviceType === 'device1') {
        this.joinRoom();
      }
    });

    this.ws.on('message', (data) => {
      const event = JSON.parse(data);
      console.log(`📨 ${deviceType} recebeu: ${event.type}`, event);
    });

    this.ws.on('close', () => {
      console.log(`❌ ${deviceType} desconectado`);
    });

    this.ws.on('error', (error) => {
      console.error(`Erro no ${deviceType}:`, error);
    });
  }

  joinRoom() {
    const event = {
      type: 'JOIN_ROOM',
      payload: {
        roomId: this.roomId,
        deviceId: this.deviceId
      }
    };
    this.sendEvent(event);
  }

  sendPaymentEvent(eventType, additionalData = {}) {
    const event = {
      type: eventType,
      payload: {
        roomId: this.roomId,
        deviceId: this.deviceId,
        ...additionalData
      }
    };
    this.sendEvent(event);
  }

  sendEvent(event) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
      console.log(`📤 ${this.deviceType} enviou: ${event.type}`);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Exemplo de uso
async function exemplo() {
  console.log('🧪 Iniciando exemplo...');
  
  // Criar clientes
  const device1 = new PaymentClient();
  const device2 = new PaymentClient();
  
  // Conectar device1 (gerador do link)
  device1.connect('device1', 'device_1', 'payment_123');
  
  // Aguardar conexão
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Conectar device2 (processador do pagamento)
  device2.connect('device2', 'device_2', 'payment_123');
  
  // Aguardar conexão
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular fluxo de pagamento
  console.log('🔄 Simulando fluxo de pagamento...');
  
  device2.sendPaymentEvent('ENTERED_SUMMARY');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  device2.sendPaymentEvent('CLICKED_PROCEED');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  device2.sendPaymentEvent('PAYMENT_METHOD_CHANGED', { method: 'cartão de crédito' });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  device2.sendPaymentEvent('DATA_FILLED', { fields: ['nome', 'email', 'cpf', 'cartão'] });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  device2.sendPaymentEvent('CLICKED_PAY');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  device2.sendPaymentEvent('PAYMENT_SUCCESS', { 
    transactionId: 'tx_' + Date.now(),
    amount: 99.90
  });
  
  console.log('✅ Exemplo concluído!');
  
  // Desconectar após 3 segundos
  setTimeout(() => {
    device1.disconnect();
    device2.disconnect();
    console.log('👋 Clientes desconectados');
  }, 3000);
}

// Executar exemplo se este arquivo for executado diretamente
if (require.main === module) {
  exemplo().catch(console.error);
}

module.exports = { PaymentClient }; 