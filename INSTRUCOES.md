# 📋 Instruções de Uso - WebSocket Payment Server

## 🚀 Como Executar o Projeto

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Compilação do TypeScript
```bash
npm run build
```

### 3. Execução do Servidor
```bash
# Desenvolvimento (com ts-node)
npm run dev

# Produção
npm start

# Modo watch (recompilação automática)
npm run watch
```

## 🧪 Como Testar

### Opção 1: Cliente HTML (Recomendado)
1. Abra o arquivo `test-client.html` no navegador
2. Os dispositivos serão conectados automaticamente
3. Use os botões para simular eventos do fluxo de pagamento

### Opção 2: Cliente Node.js
```bash
node exemplos/cliente-simples.js
```

### Opção 3: wscat (CLI)
```bash
# Instalar wscat globalmente
npm install -g wscat

# Conectar ao servidor
wscat -c ws://localhost:8080

# Enviar evento de teste
{"type":"JOIN_ROOM","payload":{"roomId":"test_room","deviceId":"test_device"}}
```

## 📡 Como Integrar

### Estrutura dos Eventos

Todos os eventos seguem este formato:
```json
{
  "type": "NOME_DO_EVENTO",
  "payload": {
    "roomId": "id_da_sala",
    "deviceId": "id_do_dispositivo",
    // ... outros dados específicos do evento
  }
}
```

### Eventos do Dispositivo 1 (Gerador do Link)

#### JOIN_ROOM
```json
{
  "type": "JOIN_ROOM",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_1"
  }
}
```

### Eventos do Dispositivo 2 (Processador do Pagamento)

#### ENTERED_SUMMARY
```json
{
  "type": "ENTERED_SUMMARY",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2"
  }
}
```

#### CLICKED_PROCEED
```json
{
  "type": "CLICKED_PROCEED",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2"
  }
}
```

#### PAYMENT_METHOD_CHANGED
```json
{
  "type": "PAYMENT_METHOD_CHANGED",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2",
    "method": "cartão de crédito"
  }
}
```

#### DATA_FILLED
```json
{
  "type": "DATA_FILLED",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2",
    "fields": ["nome", "email", "cpf", "cartão"]
  }
}
```

#### CLICKED_PAY
```json
{
  "type": "CLICKED_PAY",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2"
  }
}
```

#### PAYMENT_SUCCESS
```json
{
  "type": "PAYMENT_SUCCESS",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2",
    "transactionId": "tx_123456789",
    "amount": 99.90
  }
}
```

#### PAYMENT_ERROR
```json
{
  "type": "PAYMENT_ERROR",
  "payload": {
    "roomId": "payment_123",
    "deviceId": "device_2",
    "error": "Cartão recusado",
    "code": "CARD_DECLINED"
  }
}
```

## 🔧 Configuração

### Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 8080)
- `NODE_ENV`: Ambiente (development/production)

### Exemplo
```bash
PORT=3000 NODE_ENV=production npm start
```

## 📊 Monitoramento

O servidor fornece logs detalhados:

- `[INFO]` - Informações gerais
- `[WARN]` - Avisos
- `[ERROR]` - Erros
- `[DEBUG]` - Informações de debug (apenas em development)

### Exemplo de Logs
```
[INFO] 2024-01-15T10:30:00.000Z - Servidor WebSocket iniciado na porta 8080
[INFO] 2024-01-15T10:30:05.000Z - Cliente client_123 conectado à sala payment_123
[DEBUG] 2024-01-15T10:30:10.000Z - Evento ENTERED_SUMMARY recebido na sala payment_123
[INFO] 2024-01-15T10:30:10.000Z - Usuário device_2 entrou na tela de resumo (sala payment_123)
```

## 🔒 Segurança

- Validação de eventos recebidos
- Isolamento de salas por ID único
- Tratamento robusto de erros
- Limpeza automática de recursos

## 📈 Escalabilidade

- Gerenciamento eficiente de memória
- Limpeza automática de salas vazias (a cada 5 minutos)
- Logs de estatísticas (a cada 10 minutos)
- Estrutura modular para fácil extensão

## 🐛 Solução de Problemas

### Servidor não inicia
1. Verifique se a porta 8080 está livre
2. Execute `npm install` para instalar dependências
3. Execute `npm run build` para compilar

### Cliente não conecta
1. Verifique se o servidor está rodando
2. Confirme a URL: `ws://localhost:8080`
3. Verifique se não há firewall bloqueando

### Eventos não são recebidos
1. Verifique se ambos os dispositivos estão na mesma sala
2. Confirme se o `roomId` é idêntico
3. Verifique os logs do servidor para erros

## 📝 Exemplos de Integração

### JavaScript/Node.js
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'JOIN_ROOM',
    payload: {
      roomId: 'payment_123',
      deviceId: 'device_1'
    }
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  console.log('Evento recebido:', event);
});
```

### Browser JavaScript
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
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
  console.log('Evento recebido:', data);
};
```

## 🎯 Fluxo Típico de Uso

1. **Dispositivo 1** se conecta e envia `JOIN_ROOM`
2. **Dispositivo 2** se conecta e envia `ENTERED_SUMMARY`
3. **Dispositivo 2** envia eventos conforme o usuário progride:
   - `CLICKED_PROCEED`
   - `PAYMENT_METHOD_CHANGED`
   - `DATA_FILLED`
   - `CLICKED_PAY`
4. **Dispositivo 2** envia resultado final:
   - `PAYMENT_SUCCESS` ou `PAYMENT_ERROR`
5. **Dispositivo 1** recebe todos os eventos em tempo real

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Teste com o cliente HTML fornecido
3. Execute o exemplo Node.js
4. Abra uma issue no repositório

---

**🎉 Parabéns! Seu servidor WebSocket está funcionando perfeitamente!** 