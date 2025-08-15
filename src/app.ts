import { WebSocketServer } from './server';
import { Logger } from './utils/logger';

// Configuração do servidor
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IMAGE_VERSION = '1.0.0';

// Configurar tratamento de sinais para desligamento gracioso
process.on('SIGINT', () => {
  Logger.info('Recebido sinal SIGINT, desligando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.info('Recebido sinal SIGTERM, desligando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  Logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Função principal
function main(): void {
  try {
    Logger.info('Iniciando WebSocket Payment Server...');
    Logger.info(`Ambiente: ${NODE_ENV}`);
    Logger.info(`Porta: ${PORT}`);

    // Criar e iniciar o servidor
    const server = new WebSocketServer(PORT);

    Logger.info('✅ Servidor WebSocket iniciado com sucesso!');
    Logger.info(`           Versão: ${IMAGE_VERSION}           `);
    Logger.info('📡 Aguardando conexões...');
    Logger.info('');
    Logger.info('📋 Eventos suportados:');
    Logger.info('   • JOIN_ROOM - Dispositivo 1 entra na sala');
    Logger.info('   • ENTERED_SUMMARY - Usuário entrou na tela de resumo');
    Logger.info('   • CLICKED_PROCEED - Usuário clicou em "prosseguir"');
    Logger.info('   • PAYMENT_METHOD_CHANGED - Método de pagamento alterado');
    Logger.info('   • DATA_FILLED - Dados preenchidos');
    Logger.info('   • CLICKED_PAY - Usuário clicou em "pagar"');
    Logger.info('   • PAYMENT_SUCCESS - Pagamento bem-sucedido');
    Logger.info('   • PAYMENT_ERROR - Erro no pagamento');
    Logger.info('');
    Logger.info('🔗 Para testar, conecte-se via WebSocket em:');
    Logger.info(`   ws://localhost:${PORT}`);
    Logger.info('');
    Logger.info('🌐 Endpoints HTTP disponíveis:');
    Logger.info(`   • GET  http://localhost:${PORT}/api/server/status - Status do servidor`);
    Logger.info(`   • POST http://localhost:${PORT}/api/message/room/:roomId/broadcast - Broadcast para sala`);
    Logger.info(`   • GET  http://localhost:${PORT}/health - Health check`);
    Logger.info(`   • GET  http://localhost:${PORT}/ - Informações da API`);

  } catch (error) {
    Logger.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Executar função principal
if (require.main === module) {
  main();
}

export { WebSocketServer };