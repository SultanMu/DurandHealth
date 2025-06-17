import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, Mic, MicOff, User, Calendar, Pill, Activity, FileText, Stethoscope } from "lucide-react";

interface VirtualAssistantModalProps {
  open: boolean;
  onClose: () => void;
  onBookAppointment?: () => void;
  onSetReminder?: () => void;
  onHealthAssessment?: () => void;
  onViewCarePlan?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: AssistantAction[];
}

interface AssistantAction {
  type: 'book_appointment' | 'set_reminder' | 'health_assessment' | 'view_records' | 'medication_info' | 'view_care_plan';
  label: string;
  data?: any;
}

export default function VirtualAssistantModal({ 
  open, 
  onClose, 
  onBookAppointment, 
  onSetReminder, 
  onHealthAssessment, 
  onViewCarePlan 
}: VirtualAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your virtual health assistant. I can help you with appointments, health information, medication reminders, and answer questions about your health data. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Book an appointment",
        "Check my health metrics",
        "Set medication reminder",
        "What are my recent test results?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not process speech input. Please try typing instead.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/virtual-assistant/chat", {
        message,
        context: messages.slice(-5) // Send last 5 messages for context
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
        actions: data.actions || []
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Assistant Error",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    sendMessage.mutate(inputValue.trim());
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleActionClick = (action: AssistantAction) => {
    switch (action.type) {
      case 'book_appointment':
        onClose();
        if (onBookAppointment) {
          onBookAppointment();
        }
        break;
      case 'set_reminder':
        onClose();
        if (onSetReminder) {
          onSetReminder();
        }
        break;
      case 'health_assessment':
        onClose();
        if (onHealthAssessment) {
          onHealthAssessment();
        }
        break;
      case 'view_care_plan':
        onClose();
        if (onViewCarePlan) {
          onViewCarePlan();
        }
        break;
      default:
        break;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'book_appointment': return <Calendar className="h-4 w-4" />;
      case 'set_reminder': return <Pill className="h-4 w-4" />;
      case 'health_assessment': return <Stethoscope className="h-4 w-4" />;
      case 'view_records': return <FileText className="h-4 w-4" />;
      case 'medication_info': return <Pill className="h-4 w-4" />;
      case 'view_care_plan': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-gray-600" />
            )}
          </div>
          
          <div className={`rounded-lg p-3 ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-1 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSuggestions = (suggestions: string[]) => {
    if (suggestions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  };

  const renderActions = (actions: AssistantAction[]) => {
    if (actions.length === 0) return null;

    return (
      <div className="space-y-2 mb-4">
        <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleActionClick(action)}
            className="w-full justify-start"
          >
            {getActionIcon(action.type)}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = lastMessage?.type === 'assistant' && lastMessage.suggestions && lastMessage.suggestions.length > 0;
  const showActions = lastMessage?.type === 'assistant' && lastMessage.actions && lastMessage.actions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="h-5 w-5 text-blue-600 mr-2" />
            Virtual Health Assistant
          </DialogTitle>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
          {messages.map(renderMessage)}
          
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && renderSuggestions(lastMessage.suggestions!)}

        {/* Actions */}
        {showActions && renderActions(lastMessage.actions!)}

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your health question or request..."
                disabled={isProcessing}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                  isListening ? 'text-red-600' : 'text-gray-400'
                }`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="mt-2 text-center">
              <Badge variant="secondary" className="animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening...
              </Badge>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 mt-2">
          <p><strong>Try asking:</strong> "Book me an appointment", "What are my recent vitals?", "Set a medication reminder", or "Show my health progress"</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}