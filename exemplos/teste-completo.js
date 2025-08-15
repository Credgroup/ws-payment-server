const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:8080';
const WS_URL = 'ws://localhost:8080';

async function testeCompleto() {
  console.log('🧪 Teste Completo - WebSocket + HTTP API\n');

  // 1. Verificar status inicial
  console.log('1️⃣ Verificando status inicial do servidor...');
  try {
    const statusResponse = await axios.get(`${BASE_URL}/api/server/status`);
    console.log('✅ Servidor rodando:', statusResponse.data.data.status);
    console.log('   Conexões ativas:', statusResponse.data.data.totalConnections);
    console.log('   Salas ativas:', statusResponse.data.data.totalRooms);
  } catch (error) {
    console.log('❌ Erro ao verificar status:', error.message);
    return;
  }
  console.log('');

  // 2. Conectar WebSocket e criar sala
  console.log('2️⃣ Conectando WebSocket e criando sala...');
  const ws = new WebSocket(WS_URL);
  
  ws.on('open', () => {
    console.log('✅ WebSocket conectado!');
    
    // Entrar na sala
    const joinEvent = {
      type: 'JOIN_ROOM',
      payload: {
        roomId: 'test-room-123',
        deviceId: 'device-1'
      }
    };
    
    ws.send(JSON.stringify(joinEvent));
    console.log('📤 Enviado JOIN_ROOM para sala test-room-123');
  });

  ws.on('message', (data) => {
    const event = JSON.parse(data.toString());
    console.log('📨 Mensagem recebida:', event.type);
    
    if (event.type === 'CONNECTION_ESTABLISHED') {
      console.log('✅ Conexão estabelecida com sucesso');
    }
  });

  // Aguardar conexão ser estabelecida
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. Verificar se a sala foi criada
  console.log('\n3️⃣ Verificando se a sala foi criada...');
  try {
    const statusResponse = await axios.get(`${BASE_URL}/api/server/status`);
    console.log('✅ Status atualizado:');
    console.log('   Conexões ativas:', statusResponse.data.data.totalConnections);
    console.log('   Salas ativas:', statusResponse.data.data.totalRooms);
  } catch (error) {
    console.log('❌ Erro ao verificar status:', error.message);
  }

  // 4. Testar broadcast para a sala
  console.log('\n4️⃣ Testando broadcast para a sala...');
  try {
    const broadcastData = {
      eventType: 'PAYMENT_UPDATE',
      message: 'Pagamento processado com sucesso via API!',
      idSeguro: 'seguro_789'
    };

    const broadcastResponse = await axios.post(
      `${BASE_URL}/api/message/room/test-room-123/broadcast`,
      broadcastData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Broadcast enviado com sucesso!');
    console.log('   Clientes que receberam:', broadcastResponse.data.data.sentToClients);
    console.log('   Evento:', broadcastResponse.data.data.eventType);
    console.log('   Mensagem:', broadcastResponse.data.data.message);
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Sala não encontrada - verifique se o WebSocket está conectado');
    } else {
      console.log('❌ Erro no broadcast:', error.response?.data || error.message);
    }
  }

  // 5. Testar broadcast para sala inexistente
  console.log('\n5️⃣ Testando broadcast para sala inexistente...');
  try {
    const broadcastData = {
      eventType: 'PAYMENT_UPDATE',
      message: 'Esta mensagem não deve ser enviada',
      idSeguro: 'seguro_999'
    };

    await axios.post(
      `${BASE_URL}/api/message/room/sala-inexistente/broadcast`,
      broadcastData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('❌ Erro: broadcast foi aceito para sala inexistente');
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correto: broadcast rejeitado para sala inexistente');
      console.log('   Erro:', error.response.data.error);
    } else {
      console.log('❌ Erro inesperado:', error.response?.data || error.message);
    }
  }

  // 6. Testar validação de campos obrigatórios
  console.log('\n6️⃣ Testando validação de campos obrigatórios...');
  try {
    const invalidData = {
      eventType: 'PAYMENT_UPDATE'
      // Faltando message e idSeguro
    };

    await axios.post(
      `${BASE_URL}/api/message/room/test-room-123/broadcast`,
      invalidData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('❌ Erro: broadcast aceito sem campos obrigatórios');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correto: broadcast rejeitado por campos obrigatórios faltando');
      console.log('   Erro:', error.response.data.error);
    } else {
      console.log('❌ Erro inesperado:', error.response?.data || error.message);
    }
  }

  // 7. Fechar conexão
  console.log('\n7️⃣ Fechando conexão WebSocket...');
  ws.close();
  console.log('✅ Teste completo finalizado!');

  // Aguardar um pouco antes de finalizar
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Executar teste
testeCompleto().catch(console.error);
