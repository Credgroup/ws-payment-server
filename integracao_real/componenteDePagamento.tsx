// import { Button } from "@/components/ui/button";
// import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { SetStateAction, Dispatch, useEffect, useState } from "react";
// import { LuClock, LuCopy, LuWifi, LuWifiOff } from "react-icons/lu";
// import Countdown from 'react-countdown';
// import renderer from "./Countdown";
// import policyPDF from "@/../public/bilhete.pdf";
// import { PaymentStatesType } from "../../ProductFormHook";
// import { useWebSocket } from "./useWebSocket";

// type PaymentSessionProps = {
//   setPaymentStates: Dispatch<SetStateAction<PaymentStatesType | null>>
//   paymentStates: PaymentStatesType | null
// }

// // Configuração do WebSocket
// const WS_URL = 'ws://localhost:8080'; // Ajuste para a URL do seu servidor
// const ROOM_ID = 'pay_123';

// export default function ExternalPayLink({ setPaymentStates, paymentStates }: Readonly<PaymentSessionProps>) {
//   const [link, setLink] = useState("");
//   const [isLinkExpired, setIsLinkExpired] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [device2Events, setDevice2Events] = useState<string[]>([]);
//   const TIMER_DURATION = 500000;

//   // Hook WebSocket
//   const {
//     isConnected,
//     isConnecting,
//     error: wsError,
//     connect: wsConnect,
//     disconnect: wsDisconnect
//   } = useWebSocket({
//     url: WS_URL,
//     roomId: ROOM_ID,
//     onConnect: () => {
//       console.log('🎉 WebSocket conectado e pronto para receber eventos do Device 2');
//     },
//     onDisconnect: () => {
//       console.log('🔌 WebSocket desconectado');
//     },
//     onError: (error) => {
//       console.error('❌ Erro no WebSocket:', error);
//     },
//     onRoomJoined: (event) => {
//       console.log('🏠 Entrou na sala de pagamento:', event.payload.roomId);
//     },
//     onDevice2Event: (event) => {
//       console.log('📱 Evento recebido do Device 2:', event.type, event.payload);
      
//       // Adiciona o evento à lista para exibição
//       setDevice2Events(prev => [...prev, `${event.type}: ${event.payload.message || 'Evento recebido'}`]);
      
//       // Processa eventos específicos
//       switch (event.type) {
//         case 'PAYMENT_SUCCESS':
//           console.log('✅ Pagamento realizado com sucesso pelo Device 2!');
//           setPaymentSuccess(true);
//           setPaymentStates((prev) => {
//             if (!prev) return null;
//             return {
//               ...prev,
//               paymentStatus: "paid",
//               paymentSuccess: true,
//             }
//           });
//           break;
        
//         case 'PAYMENT_ERROR':
//           console.log('❌ Erro no pagamento pelo Device 2:', event.payload.error);
//           break;
        
//         case 'ENTERED_SUMMARY':
//           console.log('📋 Device 2 entrou na tela de resumo');
//           break;
        
//         case 'CLICKED_PROCEED':
//           console.log('➡️ Device 2 clicou em prosseguir');
//           break;
        
//         case 'CHANGED_PAYMENT_METHOD':
//           console.log('💳 Device 2 alterou método de pagamento');
//           break;
        
//         case 'FILLED_ALL_DATA':
//           console.log('📝 Device 2 preencheu todos os dados');
//           break;
        
//         case 'CLICKED_PAY':
//           console.log('💸 Device 2 clicou em pagar');
//           break;
//       }
//     }
//   });

//   const handleGenerateLink = () => {
//     console.log("gerando link...");
//     setLink("https://pagamento.akad.br/" + Math.random().toString(36).substring(2, 15));
//     setIsLinkExpired(false);
//     setPaymentSuccess(false);
//     setDevice2Events([]); // Limpa eventos anteriores
//   }

//   useEffect(() => {
//     if (open) {
//       handleGenerateLink();
//       // Conecta ao WebSocket quando o modal abre
//       wsConnect();
//     } else {
//       // Desconecta quando o modal fecha
//       wsDisconnect();
//       setDevice2Events([]);
//     }
//   }, [open, wsConnect, wsDisconnect]);

//   const handleCancelPaymentLink = () => {
//     setIsLinkExpired(true);
//     setLink("");
//     console.log("link expirado");
//     console.log("chamando api de cancelamento...");
//   }

//   const handlePay = () => {
//     setPaymentSuccess(true);
//     console.log("efetuando pagamento...");
//     setPaymentStates((prev) => {
//       if (!prev) return null;
//       return {
//         ...prev,
//         paymentStatus: "paid",
//         paymentSuccess: true,
//       }
//     })
//   }

//   const handleDownloadPolicy = () => {
//     console.log("baixando apólice...");
//     window.open(policyPDF, "_blank");
//   }

