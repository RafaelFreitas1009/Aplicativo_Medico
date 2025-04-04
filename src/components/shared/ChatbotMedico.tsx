
import React, { useState, useRef, useEffect } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircleIcon, SendIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

// Tipos de mensagens
type MessageRole = 'user' | 'bot';

interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// Estrutura para decisão de encaminhamento
interface SpecialtyRouting {
  specialty: string;
  keywords: string[];
  description: string;
}

const specialtyRouting: SpecialtyRouting[] = [
  { 
    specialty: 'Clínico Geral', 
    keywords: ['gripe', 'resfriado', 'febre', 'dor de cabeça', 'mal-estar', 'cansaço', 'check-up', 'exame', 'tosse'],
    description: 'Atende problemas gerais de saúde e faz diagnóstico inicial'
  },
  {
    specialty: 'Cardiologista',
    keywords: ['coração', 'peito', 'palpitação', 'pressão alta', 'pressão', 'arterial', 'colesterol'],
    description: 'Especialista em problemas cardiovasculares'
  },
  {
    specialty: 'Dermatologista',
    keywords: ['pele', 'acne', 'mancha', 'alergia', 'coceira', 'dermatite', 'eczema'],
    description: 'Trata problemas de pele, cabelo e unhas'
  },
  {
    specialty: 'Ortopedista',
    keywords: ['osso', 'articulação', 'dor nas costas', 'coluna', 'fratura', 'entorse', 'joelho', 'tornozelo'],
    description: 'Especialista em problemas ósseos e articulares'
  },
  {
    specialty: 'Ginecologista',
    keywords: ['menstruação', 'gravidez', 'exame ginecológico', 'papanicolau', 'útero', 'ovário'],
    description: 'Atende à saúde da mulher'
  },
  {
    specialty: 'Pediatra',
    keywords: ['criança', 'bebê', 'filho', 'filha', 'infantil'],
    description: 'Médico especializado em crianças'
  },
  {
    specialty: 'Oftalmologista',
    keywords: ['olho', 'visão', 'enxergar', 'óculos', 'vista', 'catarata'],
    description: 'Cuida da saúde dos olhos'
  },
  {
    specialty: 'Psiquiatra',
    keywords: ['ansiedade', 'depressão', 'insônia', 'transtorno', 'mental', 'pânico', 'estresse'],
    description: 'Trata problemas de saúde mental'
  },
  {
    specialty: 'Neurologista',
    keywords: ['cabeça', 'enxaqueca', 'convulsão', 'desmaio', 'tontura', 'memória', 'cérebro'],
    description: 'Especialista em sistema nervoso'
  },
  {
    specialty: 'Otorrinolaringologista',
    keywords: ['ouvido', 'garganta', 'nariz', 'sinusite', 'rinite', 'alergia', 'audição'],
    description: 'Trata problemas de ouvido, nariz e garganta'
  }
];

// Perguntas predefinidas do chatbot
const chatbotQuestions = [
  "Olá! Sou o assistente virtual do Médico Conectado. Como posso ajudar você hoje?",
  "Poderia descrever quais sintomas está sentindo?",
  "Há quanto tempo está sentindo esses sintomas?",
  "Já fez algum tratamento ou tomou algum medicamento para isso?",
  "Tem alguma condição médica pré-existente que devemos saber?"
];

const ChatbotMedico: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<SpecialtyRouting[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Inicializar o chat com a primeira pergunta quando aberto
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(chatbotQuestions[0]);
    }
  }, [isOpen]);

  // Rolagem automática para a última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Adicionar mensagem do bot
  const addBotMessage = (content: string) => {
    setIsTyping(true);
    
    // Simular tempo de resposta do bot
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        content,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  // Processar mensagem do usuário
  const processUserMessage = (message: string) => {
    // Verificar se a mensagem contém palavras-chave para direcionar à especialidade
    const matchedSpecialties = findMatchingSpecialties(message);
    setSuggestions(matchedSpecialties);

    // Avançar para a próxima pergunta
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < chatbotQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      addBotMessage(chatbotQuestions[nextQuestionIndex]);
    } 
    // Se chegou ao fim das perguntas, dar uma resposta conclusiva
    else if (matchedSpecialties.length > 0) {
      addBotMessage(`Com base nas informações fornecidas, recomendo consultar um ${matchedSpecialties[0].specialty}. ${matchedSpecialties[0].description}.`);
    } else {
      addBotMessage("Obrigado pelas informações. Recomendo agendar uma consulta com um Clínico Geral para uma avaliação completa.");
    }
  };

  // Encontrar especialidades correspondentes às palavras-chave na mensagem
  const findMatchingSpecialties = (message: string): SpecialtyRouting[] => {
    const normalizedMessage = message.toLowerCase();
    return specialtyRouting.filter(specialty => 
      specialty.keywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()))
    );
  };

  // Enviar mensagem
  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Processar a mensagem após adicionar
    processUserMessage(input);
  };

  // Lidar com enter no input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Formatar a mensagem do chat
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Agendar consulta com a especialidade sugerida
  const handleScheduleAppointment = (specialty: string) => {
    toast({
      title: "Agendamento Iniciado",
      description: `Redirecionando para agendamento com ${specialty}`,
      duration: 3000,
    });
    setIsOpen(false);
    // Aqui poderemos integrar com o sistema de agendamento
  };

  return (
    <>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-medical-primary hover:bg-medical-primary/90"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircleIcon className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-medical-primary">
                <MessageCircleIcon className="h-4 w-4 text-white" />
              </Avatar>
              Assistente Virtual Médico Conectado
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="flex-1 p-4 overflow-y-auto max-h-[60vh]">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-medical-primary text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Sugestões de especialidades após análise */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 my-3 justify-center">
                {suggestions.map((suggestion, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-3 py-2 cursor-pointer hover:bg-medical-primary hover:text-white transition-colors"
                    onClick={() => handleScheduleAppointment(suggestion.specialty)}
                  >
                    👨‍⚕️ Agendar com {suggestion.specialty}
                  </Badge>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <DrawerFooter className="border-t pt-2">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Digite sua mensagem aqui..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSend} className="bg-medical-primary hover:bg-medical-primary/90 p-2">
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">Assistente em fase de testes. Para emergências, ligue 192.</p>
              <DrawerClose asChild>
                <Button variant="outline" size="sm">Fechar</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ChatbotMedico;
