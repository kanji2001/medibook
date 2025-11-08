import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Bot, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced FAQ dataset with more comprehensive medical/appointment content
const faqData = [
  {
    keywords: ['appointment', 'book', 'schedule', 'reserve'],
    category: 'booking',
    responses: [
      'To book an appointment, visit our Doctors page, select your preferred doctor, and click "Book Appointment". You can choose your preferred date and time slot.',
      'Booking is easy! Just select a doctor from our verified list, pick an available time slot, and complete the booking process with your details.',
      'You can schedule appointments 24/7 through our platform. Simply browse doctors by specialty and book at your convenience.'
    ]
  },
  {
    keywords: ['cancel', 'reschedule', 'change', 'modify'],
    category: 'management',
    responses: [
      'You can cancel or reschedule appointments from your dashboard. Go to "My Appointments" and select the appointment you want to modify.',
      'To reschedule, visit your appointments section and choose a new time slot. Cancellations can be made up to 24 hours before your appointment.',
      'Need to change your appointment? No problem! Access your dashboard and modify your booking easily.'
    ]
  },
  {
    keywords: ['payment', 'pay', 'fee', 'cost', 'price', 'insurance'],
    category: 'payment',
    responses: [
      'We accept credit/debit cards, PayPal, and cash payments. Payment can be made during booking or at the time of appointment.',
      'Our payment system is secure and supports multiple methods. You can also check if your insurance is accepted by specific doctors.',
      'Consultation fees vary by doctor and specialty. You can see exact pricing before booking, and we offer flexible payment options.'
    ]
  },
  {
    keywords: ['doctor', 'specialist', 'physicians', 'qualified', 'experience'],
    category: 'doctors',
    responses: [
      'All our doctors are licensed medical professionals with verified credentials. You can view their qualifications, experience, and patient reviews.',
      'We have specialists in cardiology, dermatology, pediatrics, gynecology, and more. Each doctor\'s profile shows their expertise and availability.',
      'Our platform features only verified doctors with valid medical licenses. You can filter by specialty, location, and patient ratings.'
    ]
  },
  {
    keywords: ['emergency', 'urgent', 'immediate', 'now'],
    category: 'emergency',
    responses: [
      'For medical emergencies, please call 911 immediately. Our platform is for scheduled consultations and non-emergency care.',
      'If you need immediate medical attention, visit your nearest emergency room or call emergency services. We can help you find urgent care centers.',
      'For urgent but non-emergency situations, you can filter for doctors with same-day availability or visit our urgent care partners.'
    ]
  },
  {
    keywords: ['symptoms', 'diagnosis', 'treatment', 'medicine', 'prescription'],
    category: 'medical',
    responses: [
      'Our doctors can help diagnose and treat various conditions. Book a consultation to discuss your symptoms and receive personalized care.',
      'While I can\'t provide medical diagnosis, our qualified doctors can evaluate your symptoms and recommend appropriate treatment.',
      'For medical concerns, it\'s best to consult with one of our doctors who can properly assess your condition and provide expert advice.'
    ]
  },
  {
    keywords: ['hours', 'available', 'open', 'time', 'schedule'],
    category: 'availability',
    responses: [
      'Doctor availability varies by individual schedules. You can check real-time availability when booking your appointment.',
      'We have doctors available throughout the week, including evenings and weekends. Check the booking calendar for available slots.',
      'Our platform shows live availability. Many doctors offer flexible scheduling including early morning and evening appointments.'
    ]
  }
];

// AI Integration Configuration
const AI_CONFIG = {
  // You can switch between different AI providers
  provider: 'gemini', // Changed to 'gemini'
  
  // OpenAI Configuration (kept for reference, but won't be used with provider: 'gemini')
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  
  // Anthropic Configuration (kept for reference)
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: 'claude-3-haiku-20240307',
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  
  // Google Gemini Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY, // Ensure this env variable holds your Gemini API key
    model: 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  }
};