//   return (
//     <div>
//       {
//         paymentStates?.paymentSuccess ? (
//           <div>
//             <h1 className="text-2xl font-bold mb-3">Pagamento concluído com sucesso!</h1>
//             <p className="text-base mb-6">Obrigado por utilizar nosso sistema de vendas! Sua compra foi gerada com sucesso. Você pode visualizar os detalhes da compra na seção de histórico de compras.</p>
//             <Button onClick={handleDownloadPolicy} variant="outline">Baixar bilhete</Button>
//           </div>
//         ) : (
//           <>
//             <h1 className="text-2xl font-bold mb-3">Gerar link de pagamento</h1>
//             <p className="text-base mb-6">Será enviado por e-mail, a apólice para você e o mutuário após compensação. A cobertura de Acidentes Pessoais estará garantida pela AKAD Seguros no período de vigência, Início às 00:00 de 15/03/2025 até ás 23:59 de 15/03/2026.</p>
//           </>
//         )
//       }
//       <Dialog open={open} onOpenChange={(open) => {
//         setOpen(open);
//         if (!open) {
//           setIsLinkExpired(false);
//           setLink("");
//         }
//       }}>
//         {
//           !paymentStates?.paymentSuccess && (
//             <DialogTrigger asChild>
//               <Button>Gerar link</Button>
//             </DialogTrigger>
//           )
//         }
//         <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
//           <DialogHeader>
//             <DialogTitle>Link de pagamento</DialogTitle>
//             <DialogDescription className="hidden"></DialogDescription>
//           </DialogHeader>
          
//           {/* Status do WebSocket */}
//           <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-gray-50">
//             {isConnected ? (
//               <>
//                 <LuWifi className="text-green-500" />
//                 <span className="text-sm text-green-600">Conectado ao servidor</span>
//               </>
//             ) : isConnecting ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                 <span className="text-sm text-blue-600">Conectando...</span>
//               </>
//             ) : (
//               <>
//                 <LuWifiOff className="text-red-500" />
//                 <span className="text-sm text-red-600">Desconectado</span>
//               </>
//             )}
//             {wsError && (
//               <span className="text-xs text-red-500 ml-2">Erro: {wsError}</span>
//             )}
//           </div>

//           {
//             isLinkExpired && !paymentSuccess && (
//               <div className="flex flex-col gap-y-4">
//                 <div className="flex flex-col border border-red-500 p-3 bg-red-500/10 rounded-md">
//                   <p className="text-red-500 font-bold">Link de pagamento expirado</p>
//                   <p>O link expirou. Clique no botão abaixo para gerar um novo link.</p>
//                 </div>
//                 <Button onClick={handleGenerateLink}>Gerar novo link</Button>
//               </div>
//             )
//           }

//           {
//             !isLinkExpired && !paymentSuccess && (
//               <div className="flex flex-col gap-y-4">
//                 <div className="w-full flex justify-start items-center gap-x-2 text-zinc-500 font-bold">
//                   <LuClock className="stroke-[3px]" />
//                   <Countdown date={Date.now() + TIMER_DURATION} onComplete={handleCancelPaymentLink} renderer={renderer} />
//                 </div>
//                 <div className="flex flex-row gap-x-2">
//                   <Input type="text" value={link} readOnly className={`w-full max-w-md ${isLinkExpired ? "cursor-not-allowed" : ""}`} />
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <Button className="aspect-square w-10" size="icon" onClick={() => navigator.clipboard.writeText(link)} disabled={isLinkExpired}>
//                         <LuCopy />
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       Copiar link
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>

//                 {/* Lista de eventos do Device 2 */}
//                 {device2Events.length > 0 && (
//                   <div className="border rounded-md p-3 bg-blue-50">
//                     <h4 className="font-semibold text-sm mb-2">Atividade do pagamento:</h4>
//                     <div className="space-y-1 max-h-32 overflow-y-auto">
//                       {device2Events.map((event, index) => (
//                         <div key={index} className="text-xs text-gray-600 bg-white p-1 rounded">
//                           {event}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* botao provisorio que efetua pagamento */}
//                 <Button onClick={handlePay} className="w-fit" variant="outline">Efetuar pagamento (teste)</Button>
//               </div>
//             )
//           }

//           {
//             paymentSuccess && (
//               <div className="flex flex-col gap-y-4">
//                 <div className="flex flex-col border border-green-500 p-3 bg-green-500/10 rounded-md">
//                   <p className="text-green-500 font-bold text-lg mb-1">Pagamento efetuado com sucesso</p>
//                   <p>O pagamento foi efetuado com sucesso. O mutuário receberá a apólice por e-mail.</p>
//                   <div className="flex flex-row gap-x-2 items-center justify-end mt-4 w-full">
//                     <Button onClick={handleDownloadPolicy}>Baixar bilhete</Button>
//                     <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
//                   </div>
//                 </div>
//               </div>
//             )
//           }

//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }