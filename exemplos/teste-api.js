const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testApiEndpoints() {
  console.log('🧪 Testando endpoints da API HTTP...\n');

  try {
    // 1. Testar status do servidor
    console.log('1️⃣ Testando GET /api/server/status');
    const statusResponse = await axios.get(`${BASE_URL}/api/server/status`);
    console.log('✅ Status do servidor:', statusResponse.data);
    console.log('');

    // 2. Testar broadcast para uma sala (vai falhar se a sala não existir)
    console.log('2️⃣ Testando POST /api/message/room/test-room/broadcast');
    const broadcastData = {
      eventType: 'PAYMENT_UPDATE',
      message: 'Pagamento processado com sucesso!',
      idSeguro: 'seguro_123456'
    };

    try {
      const broadcastResponse = await axios.post(
        `${BASE_URL}/api/message/room/test-room/broadcast`,
        broadcastData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Broadcast enviado:', broadcastResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Sala não encontrada (esperado se não há clientes conectados)');
        console.log('   Resposta:', error.response.data);
      } else {
        console.log('❌ Erro no broadcast:', error.response?.data || error.message);
      }
    }
    console.log('');

    // 3. Testar health check
    console.log('3️⃣ Testando GET /health');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // 4. Testar endpoint raiz
    console.log('4️⃣ Testando GET /');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Endpoint raiz:', rootResponse.data);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Certifique-se de que o servidor está rodando na porta 8080');
    }
  }
}

// Executar testes
testApiEndpoints();
