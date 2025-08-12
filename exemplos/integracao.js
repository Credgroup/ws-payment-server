// Exemplos de integração com o WebSocket Payment Server
// Este arquivo contém exemplos de como conectar e usar o servidor em diferentes contextos

// ============================================================================
// EXEMPLO 1: JavaScript/Node.js (Cliente)
// ============================================================================

const WebSocket = require('ws');

class PaymentWebSocketClient {
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
      
      // Se for device1, entrar na sala automaticamente
      if (deviceType === 'device1') {
        this.joinRoom();
      }
    });

    this.ws.on('message', (data) => {
      const event = JSON.parse(data);
      this.handleMessage(event);
    });

    this.ws.on('close', () => {
      console.log(`❌ ${deviceType} desconectado do servidor`);
    });

    this.ws.on('error', (error) => {
      console.error(`Erro na conexão ${deviceType}:`, error);
    });
  }

  joinRoom() {
    if (this.deviceType !== 'device1') {
      console.error('Apenas device1 pode entrar na sala');
      return;
    }

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
    if (this.deviceType !== 'device2') {
      console.error('Apenas device2 pode enviar eventos de pagamento');
      return;
    }

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
      console.log(`📤 Enviado: ${event.type}`);
    } else {
      console.error('WebSocket não está conectado');
    }
  }

  handleMessage(event) {
    console.log(`📨 Recebido: ${event.type}`, event);
    
    // Aqui você pode implementar a lógica específica para cada tipo de evento
    switch (event.type) {
      case 'CONNECTION_ESTABLISHED':
        console.log('Conexão estabelecida com sucesso');
        break;
      case 'ROOM_JOINED':
        console.log('Entrou na sala com sucesso');
        break;
      case 'ENTERED_SUMMARY':
        console.log('Usuário entrou na tela de resumo');
        break;
      case 'PAYMENT_SUCCESS':
        console.log('Pagamento realizado com sucesso!');
        break;
      case 'PAYMENT_ERROR':
        console.log('Erro no pagamento:', event.payload.error);
        break;
      default:
        console.log('Evento não tratado:', event.type);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// ============================================================================
// EXEMPLO 2: Uso do Cliente
// ============================================================================

// Exemplo de uso para Device 1 (Gerador do Link)
function exemploDevice1() {
  const client = new PaymentWebSocketClient();
  
  client.connect('device1', 'device_1', 'payment_123');
  
  // Device 1 apenas recebe eventos, não envia eventos de pagamento
  // Ele será notificado quando o Device 2 enviar eventos
}

// Exemplo de uso para Device 2 (Processador do Pagamento)
function exemploDevice2() {
  const client = new PaymentWebSocketClient();
  
  client.connect('device2', 'device_2', 'payment_123');
  
  // Simular fluxo de pagamento
  setTimeout(() => {
    client.sendPaymentEvent('ENTERED_SUMMARY');
  }, 1000);
  
  setTimeout(() => {
    client.sendPaymentEvent('CLICKED_PROCEED');
  }, 2000);
  
  setTimeout(() => {
    client.sendPaymentEvent('PAYMENT_METHOD_CHANGED', { method: 'cartão de crédito' });
  }, 3000);
  
  setTimeout(() => {
    client.sendPaymentEvent('DATA_FILLED', { fields: ['nome', 'email', 'cpf', 'cartão'] });
  }, 4000);
  
  setTimeout(() => {
    client.sendPaymentEvent('CLICKED_PAY');
  }, 5000);
  
  setTimeout(() => {
    client.sendPaymentEvent('PAYMENT_SUCCESS', { 
      transactionId: 'tx_' + Date.now(),
      amount: 99.90
    });
  }, 6000);
}

// ============================================================================
// EXEMPLO 3: Browser JavaScript
// ============================================================================

/*
// Para usar no navegador, substitua o require por:
// const WebSocket = window.WebSocket;

class BrowserPaymentClient {
  constructor(serverUrl = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.roomId = null;
    this.deviceId = null;
    this.deviceType = null;
    this.onMessageCallback = null;
  }

  connect(deviceType, deviceId, roomId, onMessage) {
    this.deviceType = deviceType;
    this.deviceId = deviceId;
    this.roomId = roomId;
    this.onMessageCallback = onMessage;

    this.ws = new WebSocket(this.serverUrl);

    this.ws.onopen = () => {
      console.log(`${deviceType} conectado`);
      if (deviceType === 'device1') {
        this.joinRoom();
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    };

    this.ws.onclose = () => {
      console.log(`${deviceType} desconectado`);
    };
  }

  // ... resto dos métodos iguais ao exemplo anterior
}

// Uso no navegador:
const client = new BrowserPaymentClient();
client.connect('device1', 'device_1', 'payment_123', (event) => {
  console.log('Evento recebido:', event);
});
*/

// ============================================================================
// EXEMPLO 4: Python (usando websockets)
// ============================================================================

/*
import asyncio
import websockets
import json

class PythonPaymentClient:
    def __init__(self, server_url="ws://localhost:8080"):
        self.server_url = server_url
        self.websocket = None
        self.room_id = None
        self.device_id = None
        self.device_type = None

    async def connect(self, device_type, device_id, room_id):
        self.device_type = device_type
        self.device_id = device_id
        self.room_id = room_id
        
        self.websocket = await websockets.connect(self.server_url)
        print(f"✅ {device_type} conectado ao servidor")
        
        if device_type == "device1":
            await self.join_room()
        
        # Iniciar loop de recebimento de mensagens
        await self.receive_messages()

    async def join_room(self):
        event = {
            "type": "JOIN_ROOM",
            "payload": {
                "roomId": self.room_id,
                "deviceId": self.device_id
            }
        }
        await self.send_event(event)

    async def send_payment_event(self, event_type, additional_data=None):
        if additional_data is None:
            additional_data = {}
            
        event = {
            "type": event_type,
            "payload": {
                "roomId": self.room_id,
                "deviceId": self.device_id,
                **additional_data
            }
        }
        await self.send_event(event)

    async def send_event(self, event):
        if self.websocket:
            await self.websocket.send(json.dumps(event))
            print(f"📤 Enviado: {event['type']}")

    async def receive_messages(self):
        try:
            async for message in self.websocket:
                event = json.loads(message)
                print(f"📨 Recebido: {event['type']}", event)
        except websockets.exceptions.ConnectionClosed:
            print("Conexão fechada")

# Uso em Python:
# async def main():
#     client = PythonPaymentClient()
#     await client.connect("device1", "device_1", "payment_123")
# 
# asyncio.run(main())
*/

// ============================================================================
// EXEMPLO 5: PHP (usando Ratchet)
// ============================================================================

/*
<?php
require 'vendor/autoload.php';

use Ratchet\Client\WebSocket;
use Ratchet\Client\Connector;

class PhpPaymentClient {
    private $connector;
    private $websocket;
    private $roomId;
    private $deviceId;
    private $deviceType;

    public function __construct() {
        $this->connector = new Connector();
    }

    public function connect($deviceType, $deviceId, $roomId) {
        $this->deviceType = $deviceType;
        $this->deviceId = $deviceId;
        $this->roomId = $roomId;

        $this->connector('ws://localhost:8080')->then(
            function (WebSocket $conn) {
                $this->websocket = $conn;
                echo "✅ {$this->deviceType} conectado ao servidor\n";
                
                if ($this->deviceType === 'device1') {
                    $this->joinRoom();
                }
                
                $conn->on('message', function($msg) {
                    $event = json_decode($msg, true);
                    echo "📨 Recebido: {$event['type']}\n";
                });
            },
            function (Exception $e) {
                echo "Erro de conexão: {$e->getMessage()}\n";
            }
        );
    }

    public function joinRoom() {
        $event = [
            'type' => 'JOIN_ROOM',
            'payload' => [
                'roomId' => $this->roomId,
                'deviceId' => $this->deviceId
            ]
        ];
        $this->sendEvent($event);
    }

    public function sendPaymentEvent($eventType, $additionalData = []) {
        $event = [
            'type' => $eventType,
            'payload' => array_merge([
                'roomId' => $this->roomId,
                'deviceId' => $this->deviceId
            ], $additionalData)
        ];
        $this->sendEvent($event);
    }

    private function sendEvent($event) {
        if ($this->websocket) {
            $this->websocket->send(json_encode($event));
            echo "📤 Enviado: {$event['type']}\n";
        }
    }
}

// Uso em PHP:
// $client = new PhpPaymentClient();
// $client->connect('device1', 'device_1', 'payment_123');
?>
*/

// ============================================================================
// EXEMPLO 6: C# (.NET)
// ============================================================================

/*
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class CSharpPaymentClient
{
    private ClientWebSocket webSocket;
    private string roomId;
    private string deviceId;
    private string deviceType;

    public async Task ConnectAsync(string deviceType, string deviceId, string roomId)
    {
        this.deviceType = deviceType;
        this.deviceId = deviceId;
        this.roomId = roomId;

        webSocket = new ClientWebSocket();
        await webSocket.ConnectAsync(new Uri("ws://localhost:8080"), CancellationToken.None);
        
        Console.WriteLine($"✅ {deviceType} conectado ao servidor");
        
        if (deviceType == "device1")
        {
            await JoinRoomAsync();
        }
        
        // Iniciar recebimento de mensagens
        _ = ReceiveMessagesAsync();
    }

    public async Task JoinRoomAsync()
    {
        var eventObj = new
        {
            type = "JOIN_ROOM",
            payload = new
            {
                roomId = this.roomId,
                deviceId = this.deviceId
            }
        };
        await SendEventAsync(eventObj);
    }

    public async Task SendPaymentEventAsync(string eventType, object additionalData = null)
    {
        var payload = new
        {
            roomId = this.roomId,
            deviceId = this.deviceId
        };
        
        if (additionalData != null)
        {
            // Merge additionalData with payload
        }
        
        var eventObj = new
        {
            type = eventType,
            payload = payload
        };
        await SendEventAsync(eventObj);
    }

    private async Task SendEventAsync(object eventObj)
    {
        var json = JsonConvert.SerializeObject(eventObj);
        var buffer = Encoding.UTF8.GetBytes(json);
        await webSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        Console.WriteLine($"📤 Enviado: {eventObj.GetType().GetProperty("type").GetValue(eventObj)}");
    }

    private async Task ReceiveMessagesAsync()
    {
        var buffer = new byte[1024];
        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var eventObj = JsonConvert.DeserializeObject<dynamic>(message);
                    Console.WriteLine($"📨 Recebido: {eventObj.type}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro: {ex.Message}");
        }
    }
}

// Uso em C#:
// var client = new CSharpPaymentClient();
// await client.ConnectAsync("device1", "device_1", "payment_123");
*/

// ============================================================================
// EXEMPLO 7: Java (usando Java WebSocket)
// ============================================================================

/*
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.java_websocket.framing.Framedata;
import java.net.URI;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class JavaPaymentClient extends WebSocketClient {
    private String roomId;
    private String deviceId;
    private String deviceType;
    private Gson gson = new Gson();

    public JavaPaymentClient(String deviceType, String deviceId, String roomId) {
        super(new URI("ws://localhost:8080"));
        this.deviceType = deviceType;
        this.deviceId = deviceId;
        this.roomId = roomId;
    }

    @Override
    public void onOpen(ServerHandshake handshakedata) {
        System.out.println("✅ " + deviceType + " conectado ao servidor");
        if ("device1".equals(deviceType)) {
            joinRoom();
        }
    }

    @Override
    public void onMessage(String message) {
        JsonObject event = gson.fromJson(message, JsonObject.class);
        System.out.println("📨 Recebido: " + event.get("type").getAsString());
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("❌ " + deviceType + " desconectado");
    }

    @Override
    public void onError(Exception ex) {
        System.err.println("Erro: " + ex.getMessage());
    }

    public void joinRoom() {
        JsonObject event = new JsonObject();
        event.addProperty("type", "JOIN_ROOM");
        
        JsonObject payload = new JsonObject();
        payload.addProperty("roomId", roomId);
        payload.addProperty("deviceId", deviceId);
        event.add("payload", payload);
        
        send(gson.toJson(event));
        System.out.println("📤 Enviado: JOIN_ROOM");
    }

    public void sendPaymentEvent(String eventType, JsonObject additionalData) {
        JsonObject event = new JsonObject();
        event.addProperty("type", eventType);
        
        JsonObject payload = new JsonObject();
        payload.addProperty("roomId", roomId);
        payload.addProperty("deviceId", deviceId);
        
        if (additionalData != null) {
            additionalData.entrySet().forEach(entry -> 
                payload.add(entry.getKey(), entry.getValue()));
        }
        
        event.add("payload", payload);
        send(gson.toJson(event));
        System.out.println("📤 Enviado: " + eventType);
    }
}

// Uso em Java:
// JavaPaymentClient client = new JavaPaymentClient("device1", "device_1", "payment_123");
// client.connect();
*/

// ============================================================================
// EXEMPLO 8: Go
// ============================================================================

/*
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/url"
    "time"

    "github.com/gorilla/websocket"
)

type PaymentEvent struct {
    Type    string                 `json:"type"`
    Payload map[string]interface{} `json:"payload"`
}

type GoPaymentClient struct {
    conn      *websocket.Conn
    roomID    string
    deviceID  string
    deviceType string
}

func NewGoPaymentClient(deviceType, deviceID, roomID string) *GoPaymentClient {
    return &GoPaymentClient{
        roomID:     roomID,
        deviceID:   deviceID,
        deviceType: deviceType,
    }
}

func (c *GoPaymentClient) Connect() error {
    u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: "/"}
    
    conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
    if err != nil {
        return err
    }
    
    c.conn = conn
    fmt.Printf("✅ %s conectado ao servidor\n", c.deviceType)
    
    if c.deviceType == "device1" {
        c.JoinRoom()
    }
    
    go c.receiveMessages()
    return nil
}

func (c *GoPaymentClient) JoinRoom() {
    event := PaymentEvent{
        Type: "JOIN_ROOM",
        Payload: map[string]interface{}{
            "roomId":   c.roomID,
            "deviceId": c.deviceID,
        },
    }
    c.sendEvent(event)
}

func (c *GoPaymentClient) SendPaymentEvent(eventType string, additionalData map[string]interface{}) {
    payload := map[string]interface{}{
        "roomId":   c.roomID,
        "deviceId": c.deviceID,
    }
    
    for k, v := range additionalData {
        payload[k] = v
    }
    
    event := PaymentEvent{
        Type:    eventType,
        Payload: payload,
    }
    c.sendEvent(event)
}

func (c *GoPaymentClient) sendEvent(event PaymentEvent) {
    data, _ := json.Marshal(event)
    err := c.conn.WriteMessage(websocket.TextMessage, data)
    if err != nil {
        log.Printf("Erro ao enviar mensagem: %v", err)
        return
    }
    fmt.Printf("📤 Enviado: %s\n", event.Type)
}

func (c *GoPaymentClient) receiveMessages() {
    for {
        _, message, err := c.conn.ReadMessage()
        if err != nil {
            log.Printf("Erro ao ler mensagem: %v", err)
            return
        }
        
        var event PaymentEvent
        json.Unmarshal(message, &event)
        fmt.Printf("📨 Recebido: %s\n", event.Type)
    }
}

func (c *GoPaymentClient) Close() {
    c.conn.Close()
}

// Uso em Go:
// func main() {
//     client := NewGoPaymentClient("device1", "device_1", "payment_123")
//     client.Connect()
//     
//     // Manter o programa rodando
//     select {}
// }
*/

// ============================================================================
// EXEMPLO 9: Ruby
// ============================================================================

/*
require 'websocket-client-simple'
require 'json'

class RubyPaymentClient
  def initialize(device_type, device_id, room_id)
    @device_type = device_type
    @device_id = device_id
    @room_id = room_id
    @ws = nil
  end

  def connect
    @ws = WebSocket::Client::Simple.connect 'ws://localhost:8080'

    @ws.on :message do |msg|
      event = JSON.parse(msg.data)
      puts "📨 Recebido: #{event['type']}"
    end

    @ws.on :open do
      puts "✅ #{@device_type} conectado ao servidor"
      join_room if @device_type == 'device1'
    end

    @ws.on :close do |e|
      puts "❌ #{@device_type} desconectado"
    end

    @ws.on :error do |e|
      puts "Erro: #{e}"
    end
  end

  def join_room
    event = {
      type: 'JOIN_ROOM',
      payload: {
        roomId: @room_id,
        deviceId: @device_id
      }
    }
    send_event(event)
  end

  def send_payment_event(event_type, additional_data = {})
    event = {
      type: event_type,
      payload: {
        roomId: @room_id,
        deviceId: @device_id
      }.merge(additional_data)
    }
    send_event(event)
  end

  private

  def send_event(event)
    @ws.send(JSON.generate(event))
    puts "📤 Enviado: #{event[:type]}"
  end
end

# Uso em Ruby:
# client = RubyPaymentClient.new('device1', 'device_1', 'payment_123')
# client.connect
# sleep 1
# client.send_payment_event('ENTERED_SUMMARY')
*/

// ============================================================================
// EXEMPLO 10: Kotlin (Android)
// ============================================================================

/*
import okhttp3.*
import okio.ByteString
import org.json.JSONObject

class KotlinPaymentClient(
    private val deviceType: String,
    private val deviceId: String,
    private val roomId: String
) {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient()

    fun connect() {
        val request = Request.Builder()
            .url("ws://localhost:8080")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                println("✅ $deviceType conectado ao servidor")
                if (deviceType == "device1") {
                    joinRoom()
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                val event = JSONObject(text)
                println("📨 Recebido: ${event.getString("type")}")
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                // Handle binary messages if needed
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                println("❌ $deviceType desconectado")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                println("Erro: ${t.message}")
            }
        })
    }

    fun joinRoom() {
        val event = JSONObject().apply {
            put("type", "JOIN_ROOM")
            put("payload", JSONObject().apply {
                put("roomId", roomId)
                put("deviceId", deviceId)
            })
        }
        sendEvent(event)
    }

    fun sendPaymentEvent(eventType: String, additionalData: JSONObject? = null) {
        val payload = JSONObject().apply {
            put("roomId", roomId)
            put("deviceId", deviceId)
        }
        
        additionalData?.let { data ->
            val keys = data.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                payload.put(key, data.get(key))
            }
        }

        val event = JSONObject().apply {
            put("type", eventType)
            put("payload", payload)
        }
        sendEvent(event)
    }

    private fun sendEvent(event: JSONObject) {
        webSocket?.send(event.toString())
        println("📤 Enviado: ${event.getString("type")}")
    }

    fun disconnect() {
        webSocket?.close(1000, "Disconnect")
    }
}

// Uso em Kotlin:
// val client = KotlinPaymentClient("device1", "device_1", "payment_123")
// client.connect()
*/

// ============================================================================
// EXEMPLO 11: Swift (iOS)
// ============================================================================

/*
import Foundation
import Network

class SwiftPaymentClient: NSObject, URLSessionWebSocketDelegate {
    private var webSocket: URLSessionWebSocketTask?
    private let deviceType: String
    private let deviceId: String
    private let roomId: String
    
    init(deviceType: String, deviceId: String, roomId: String) {
        self.deviceType = deviceType
        self.deviceId = deviceId
        self.roomId = roomId
        super.init()
    }
    
    func connect() {
        guard let url = URL(string: "ws://localhost:8080") else { return }
        
        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)
        webSocket = session.webSocketTask(with: url)
        webSocket?.resume()
        
        receiveMessage()
    }
    
    func joinRoom() {
        let payload: [String: Any] = [
            "roomId": roomId,
            "deviceId": deviceId
        ]
        
        let event: [String: Any] = [
            "type": "JOIN_ROOM",
            "payload": payload
        ]
        
        sendEvent(event)
    }
    
    func sendPaymentEvent(eventType: String, additionalData: [String: Any] = [:]) {
        var payload: [String: Any] = [
            "roomId": roomId,
            "deviceId": deviceId
        ]
        
        for (key, value) in additionalData {
            payload[key] = value
        }
        
        let event: [String: Any] = [
            "type": eventType,
            "payload": payload
        ]
        
        sendEvent(event)
    }
    
    private func sendEvent(_ event: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: event),
              let message = String(data: data, encoding: .utf8) else { return }
        
        let webSocketMessage = URLSessionWebSocketTask.Message.string(message)
        webSocket?.send(webSocketMessage) { error in
            if let error = error {
                print("Erro ao enviar: \(error)")
            } else {
                print("📤 Enviado: \(event["type"] ?? "")")
            }
        }
    }
    
    private func receiveMessage() {
        webSocket?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    if let data = text.data(using: .utf8),
                       let event = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                        print("📨 Recebido: \(event["type"] ?? "")")
                    }
                case .data(let data):
                    if let event = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                        print("📨 Recebido: \(event["type"] ?? "")")
                    }
                @unknown default:
                    break
                }
                self?.receiveMessage()
            case .failure(let error):
                print("Erro ao receber: \(error)")
            }
        }
    }
    
    // URLSessionWebSocketDelegate
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        print("✅ \(deviceType) conectado ao servidor")
        if deviceType == "device1" {
            joinRoom()
        }
    }
    
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
        print("❌ \(deviceType) desconectado")
    }
}

// Uso em Swift:
// let client = SwiftPaymentClient(deviceType: "device1", deviceId: "device_1", roomId: "payment_123")
// client.connect()
*/

// ============================================================================
// EXEMPLO 12: Flutter/Dart
// ============================================================================

/*
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class FlutterPaymentClient {
  WebSocketChannel? channel;
  final String deviceType;
  final String deviceId;
  final String roomId;

  FlutterPaymentClient({
    required this.deviceType,
    required this.deviceId,
    required this.roomId,
  });

  void connect() {
    channel = WebSocketChannel.connect(
      Uri.parse('ws://localhost:8080'),
    );

    channel!.stream.listen(
      (message) {
        final event = jsonDecode(message);
        print('📨 Recebido: ${event['type']}');
      },
      onError: (error) {
        print('Erro: $error');
      },
      onDone: () {
        print('❌ $deviceType desconectado');
      },
    );

    print('✅ $deviceType conectado ao servidor');
    
    if (deviceType == 'device1') {
      joinRoom();
    }
  }

  void joinRoom() {
    final event = {
      'type': 'JOIN_ROOM',
      'payload': {
        'roomId': roomId,
        'deviceId': deviceId,
      },
    };
    sendEvent(event);
  }

  void sendPaymentEvent(String eventType, [Map<String, dynamic>? additionalData]) {
    final payload = {
      'roomId': roomId,
      'deviceId': deviceId,
      ...?additionalData,
    };

    final event = {
      'type': eventType,
      'payload': payload,
    };
    sendEvent(event);
  }

  void sendEvent(Map<String, dynamic> event) {
    channel?.sink.add(jsonEncode(event));
    print('📤 Enviado: ${event['type']}');
  }

  void disconnect() {
    channel?.sink.close();
  }
}

// Uso em Flutter:
// final client = FlutterPaymentClient(
//   deviceType: 'device1',
//   deviceId: 'device_1',
//   roomId: 'payment_123',
// );
// client.connect();
*/

// ============================================================================
// EXEMPLO 13: React Native
// ============================================================================

/*
import { useEffect, useRef } from 'react';

const usePaymentWebSocket = (deviceType, deviceId, roomId) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connect = () => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log(`✅ ${deviceType} conectado ao servidor`);
      setIsConnected(true);
      
      if (deviceType === 'device1') {
        joinRoom();
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`📨 Recebido: ${data.type}`);
      setMessages(prev => [...prev, data]);
    };

    ws.current.onclose = () => {
      console.log(`❌ ${deviceType} desconectado`);
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('Erro:', error);
    };
  };

  const joinRoom = () => {
    const event = {
      type: 'JOIN_ROOM',
      payload: {
        roomId,
        deviceId,
      },
    };
    sendEvent(event);
  };

  const sendPaymentEvent = (eventType, additionalData = {}) => {
    const event = {
      type: eventType,
      payload: {
        roomId,
        deviceId,
        ...additionalData,
      },
    };
    sendEvent(event);
  };

  const sendEvent = (event) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(event));
      console.log(`📤 Enviado: ${event.type}`);
    }
  };

  return {
    isConnected,
    messages,
    sendPaymentEvent,
    joinRoom,
  };
};

// Uso em React Native:
// const MyComponent = () => {
//   const { isConnected, messages, sendPaymentEvent } = usePaymentWebSocket(
//     'device1',
//     'device_1',
//     'payment_123'
//   );
//
//   return (
//     <View>
//       <Text>Status: {isConnected ? 'Conectado' : 'Desconectado'}</Text>
//       <Button
//         title="Enviar Evento"
//         onPress={() => sendPaymentEvent('ENTERED_SUMMARY')}
//       />
//     </View>
//   );
// };
*/

// ============================================================================
// EXEMPLO 14: Vue.js
// ============================================================================

/*
<template>
  <div>
    <h2>Status: {{ isConnected ? 'Conectado' : 'Desconectado' }}</h2>
    <button @click="joinRoom" v-if="deviceType === 'device1'">Entrar na Sala</button>
    <button @click="sendPaymentEvent('ENTERED_SUMMARY')" v-if="deviceType === 'device2'">
      Entrou na Tela de Resumo
    </button>
    <div v-for="message in messages" :key="message.timestamp">
      {{ message.type }}: {{ JSON.stringify(message) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentWebSocket',
  props: {
    deviceType: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    roomId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      ws: null,
      isConnected: false,
      messages: []
    }
  },
  mounted() {
    this.connect();
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  },
  methods: {
    connect() {
      this.ws = new WebSocket('ws://localhost:8080');

      this.ws.onopen = () => {
        console.log(`✅ ${this.deviceType} conectado ao servidor`);
        this.isConnected = true;
        
        if (this.deviceType === 'device1') {
          this.joinRoom();
        }
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(`📨 Recebido: ${data.type}`);
        this.messages.push(data);
      };

      this.ws.onclose = () => {
        console.log(`❌ ${this.deviceType} desconectado`);
        this.isConnected = false;
      };

      this.ws.onerror = (error) => {
        console.error('Erro:', error);
      };
    },

    joinRoom() {
      const event = {
        type: 'JOIN_ROOM',
        payload: {
          roomId: this.roomId,
          deviceId: this.deviceId
        }
      };
      this.sendEvent(event);
    },

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
    },

    sendEvent(event) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(event));
        console.log(`📤 Enviado: ${event.type}`);
      }
    }
  }
}
</script>
*/

// ============================================================================
// EXEMPLO 15: Angular
// ============================================================================

/*
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-payment-websocket',
  template: `
    <div>
      <h2>Status: {{ isConnected ? 'Conectado' : 'Desconectado' }}</h2>
      <button (click)="joinRoom()" *ngIf="deviceType === 'device1'">Entrar na Sala</button>
      <button (click)="sendPaymentEvent('ENTERED_SUMMARY')" *ngIf="deviceType === 'device2'">
        Entrou na Tela de Resumo
      </button>
      <div *ngFor="let message of messages">
        {{ message.type }}: {{ message | json }}
      </div>
    </div>
  `
})
export class PaymentWebSocketComponent implements OnInit, OnDestroy {
  private ws: WebSocket;
  isConnected = false;
  messages: any[] = [];

  constructor(
    private deviceType: string,
    private deviceId: string,
    private roomId: string
  ) {}

  ngOnInit() {
    this.connect();
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () => {
      console.log(`✅ ${this.deviceType} conectado ao servidor`);
      this.isConnected = true;
      
      if (this.deviceType === 'device1') {
        this.joinRoom();
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`📨 Recebido: ${data.type}`);
      this.messages.push(data);
    };

    this.ws.onclose = () => {
      console.log(`❌ ${this.deviceType} desconectado`);
      this.isConnected = false;
    };

    this.ws.onerror = (error) => {
      console.error('Erro:', error);
    };
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

  sendPaymentEvent(eventType: string, additionalData: any = {}) {
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

  private sendEvent(event: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
      console.log(`📤 Enviado: ${event.type}`);
    }
  }
}
*/

// ============================================================================
// EXEMPLO 16: Teste Automatizado
// ============================================================================

async function testeAutomatizado() {
  console.log('🧪 Iniciando teste automatizado...');
  
  // Criar clientes
  const device1 = new PaymentWebSocketClient();
  const device2 = new PaymentWebSocketClient();
  
  // Conectar device1
  device1.connect('device1', 'device_1', 'payment_123');
  
  // Aguardar conexão
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Conectar device2
  device2.connect('device2', 'device_2', 'payment_123');
  
  // Aguardar conexão
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular fluxo completo de pagamento
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
  
  console.log('✅ Teste automatizado concluído!');
  
  // Desconectar após 5 segundos
  setTimeout(() => {
    device1.disconnect();
    device2.disconnect();
    console.log('👋 Clientes desconectados');
  }, 5000);
}

// Executar teste se este arquivo for executado diretamente
if (require.main === module) {
  testeAutomatizado().catch(console.error);
}

module.exports = {
  PaymentWebSocketClient,
  exemploDevice1,
  exemploDevice2,
  testeAutomatizado
}; 