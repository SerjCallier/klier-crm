
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lead, Conversation, DirectMessage, ServiceType, View } from '../types';
import { INITIAL_CONVERSATIONS, MESSAGE_TEMPLATES, KANBAN_COLUMNS } from '../constants';
import { 
  Search, Send, MoreVertical, Paperclip, Check, CheckCheck, 
  MessageCircle, RefreshCw, Zap, Sparkles, BrainCircuit, 
  Info, Loader2, Link2, Unlink, Wifi, WifiOff, Settings, 
  CheckSquare, ExternalLink, Calendar, UserPlus, Trash2, ChevronDown, Key, X, AlertTriangle
} from 'lucide-react';
import { generateReplySuggestion } from '../services/geminiService';
import { sendWhatsAppMessage, WhatsAppCredentials } from '../services/whatsappService';

interface MessagingViewProps {
  leads: Lead[];
  initialLeadId?: string | null;
  onUpdateLead?: (lead: Lead) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({ leads, initialLeadId, onUpdateLead }) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId || null);
  const [inputText, setInputText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // WhatsApp Real Integration State
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiCreds, setApiCreds] = useState<WhatsAppCredentials | null>(() => {
      const saved = localStorage.getItem('kliernav_whatsapp_creds');
      return saved ? JSON.parse(saved) : null;
  });
  const [isSendingReal, setIsSendingReal] = useState(false);

  // Dropdown states
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  // Simulation State
  const [isConnected, setIsConnected] = useState(true);

  // AI State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(true);

  // Tracking tasks inside chat
  const [completedFollowUps, setCompletedFollowUps] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialLeadId) {
        setSelectedLeadId(initialLeadId);
        setConversations(prev => {
            if (prev.some(c => c.leadId === initialLeadId)) {
                return prev.map(c => c.leadId === initialLeadId ? { ...c, unreadCount: 0 } : c);
            }
            const newConv: Conversation = {
                leadId: initialLeadId,
                messages: [],
                unreadCount: 0,
                lastMessageAt: new Date().toISOString()
            };
            return [newConv, ...prev];
        });
    }
  }, [initialLeadId]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedLeadId, conversations]);

  const activeConversation = conversations.find(c => c.leadId === selectedLeadId);
  const activeLead = leads.find(l => l.id === selectedLeadId);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const lead = leads.find(l => l.id === conv.leadId);
      if (!lead) return false;
      const contentMatch = conv.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
      return lead.company.toLowerCase().includes(searchQuery.toLowerCase()) || contentMatch;
    });
  }, [conversations, searchQuery, leads]);

  const handleSaveApiCreds = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const creds = {
          token: formData.get('token') as string,
          phoneNumberId: formData.get('phoneNumberId') as string
      };
      setApiCreds(creds);
      localStorage.setItem('kliernav_whatsapp_creds', JSON.stringify(creds));
      setIsApiModalOpen(false);
      alert("Credenciales guardadas. Los mensajes ahora se enviarán por la API de Meta.");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedLeadId) return;

    const leadPhone = "5491134421111"; // Placeholder, en un caso real usaría lead.phone

    // Si hay API configurada, intentar envío real
    if (apiCreds) {
        setIsSendingReal(true);
        const result = await sendWhatsAppMessage(leadPhone, inputText, apiCreds);
        setIsSendingReal(false);
        
        if (!result.success) {
            alert(`Error de Meta API: ${result.error}`);
            return;
        }
    }

    const newMessage: DirectMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        text: inputText,
        timestamp: new Date().toISOString(),
        status: apiCreds ? 'sent' : 'sent'
    };

    setConversations(prev => prev.map(c => {
        if (c.leadId === selectedLeadId) {
            return {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessageAt: newMessage.timestamp
            };
        }
        return c;
    }));

    setInputText('');
    
    // Simulate WhatsApp Cloud API status updates
    setTimeout(() => {
        setConversations(prev => prev.map(c => {
            if (c.leadId === selectedLeadId) {
                return {
                    ...c,
                    messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
                };
            }
            return c;
        }));
    }, 1200);
  };

  const handleMagicReply = async () => {
      if (!selectedLeadId || !activeConversation || isGeneratingAI) return;
      setIsGeneratingAI(true);
      const historyText = activeConversation.messages.slice(-5).map(m => `${m.senderId}: ${m.text}`).join('\n');
      const leadContext = `Empresa: ${activeLead?.company}, Servicio: ${activeLead?.serviceType}`;
      try {
          const suggestion = await generateReplySuggestion(historyText, leadContext);
          if (suggestion) setInputText(suggestion);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingAI(false);
      }
  };

  const toggleFollowUp = (task: string) => {
    setCompletedFollowUps(prev => prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]);
  };

  const formatTime = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTemplates = activeLead ? MESSAGE_TEMPLATES[activeLead.serviceType] || MESSAGE_TEMPLATES['Other'] : [];

  return (
    <div className="flex h-full bg-[#0b141a] overflow-hidden text-slate-200">
      
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-[#111b21] border-r border-slate-700/50 flex flex-col flex-shrink-0">
        <div className="p-4 bg-[#202c33] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h2 className="font-bold text-white flex items-center gap-2">
                      <MessageCircle className="text-[#25D366]" size={20} /> WhatsApp CRM
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${apiCreds ? 'bg-blue-400' : 'bg-[#25D366] animate-pulse'}`} />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {apiCreds ? 'Producción (Meta API)' : 'Conexión Simulada'}
                      </span>
                  </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setSidebarMenuOpen(!sidebarMenuOpen)}
                        className={`p-1.5 rounded-full transition-colors ${sidebarMenuOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {sidebarMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#233138] rounded-lg shadow-xl border border-slate-700 z-50 animate-fade-in overflow-hidden">
                            <button onClick={() => { setIsApiModalOpen(true); setSidebarMenuOpen(false); }} className="w-full text-left px-4 py-3 text-xs hover:bg-[#111b21] flex items-center gap-3 border-b border-slate-700/50">
                                <Key size={14} className="text-blue-400" /> Configurar Meta API
                            </button>
                            <button className="w-full text-left px-4 py-3 text-xs hover:bg-[#111b21] flex items-center gap-3 border-b border-slate-700/50">
                                <CheckSquare size={14} /> Marcar todo como leído
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <button 
                onClick={() => setIsApiModalOpen(true)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${
                    apiCreds ? 'bg-blue-600/20 text-blue-400 border-blue-900/50 hover:bg-blue-600/30' : 'bg-[#25D366] hover:bg-[#128C7E] text-[#111b21]'
                }`}
            >
                <Link2 size={14} />
                {apiCreds ? 'API Conectada (Meta)' : 'Configurar WhatsApp Real'}
            </button>
        </div>

        <div className="p-3 bg-[#111b21]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
                <input 
                    type="text" 
                    placeholder="Buscar chat o número..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#202c33] border-none rounded-lg text-xs focus:ring-1 focus:ring-[#25D366] outline-none text-slate-200 placeholder:text-slate-500"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111b21]">
            {filteredConversations.map(conv => {
                const lead = leads.find(l => l.id === conv.leadId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                if (!lead) return null;
                return (
                    <div 
                        key={conv.leadId}
                        onClick={() => setSelectedLeadId(conv.leadId)}
                        className={`p-3 flex gap-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-slate-800/30 ${selectedLeadId === conv.leadId ? 'bg-[#2a3942]' : ''}`}
                    >
                        <div className="relative flex-shrink-0">
                             <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden shadow-md">
                                {lead.company.substring(0,2).toUpperCase()}
                             </div>
                             {conv.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-[#25D366] text-[#111b21] text-[10px] font-bold rounded-full border-2 border-[#111b21] items-center justify-center">
                                    {conv.unreadCount}
                                </span>
                             )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className={`font-semibold truncate text-sm ${conv.unreadCount > 0 ? 'text-white' : 'text-slate-200'}`}>{lead.company}</h4>
                                <span className="text-[10px] text-slate-500">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                            </div>
                            <p className="text-xs truncate text-slate-500 flex items-center gap-1">
                                {lastMsg?.senderId === 'me' && <CheckCheck size={12} className={lastMsg.status === 'read' ? 'text-[#53bdeb]' : 'text-slate-500'} />}
                                {lastMsg ? lastMsg.text : 'Escribiendo...'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b141a] relative">
        {activeConversation && activeLead ? (
            <div className="flex h-full">
                <div className="flex-1 flex flex-col">
                    <div className="h-16 bg-[#202c33] border-b border-slate-700/30 px-4 flex items-center justify-between z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                                 {activeLead.company.substring(0,2).toUpperCase()}
                             </div>
                             <div className="min-w-0">
                                 <h3 className="font-bold text-white truncate text-sm flex items-center gap-2">
                                     {activeLead.company} 
                                     <div className="w-2 h-2 bg-[#25D366] rounded-full" />
                                 </h3>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{activeLead.serviceType}</p>
                             </div>
                        </div>
                        <div className="flex gap-4 text-slate-400 items-center">
                             <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-[#25D366] rounded-full text-[9px] font-extrabold border border-green-500/20 uppercase tracking-tighter">
                                 <Wifi size={10} /> En Línea
                             </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative bg-[#0b141a]" ref={scrollRef}>
                        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }} />
                        {activeConversation.messages.map(msg => {
                            const isMe = msg.senderId === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in relative z-10`}>
                                    <div className={`max-w-[85%] sm:max-w-[70%] p-2 px-3 rounded-lg shadow-md text-sm relative ${isMe ? 'bg-[#005c4b] text-slate-100 rounded-tr-none' : 'bg-[#202c33] text-slate-100 rounded-tl-none'}`}>
                                        <p className="mb-1 leading-relaxed">{msg.text}</p>
                                        <div className="flex justify-end items-center gap-1.5 text-[9px] opacity-60">
                                            <span>{formatTime(msg.timestamp)}</span>
                                            {isMe && <CheckCheck size={11} className={msg.status === 'read' ? 'text-[#53bdeb]' : ''} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Input Area */}
                    <div className="bg-[#202c33] p-4 shadow-inner">
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={() => setShowTemplates(!showTemplates)} className={`text-[10px] px-4 py-1.5 rounded-full border flex items-center gap-2 transition-all font-bold uppercase tracking-widest ${showTemplates ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-[#2a3942] text-slate-400 border-slate-700 hover:bg-[#374248]'}`}>
                                <Zap size={14} className={showTemplates ? 'fill-current' : ''} /> Plantillas
                            </button>
                            <button onClick={handleMagicReply} disabled={isGeneratingAI} className="text-[10px] px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center gap-2 hover:bg-purple-500/20 transition-all font-bold uppercase tracking-widest">
                                {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Respuesta AI
                            </button>
                        </div>
                        
                        {showTemplates && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 animate-slide-in-top">
                                {currentTemplates.map((tpl, i) => (
                                    <button key={i} onClick={() => { setInputText(tpl); setShowTemplates(false); }} className="flex-shrink-0 text-[10px] bg-[#2a3942] border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-300 hover:bg-[#374248] truncate font-semibold">
                                        {tpl}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button className="text-[#8696a0] hover:text-white transition-colors p-2"><Paperclip size={22} /></button>
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={apiCreds ? "Envía un WhatsApp real..." : "Modo simulación activo..."}
                                    className="w-full bg-[#2a3942] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#25D366]"
                                />
                            </div>
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isSendingReal}
                                className={`p-3 rounded-full transition-all ${inputText.trim() ? 'bg-[#00a884] text-white' : 'bg-[#2a3942] text-slate-500'}`}
                            >
                                {isSendingReal ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Insight Sidebar */}
                {aiAnalysisOpen && (
                    <div className="w-72 bg-[#111b21] border-l border-slate-700/50 flex flex-col flex-shrink-0">
                        <div className="p-5 border-b border-slate-700/30 flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                                <BrainCircuit className="text-purple-400" size={16} /> WhatsApp Insight
                            </h3>
                            <button onClick={() => setAiAnalysisOpen(false)} className="text-slate-500 hover:text-white"><ChevronDown className="rotate-[-90deg]" size={18} /></button>
                        </div>
                        <div className="p-5 space-y-8 overflow-y-auto custom-scrollbar">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest"><Info size={12} /> Datos del Contacto</h4>
                                <div className="p-4 bg-[#202c33] rounded-2xl border border-slate-700/40 space-y-2 shadow-sm">
                                    <p className="text-sm font-bold text-white">{activeLead.company}</p>
                                    <div className="flex gap-2">
                                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-black uppercase">{activeLead.status}</span>
                                        <span className="text-[9px] bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded font-black uppercase">${activeLead.value.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Acciones Sugeridas</h4>
                                <ul className="space-y-3">
                                    {["Solicitar comprobante de transferencia", "Compartir enlace de Zoom", "Enviar PDF de catálogo"].map(task => (
                                        <li key={task} onClick={() => toggleFollowUp(task)} className="flex items-start gap-3 cursor-pointer group">
                                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${completedFollowUps.includes(task) ? 'bg-[#25D366] border-[#25D366]' : 'border-slate-600'}`}>
                                                {completedFollowUps.includes(task) && <Check size={10} className="text-[#111b21] font-bold" />}
                                            </div>
                                            <span className={`text-xs ${completedFollowUps.includes(task) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center bg-[#0b141a]">
                <div className="w-32 h-32 bg-[#202c33] rounded-full flex items-center justify-center mb-8 shadow-2xl relative border border-slate-800/50">
                    <MessageCircle size={64} className="text-[#25D366]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Centro de Mensajería Real</h3>
                <p className="max-w-xs text-sm text-[#8696a0]">Selecciona un chat para empezar. Configura la API de Meta para enviar mensajes reales a tus clientes.</p>
                <button onClick={() => setIsApiModalOpen(true)} className="mt-8 px-8 py-3 bg-[#00a884] hover:bg-[#06cf9c] text-[#111b21] rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                    Vincular WhatsApp de Producción
                </button>
            </div>
        )}
      </div>

      {/* Meta API Config Modal */}
      {isApiModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
              <div className="bg-[#233138] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700">
                  <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#202c33]">
                      <div className="flex items-center gap-3">
                          <Key className="text-blue-400" size={24} />
                          <h3 className="font-bold text-white">Configuración WhatsApp Cloud API</h3>
                      </div>
                      <button onClick={() => setIsApiModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleSaveApiCreds} className="p-6 space-y-6">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start">
                          <AlertTriangle className="text-blue-400 shrink-0" size={18} />
                          <p className="text-[11px] text-blue-200 leading-relaxed">
                              Obtén estos datos en el portal <strong>developers.facebook.com</strong>. Crea una App, añade el producto WhatsApp y configura un número.
                          </p>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Permanent Access Token</label>
                              <input 
                                  name="token"
                                  type="password"
                                  required
                                  defaultValue={apiCreds?.token}
                                  placeholder="EAAb..."
                                  className="w-full p-3 rounded-xl bg-[#111b21] border border-slate-700 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number ID</label>
                              <input 
                                  name="phoneNumberId"
                                  type="text"
                                  required
                                  defaultValue={apiCreds?.phoneNumberId}
                                  placeholder="1029384756..."
                                  className="w-full p-3 rounded-xl bg-[#111b21] border border-slate-700 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                          </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setIsApiModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-white/5 rounded-xl transition-all">Cancelar</button>
                          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">Vincular API</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