// System prompt for AI context
const SYSTEM_PROMPT = `You are MediBot, a helpful AI assistant for a doctor appointment booking platform called MediBook. 

Your role is to:
1. Help users book, cancel, or reschedule medical appointments
2. Provide information about doctors, specialties, and services
3. Answer questions about payment methods and insurance
4. Give general health guidance (but never diagnose or prescribe)
5. Be empathetic and professional in all interactions

Key platform features:
- Online appointment booking with verified doctors
- Multiple payment options (card, PayPal, cash)
- Various medical specialties available
- 24/7 booking system
- Dashboard for managing appointments

Guidelines:
- Always be helpful, empathetic, and professional
- For medical emergencies, direct users to call 911
- Don't provide medical diagnosis or prescriptions
- Encourage users to consult with qualified doctors for medical concerns
- Keep responses concise but informative
- If you don't know something specific about the platform, offer to connect them with support

Respond naturally and conversationally, as if you're a knowledgeable customer service representative who genuinely cares about helping users with their healthcare needs.`;

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  isAI?: boolean;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnectingToAgent, setIsConnectingToAgent] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    } else {
      // Enhanced welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hello! I'm MediBot, your healthcare assistant. I'm here to help you with booking appointments, finding doctors, and answering questions about our services. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        isAI: true
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // If already connected to agent
    if (agentConnected) {
      setTimeout(() => {
        const agentResponse: Message = {
          id: Date.now().toString(),
          content: "Thank you for your message. Our support agent will respond shortly.",
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentResponse]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Generate AI response
    try {
      const botResponse = await generateAIResponse(currentInput);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback to FAQ-based response
      const fallbackResponse = await generateFallbackResponse(currentInput);
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // AI Response Generation
  const generateAIResponse = async (query: string): Promise<Message> => {
    if (!aiEnabled) {
      return generateFallbackResponse(query);
    }

    try {
      setIsLoading(true);
      
      // Check for agent connection request first
      if (query.toLowerCase().includes('agent') || 
          query.toLowerCase().includes('human') || 
          query.toLowerCase().includes('person') || 
          query.toLowerCase().includes('speak to someone')) {
        
        return await connectToAgent();
      }

      let aiResponse = '';

      // *** Modified to prioritize Gemini ***
      if (AI_CONFIG.provider === 'gemini') {
        aiResponse = await callGemini(query);
      } else if (AI_CONFIG.provider === 'openai') {
        aiResponse = await callOpenAI(query);
      } else if (AI_CONFIG.provider === 'anthropic') {
        aiResponse = await callAnthropic(query);
      } else {
        aiResponse = await generateSmartFallbackResponse(query);
      }

      return {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        isAI: true
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return generateFallbackResponse(query);
    } finally {
      setIsLoading(false);
    }
  };

  // OpenAI API Call
  const callOpenAI = async (query: string): Promise<string> => {
    const response = await fetch(AI_CONFIG.openai.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API call failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Anthropic API Call
  const callAnthropic = async (query: string): Promise<string> => {
    const response = await fetch(AI_CONFIG.anthropic.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.anthropic.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: AI_CONFIG.anthropic.model,
        max_tokens: 300,
        messages: [
          { role: 'user', content: `${SYSTEM_PROMPT}\n\nUser: ${query}` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API call failed');
    }

    const data = await response.json();
    return data.content[0].text;
  };

  // Google Gemini API Call
  const callGemini = async (query: string): Promise<string> => {
    const response = await fetch(`${AI_CONFIG.gemini.endpoint}?key=${AI_CONFIG.gemini.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nUser: ${query}`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error details:', errorData);
      throw new Error(`Gemini API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Ensure the response structure is correct for Gemini
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Unexpected Gemini API response structure');
    }
  };

  // Enhanced fallback response with context awareness
  const generateSmartFallbackResponse = async (query: string): Promise<string> => {
    const lowercaseQuery = query.toLowerCase();
    
    // Context-aware responses based on query analysis
    if (lowercaseQuery.includes('hello') || lowercaseQuery.includes('hi')) {
      return "Hello! I'm here to help you with your healthcare needs. Would you like to book an appointment, learn about our doctors, or get information about our services?";
    }
    
    if (lowercaseQuery.includes('thank')) {
      return "You're very welcome! I'm glad I could help. Is there anything else you'd like to know about our services or booking appointments?";
    }
    
    if (lowercaseQuery.includes('help')) {
      return "I'd be happy to help! I can assist you with:\n• Booking appointments with our doctors\n• Information about our specialists\n• Payment and insurance questions\n• Managing your existing appointments\n\nWhat would you like to know more about?";
    }

    // Try to match with enhanced FAQ
    for (const faq of faqData) {
      if (faq.keywords.some(keyword => lowercaseQuery.includes(keyword))) {
        // Return a random response from the category for variety
        const responses = faq.responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return randomResponse;
      }
    }
    
    // Intelligent fallback based on query length and complexity
    if (query.length > 100) {
      return "I understand you have a detailed question. While I can help with general information about appointments and our services, for complex medical concerns, I'd recommend speaking with one of our qualified doctors. Would you like me to help you book a consultation?";
    }
    
    return "I want to make sure I give you the most helpful information. Could you tell me more about what you're looking for? I can help with booking appointments, finding doctors, payment information, or general questions about our services.";
  };

  // Fallback to FAQ-based responses
  const generateFallbackResponse = async (query: string): Promise<Message> => {
    const response = await generateSmartFallbackResponse(query);
    
    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
      isAI: false
    };
  };

  // Connect to agent functionality
  const connectToAgent = async (): Promise<Message> => {
    setIsConnectingToAgent(true);
    
    // Simulate connection to agent after delay
    setTimeout(() => {
      setAgentConnected(true);
      setIsConnectingToAgent(false);
      
      const agentConnectedMsg: Message = {
        id: Date.now().toString(),
        content: "Hello! I'm Sarah from our support team. I'm here to provide personalized assistance with your healthcare needs. How can I help you today?",
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentConnectedMsg]);
      
      toast({
        title: "Support Agent Connected",
        description: "You're now connected with a live support agent."
      });
    }, 3000);
    
    return {
      id: Date.now().toString(),
      content: "I'm connecting you to one of our healthcare support specialists. They'll be with you shortly to provide personalized assistance.",
      sender: 'bot',
      timestamp: new Date(),
      isAI: true
    };
  };

  const clearChat = () => {
    localStorage.removeItem('chatHistory');
    setMessages([{
      id: Date.now().toString(),
      content: "Hello! I'm MediBot, your healthcare assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      isAI: true
    }]);
    setAgentConnected(false);
    toast({
      title: "Chat History Cleared",
      description: "Your chat history has been cleared successfully."
    });
  };

  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
    toast({
      title: aiEnabled ? "AI Disabled" : "AI Enabled",
      description: aiEnabled ? "Switched to FAQ-based responses" : "AI responses enabled"
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl flex flex-col w-80 sm:w-96 h-96 animate-fade-in border">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <div>
                <h3 className="font-medium">MediBot Assistant</h3>
                <div className="flex items-center text-xs opacity-80">
                  {aiEnabled ? <Zap className="h-3 w-3 mr-1" /> : null}
                  <span>{aiEnabled ? 'AI Powered' : 'FAQ Mode'}</span>
                  {isLoading && <span className="ml-2 animate-pulse">Thinking...</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleAI}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Toggle AI"
                title={aiEnabled ? "Disable AI" : "Enable AI"}
              >
                <Settings className="h-4 w-4" />
              </button>
              <button 
                onClick={clearChat}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Clear chat"
              >
                <X className="h-4 w-4" />
              </button>
              <button 
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender !== 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : message.sender === 'agent'
                        ? 'bg-green-100 text-green-800 rounded-bl-sm border border-green-200'
                        : 'bg-white text-gray-800 rounded-bl-sm border'
                  }`}
                >
                  {message.sender !== 'user' && (
                    <div className="flex items-center text-xs font-medium mb-2 opacity-75">
                      {message.sender === 'agent' ? (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          Support Agent
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3 mr-1" />
                          MediBot {message.isAI && <Zap className="h-3 w-3 ml-1" />}
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  <div className="text-xs opacity-60 text-right mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm p-3 max-w-[85%] border shadow-sm">
                  <div className="flex items-center text-xs font-medium mb-2 opacity-75">
                    <Bot className="h-3 w-3 mr-1" />
                    MediBot is typing...
                  </div>
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {isConnectingToAgent && (
              <div className="flex justify-start">
                <div className="bg-yellow-50 text-yellow-800 rounded-lg rounded-bl-sm p-3 max-w-[85%] border border-yellow-200">
                  <div className="text-xs font-medium mb-1">Connecting to Support...</div>
                  <p className="text-sm">Please wait while we connect you to a specialist.</p>
                  <div className="mt-2 flex items-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse mr-1"></div>
                    <span className="text-xs">Connecting...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask about appointments, doctors, or services..."
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isConnectingToAgent || isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!inputValue.trim() || isConnectingToAgent || isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 relative"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
          {aiEnabled && (
            <div className="absolute -top-1 -right-1 bg-green-400 text-xs rounded-full p-1">
              <Zap className="h-3 w-3" />
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatBot;