# 🌐 API HTTP - WebSocket Payment Server

Este documento descreve os endpoints HTTP disponíveis para integração com APIs externas.

## 📋 Endpoints Disponíveis

### 1. GET /api/server/status

Retorna o status atual do servidor com estatísticas em tempo real.

**URL:** `GET http://localhost:8080/api/server/status`

**Resposta de Sucesso (200):**
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

**Campos da Resposta:**
- `status`: Status do servidor ("running" ou "stopped")
- `uptime`: Tempo de atividade em milissegundos
- `totalConnections`: Número total de clientes conectados
- `totalRooms`: Número total de salas ativas
- `timestamp`: Timestamp da resposta
- `version`: Versão do servidor

---

### 2. POST /api/message/room/:roomId/broadcast

Envia uma mensagem para todos os clientes conectados em uma sala específica.

**URL:** `POST http://localhost:8080/api/message/room/{roomId}/broadcast`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "eventType": "PAYMENT_UPDATE",
  "message": "Pagamento processado com sucesso!",
  "idSeguro": "seguro_123456"
}
```

**Parâmetros Obrigatórios:**
- `eventType`: Tipo do evento (string)
- `message`: Mensagem a ser enviada (string)
- `idSeguro`: ID de segurança (string)

**Resposta de Sucesso (200):**
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

**Resposta de Erro (400) - Campos obrigatórios faltando:**
```json
{
  "success": false,
  "error": "Campos obrigatórios: eventType, message, idSeguro",
  "timestamp": 1705312200000
}
```

**Resposta de Erro (404) - Sala não encontrada:**
```json
{
  "success": false,
  "error": "Sala payment_123 não encontrada",
  "timestamp": 1705312200000
}
```

---

### 3. GET /health

Health check simples para monitoramento.

**URL:** `GET http://localhost:8080/health`

**Resposta (200):**
```json
{
  "status": "ok",
  "timestamp": 1705312200000
}
```

---

### 4. GET /

Informações gerais da API e endpoints disponíveis.

**URL:** `GET http://localhost:8080/`

**Resposta (200):**
```json
{
  "message": "WebSocket Payment Server está rodando!",
  "endpoints": {
    "status": "/api/server/status",
    "broadcast": "/api/message/room/:roomId/broadcast",
    "health": "/health"
  },
  "timestamp": 1705312200000
}
```

## 🔧 Exemplos de Uso

### Exemplo com cURL

#### Verificar status do servidor:
```bash
curl http://localhost:8080/api/server/status
```

#### Enviar broadcast para uma sala:
```bash
curl -X POST http://localhost:8080/api/message/room/payment_123/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PAYMENT_UPDATE",
    "message": "Pagamento processado com sucesso!",
    "idSeguro": "seguro_123456"
  }'
```

### Exemplo com JavaScript/Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Verificar status
async function checkServerStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/api/server/status`);
    console.log('Status:', response.data);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

// Enviar broadcast
async function sendBroadcast(roomId, eventType, message, idSeguro) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/message/room/${roomId}/broadcast`,
      {
        eventType,
        message,
        idSeguro
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Broadcast enviado:', response.data);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

// Uso
checkServerStatus();
sendBroadcast('payment_123', 'PAYMENT_UPDATE', 'Pagamento aprovado!', 'seguro_789');
```

### Exemplo com Python

```python
import requests
import json

BASE_URL = 'http://localhost:8080'

# Verificar status
def check_server_status():
    try:
        response = requests.get(f'{BASE_URL}/api/server/status')
        print('Status:', response.json())
    except Exception as e:
        print('Erro:', str(e))

# Enviar broadcast
def send_broadcast(room_id, event_type, message, id_seguro):
    try:
        data = {
            'eventType': event_type,
            'message': message,
            'idSeguro': id_seguro
        }
        response = requests.post(
            f'{BASE_URL}/api/message/room/{room_id}/broadcast',
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        print('Broadcast enviado:', response.json())
    except Exception as e:
        print('Erro:', str(e))

# Uso
check_server_status()
send_broadcast('payment_123', 'PAYMENT_UPDATE', 'Pagamento aprovado!', 'seguro_789')
```

## 🚨 Tratamento de Erros

Todos os endpoints retornam respostas padronizadas:

### Estrutura de Sucesso:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1705312200000
}
```

### Estrutura de Erro:
```json
{
  "success": false,
  "error": "Descrição do erro",
  "timestamp": 1705312200000
}
```

### Códigos de Status HTTP:
- `200`: Sucesso
- `400`: Erro de validação (campos obrigatórios faltando)
- `404`: Recurso não encontrado (sala inexistente)
- `500`: Erro interno do servidor

## 🔒 Segurança

- Todos os endpoints aceitam requisições CORS
- Validação de campos obrigatórios
- Sanitização de dados de entrada
- Logs detalhados para auditoria

## 📊 Monitoramento

Os endpoints são monitorados através de logs:
- Requisições recebidas
- Respostas enviadas
- Erros e exceções
- Performance e tempo de resposta

## 🧪 Testando

Use o arquivo `exemplos/teste-api.js` para testar todos os endpoints:

```bash
node exemplos/teste-api.js
```

Certifique-se de que o servidor está rodando antes de executar os testes.
