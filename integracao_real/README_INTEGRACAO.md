# Integração WebSocket no React - Device 1

## 📋 Visão Geral

Esta integração permite que seu componente React (`componenteDePagamento.tsx`) funcione como **Device 1**, conectando-se ao servidor WebSocket e recebendo eventos em tempo real do **Device 2** (cliente que acessa o link de pagamento).

## 🚀 Como Funciona

### 1. **Hook Customizado (`useWebSocket.ts`)**
- Gerencia toda a lógica de conexão WebSocket
- Reconexão automática em caso de falha
- Processamento de eventos recebidos
- Estados de conexão (conectando, conectado, erro)

### 2. **Componente Integrado (`componenteDePagamento.tsx`)**
- Conecta automaticamente quando o modal abre
- Desconecta quando o modal fecha
- Exibe status da conexão em tempo real
- Mostra lista de eventos do Device 2
- Processa eventos específicos (pagamento, erros, etc.)

## 🔧 Configuração

### 1. **URL do Servidor WebSocket**
```typescript
const WS_URL = 'ws://localhost:8080'; // Ajuste para sua URL
const ROOM_ID = 'pay_123'; // ID da sala de pagamento
```

### 2. **Dependências Necessárias**
Certifique-se de que seu projeto React tem as dependências necessárias:
```bash
npm install react-icons
# Outras dependências já devem estar no seu projeto
```

## 📱 Funcionalidades Implementadas

### **Status da Conexão**
- ✅ Conectado (verde)
- 🔄 Conectando (azul com spinner)
- ❌ Desconectado (vermelho)
- ⚠️ Erro de conexão

### **Eventos do Device 2 Processados**
- `ENTERED_SUMMARY` - Entrou na tela de resumo
- `CLICKED_PROCEED` - Clicou em prosseguir
- `CHANGED_PAYMENT_METHOD` - Alterou método de pagamento
- `FILLED_ALL_DATA` - Preencheu todos os dados
- `CLICKED_PAY` - Clicou em pagar
- `PAYMENT_SUCCESS` - Pagamento realizado com sucesso
- `PAYMENT_ERROR` - Erro no pagamento

### **Interface Visual**
- **Indicador de Status**: Mostra se está conectado ao servidor
- **Lista de Atividades**: Exibe eventos recebidos do Device 2
- **Logs no Console**: Para debugging e monitoramento

## 🎯 Como Usar

### 1. **Iniciar o Servidor WebSocket**
```bash
cd ws-payment-server
npm run dev
```

### 2. **Usar o Componente**
```tsx
import ExternalPayLink from './integracao_real/componenteDePagamento';

// No seu componente pai
<ExternalPayLink 
  setPaymentStates={setPaymentStates}
  paymentStates={paymentStates}
/>
```

### 3. **Testar a Integração**
1. Abra o modal de pagamento (Device 1)
2. Use o `test-client.html` ou `exemplos/cliente-simples.js` como Device 2
3. Envie eventos do Device 2 e veja aparecerem no Device 1

## 🔄 Fluxo de Funcionamento

```
1. Usuário abre modal → WebSocket conecta → Entra na sala 'pay_123'
2. Device 2 acessa link → Conecta na mesma sala
3. Device 2 envia eventos → Servidor transmite → Device 1 recebe
4. Device 1 processa eventos → Atualiza interface → Mostra progresso
5. Modal fecha → WebSocket desconecta
```

## 🛠️ Personalização

### **Modificar Eventos Processados**
```typescript
onDevice2Event: (event) => {
  switch (event.type) {
    case 'PAYMENT_SUCCESS':
      // Sua lógica personalizada
      break;
    case 'CUSTOM_EVENT':
      // Novo evento
      break;
  }
}
```

### **Adicionar Novos Estados**
```typescript
const [customState, setCustomState] = useState(null);

// No onDevice2Event
case 'CUSTOM_EVENT':
  setCustomState(event.payload);
  break;
```

### **Modificar URL do Servidor**
```typescript
const WS_URL = 'ws://seu-servidor.com:8080';
const ROOM_ID = 'seu-room-id';
```

## 🐛 Debugging

### **Logs no Console**
- `🔌 WebSocket: Conectando...` - Tentativa de conexão
- `✅ WebSocket: Conectado com sucesso` - Conexão estabelecida
- `📥 WebSocket: Evento recebido:` - Evento do Device 2
- `📱 WebSocket: Evento do Device 2:` - Processamento específico

### **Verificar Status**
- Abra o DevTools do navegador
- Veja os logs no console
- Verifique o indicador visual no modal

## 🔒 Segurança

### **Recomendações**
- Use HTTPS/WSS em produção
- Implemente autenticação se necessário
- Valide eventos recebidos
- Limite reconexões automáticas

### **Configuração de Produção**
```typescript
const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://seu-servidor.com' 
  : 'ws://localhost:8080';
```

## 📚 Próximos Passos

1. **Teste a integração** com o servidor rodando
2. **Personalize os eventos** conforme sua necessidade
3. **Implemente autenticação** se necessário
4. **Adicione mais estados** para melhor UX
5. **Configure para produção** com WSS

## ❓ FAQ

**Q: O WebSocket não conecta?**
A: Verifique se o servidor está rodando na porta correta e se a URL está correta.

**Q: Não recebo eventos do Device 2?**
A: Certifique-se de que ambos estão na mesma sala (`roomId`) e que o Device 2 está enviando eventos válidos.

**Q: Como adicionar novos tipos de eventos?**
A: Adicione o novo tipo no `useWebSocket.ts` e processe no `onDevice2Event`.

**Q: O componente reconecta automaticamente?**
A: Sim, até 5 tentativas com delay exponencial.

---

## 🎉 Resultado Final

Com esta integração, seu componente React agora:
- ✅ Conecta automaticamente ao WebSocket
- ✅ Recebe eventos em tempo real do Device 2
- ✅ Mostra progresso visual do pagamento
- ✅ Processa eventos específicos (sucesso, erro, etc.)
- ✅ Reconecta automaticamente em caso de falha
- ✅ Limpa recursos ao fechar o modal

**Pronto para uso em produção! 🚀** 