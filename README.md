# WebSocket Payment Server

Um servidor WebSocket robusto e modular para comunicação em tempo real entre dispositivos envolvidos no fluxo de pagamento.

## 🎯 Descrição

Este servidor WebSocket é responsável por intermediar a comunicação em tempo real entre dois dispositivos:

- **Dispositivo 1**: Gera o link de pagamento e se conecta ao servidor para receber atualizações
- **Dispositivo 2**: Acessa o link e envia eventos de progresso do fluxo de pagamento

O servidor cria salas de comunicação exclusivas baseadas no ID do pagamento, permitindo que ambos os dispositivos se comuniquem de forma segura e isolada.

## 🚀 Funcionalidades

- ✅ Comunicação em tempo real via WebSocket
- ✅ Salas isoladas por ID de pagamento
- ✅ Suporte a múltiplos eventos do fluxo de pagamento
- ✅ Tipagem forte com TypeScript
- ✅ Logs detalhados para monitoramento
- ✅ Limpeza automática de salas vazias
- ✅ Tratamento robusto de erros
- ✅ Desligamento gracioso

## 📦 Eventos Suportados

### Dispositivo 1 (Gerador do Link)
- `JOIN_ROOM` - Entra na sala de comunicação

### Dispositivo 2 (Processador do Pagamento)
- `ENTERED_SUMMARY` - Entrou na tela de resumo
- `CLICKED_PROCEED` - Clicou em "prosseguir"
- `PAYMENT_METHOD_CHANGED` - Alterou método de pagamento
- `DATA_FILLED` - Preencheu todos os dados
- `CLICKED_PAY` - Clicou em "pagar"
- `PAYMENT_SUCCESS` - Pagamento bem-sucedido
- `PAYMENT_ERROR` - Erro no pagamento

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd ws-payment-server
```

2. Instale as dependências:
```bash
npm install
```

3. Compile o projeto:
```bash
npm run build
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Modo Watch (recompilação automática)
```bash
npm run watch
```

## 🔧 Configuração

### Variáveis de Ambiente

- `PORT` - Porta do servidor (padrão: 8080)
- `NODE_ENV` - Ambiente de execução (development/production)

### Exemplo
```bash
PORT=3000 NODE_ENV=production npm start
```

## 📡 Uso da API

### Endpoints HTTP

O servidor agora possui endpoints HTTP para integração com APIs externas:

#### GET /api/server/status
Retorna o status atual do servidor:
```bash
curl http://localhost:8080/api/server/status
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "uptime": 3600000,
    "totalConnections": 5,
    "totalRooms": 2,
    "timestamp": 1705312200000,
    "version": "1.0.0"
  },
  "timestamp": 1705312200000
}
```

#### POST /api/message/room/:roomId/broadcast
Envia uma mensagem para todos os clientes em uma sala específica:
```bash
curl -X POST http://localhost:8080/api/message/room/payment_123/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PAYMENT_UPDATE",
    "message": "Pagamento processado com sucesso!",
    "idSeguro": "seguro_123456"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "roomId": "payment_123",
    "eventType": "PAYMENT_UPDATE",
    "message": "Pagamento processado com sucesso!",
    "idSeguro": "seguro_123456",
    "sentToClients": 2,
    "timestamp": 1705312200000
  },
  "timestamp": 1705312200000
}
```

#### GET /health
Health check simples:
```bash
curl http://localhost:8080/health
```

#### GET /
Informações gerais da API:
```bash
curl http://localhost:8080/
```

### Conexão WebSocket

Conecte-se ao servidor via WebSocket:
```
ws://localhost:8080
```

### Exemplo de Evento - Dispositivo 1

```json
{
  "type": "JOIN_ROOM",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_1"
  }
}
```

### Exemplo de Evento - Dispositivo 2

```json
{
  "type": "ENTERED_SUMMARY",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2"
  }
}
```

### Exemplo de Pagamento Bem-sucedido

```json
{
  "type": "PAYMENT_SUCCESS",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2",
    "transactionId": "tx_456789",
    "amount": 99.90
  }
}
```

## 🏗️ Estrutura do Projeto

```
ws-payment-server/
├── src/
│   ├── app.ts              # Ponto de entrada
│   ├── server.ts           # Servidor HTTP + WebSocket
│   ├── rooms.ts            # Gerenciamento de salas
│   ├── events.ts           # Enum e tipos de eventos
│   ├── handlers/
│   │   └── paymentFlow.ts  # Handlers dos eventos
│   ├── types/
│   │   └── index.ts        # Tipagens globais
│   └── utils/
│       └── logger.ts       # Sistema de logs
├── dist/                   # Código compilado
├── package.json
├── tsconfig.json
└── README.md
```

## 🔍 Monitoramento

O servidor fornece logs detalhados para monitoramento:

- Conexões e desconexões de clientes
- Eventos processados
- Erros e exceções
- Estatísticas do servidor
- Limpeza automática de salas

### Exemplo de Logs

```
[INFO] 2024-01-15T10:30:00.000Z - Servidor WebSocket iniciado na porta 8080
[INFO] 2024-01-15T10:30:05.000Z - Cliente client_1705312205000_abc123 conectado à sala payment_123
[DEBUG] 2024-01-15T10:30:10.000Z - Evento ENTERED_SUMMARY recebido na sala payment_123 do cliente client_1705312205000_abc123
[INFO] 2024-01-15T10:30:10.000Z - Usuário device_2 entrou na tela de resumo (sala payment_123)
```

## 🧪 Testando

### Teste Básico com wscat

1. Instale o wscat:
```bash
npm install -g wscat
```

2. Conecte-se ao servidor:
```bash
wscat -c ws://localhost:8080
```

3. Envie um evento de teste:
```json
{"type":"JOIN_ROOM","payload":{"roomId":"test_room","deviceId":"test_device"}}
```

### Teste com Cliente JavaScript

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Conectado ao servidor');
  
  // Entrar na sala
  ws.send(JSON.stringify({
    type: 'JOIN_ROOM',
    payload: {
      roomId: 'payment_123',
      deviceId: 'device_1'
    }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Mensagem recebida:', data);
};
```

## 🔒 Segurança

- Validação de eventos recebidos
- Isolamento de salas por ID único
- Tratamento de erros robusto
- Limpeza automática de recursos

## 📈 Escalabilidade

O servidor foi projetado para ser escalável:

- Gerenciamento eficiente de memória
- Limpeza automática de salas vazias
- Estrutura modular para fácil extensão
- Logs para monitoramento de performance

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🆘 Suporte

Para dúvidas ou problemas, abra uma issue no repositório. 