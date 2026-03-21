
import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, ServiceType, User } from '../types';
import { KANBAN_COLUMNS, CURRENT_USER, SERVICE_COLORS, ALL_USERS, SERVICE_HEX } from '../constants';
import { DollarSign, Calendar, Sparkles, Plus, Trash2, Edit2, Search, User as UserIcon, MessageCircle, AlertCircle, X, Clock, Tag, Briefcase, Zap, Filter, Save, History, CheckCircle, TrendingUp, Users, Target } from 'lucide-react';
import { analyzeLeadWithAI } from '../services/geminiService';
import { useAuth } from '../AuthContext';
import { canEditLead } from '../services/permissionService';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
}

interface Column {
  id: string;
  title: string;
}

interface AIAnalysisResult {
  score: number;
  scoreJustification: string;
  nextSteps: string;
  closingStrategy: string;
  winProbability: number;
  contactTone: string;
}

const SERVICE_BASE_PRICES: Record<ServiceType, number> = {
  Landing: 240000,
  Ecommerce: 980000,
  Local: 180000,
  Automatizacion: 410000,
  Mobile: 1200000,
  CRO: 180000,
  CRM: 500000,
  AppWeb: 1500000,
  Other: 0
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onUpdateLead }) => {
  const { user: authUser } = useAuth();
  const [columns, setColumns] = useState<Column[]>(KANBAN_COLUMNS);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  
  const [filterText, setFilterText] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(5000000);
  const [sameDayFilter, setSameDayFilter] = useState(false);
  
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [tempColTitle, setTempColTitle] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesText = 
        lead.title.toLowerCase().includes(filterText.toLowerCase()) ||
        lead.company.toLowerCase().includes(filterText.toLowerCase()) ||
        lead.tags.some(tag => tag.toLowerCase().includes(filterText.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || lead.ownerId === ownerFilter;
      const matchesService = serviceFilter === 'all' || lead.serviceType === serviceFilter;
      const matchesBudget = lead.value >= minBudget && lead.value <= maxBudget;
      const matchesSameDay = !sameDayFilter || lead.isSameDay;

      return matchesText && matchesOwner && matchesService && matchesBudget && matchesSameDay;
    });
  }, [leads, filterText, ownerFilter, serviceFilter, minBudget, maxBudget, sameDayFilter]);

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newId = newColumnName.toUpperCase().replace(/\s+/g, '_');
    setColumns([...columns, { id: newId, title: newColumnName }]);
    setNewColumnName('');
  };

  const handleDeleteColumn = (colId: string) => {
    const hasLeads = leads.some(l => l.status === colId);
    if (hasLeads) {
      alert("No puedes eliminar una columna que contiene tarjetas. Mueve las tarjetas primero.");
      return;
    }
    setColumns(columns.filter(c => c.id !== colId));
  };

  const startEditingColumn = (col: Column) => {
    setEditingColumnId(col.id);
    setTempColTitle(col.title);
  };

  const saveColumnTitle = () => {
    if (editingColumnId && tempColTitle.trim()) {
      setColumns(columns.map(c => c.id === editingColumnId ? { ...c, title: tempColTitle } : c));
      setEditingColumnId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      const lead = leads.find(l => l.id === draggedLeadId);
      if (lead && lead.status !== status) {
        onUpdateLead({ ...lead, status });
      }
      setDraggedLeadId(null);
    }
  };

  const handleAIAnalysis = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation(); 
    if (analyzingId) return; 
    
    setAnalyzingId(lead.id);
    
    const context = `
      Empresa: ${lead.company}
      Industria: ${lead.industry || 'No especificada'}
      Proyecto: ${lead.title}
      Valor: $${lead.value}
      Status: ${lead.status}
      Tipo Servicio: ${lead.serviceType}
      Same Day: ${lead.isSameDay ? 'SI' : 'NO'}
      Urgencia: ${lead.urgencyLevel || 'Media'}
      Tags: ${lead.tags.join(', ')}
    `;
    
    const resultJson = await analyzeLeadWithAI(context);
    
    if (resultJson) {
      try {
         const cleanJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();
         const parsed: AIAnalysisResult = JSON.parse(cleanJson);
         
         const updatedLead = {
             ...lead,
             score: parsed.score,
             scoreJustification: parsed.scoreJustification,
             closingStrategy: parsed.closingStrategy
         };
         
         onUpdateLead(updatedLead);
         if (selectedLead?.id === lead.id) setSelectedLead(updatedLead);
         
      } catch(e) {
         console.error("Failed to parse AI response", e);
      }
    }
    setAnalyzingId(null);
  };

  const startEditingLead = (lead: Lead) => {
    if (!canEditLead(authUser, lead)) {
      alert("No tienes permisos para editar este lead.");
      return;
    }
    setEditForm(lead);
    setIsEditingLead(true);
  };

  const handleSaveLeadEdit = () => {
    if (editForm.id) {
      onUpdateLead(editForm as Lead);
      setSelectedLead(editForm as Lead);
      setIsEditingLead(false);
    }
  };

  const handleServiceChange = (service: ServiceType) => {
    const updatedForm = { ...editForm, serviceType: service };
    if (!editForm.value || editForm.value === 0 || editForm.value === SERVICE_BASE_PRICES[editForm.serviceType || 'Other']) {
        updatedForm.value = SERVICE_BASE_PRICES[service];
    }
    setEditForm(updatedForm);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 p-6 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm z-20">
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar misiones de rescate..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="relative">
             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none">
                <Briefcase size={14} />
             </div>
             <select 
                className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-colors"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
             >
                <option value="all">Servicios: Todos</option>
                {Object.keys(SERVICE_HEX).map(srv => (
                    <option key={srv} value={srv}>{srv}</option>
                ))}
             </select>
          </div>

          <button 
            onClick={() => setSameDayFilter(!sameDayFilter)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${sameDayFilter ? 'bg-[#00BCD4] text-white border-[#00BCD4] shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Zap size={14} className={sameDayFilter ? 'fill-current' : ''} />
            SAME-DAY
          </button>

          <div className="flex-1" />

          <button 
            onClick={() => setIsEditingBoard(!isEditingBoard)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditingBoard 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
            }`}
          >
            {isEditingBoard ? <CheckCircle size={16} /> : <Edit2 size={16} />}
            {isEditingBoard ? 'Guardar Tablero' : 'Personalizar Tablero'}
          </button>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto p-6 pt-4 bg-slate-50/30 dark:bg-slate-900/30">
        <div className="flex space-x-4 h-full items-start">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 bg-slate-100/60 dark:bg-slate-800/40 rounded-xl flex flex-col max-h-full transition-all border border-slate-200 dark:border-slate-700/50 overflow-hidden ${
                draggedLeadId ? 'ring-2 ring-blue-500 ring-opacity-20 bg-blue-50/10 dark:bg-blue-900/5' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 font-semibold text-slate-700 dark:text-slate-200 sticky top-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-t-xl z-10 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex justify-between items-center">
                  {isEditingBoard && editingColumnId === column.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input 
                        autoFocus
                        value={tempColTitle}
                        onChange={(e) => setTempColTitle(e.target.value)}
                        className="w-full text-sm px-2 py-1 rounded border border-blue-400 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && saveColumnTitle()}
                      />
                      <button onClick={saveColumnTitle} className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 p-1 rounded"><Plus size={14} className="rotate-45" /></button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 truncate">
                      {column.title}
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {filteredLeads.filter(l => l.status === column.id).length}
                      </span>
                    </span>
                  )}
                  
                  {isEditingBoard && editingColumnId !== column.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditingColumn(column)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteColumn(column.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar min-h-[500px]">
                {filteredLeads
                  .filter((lead) => lead.status === column.id)
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((lead) => {
                    const isAnalyzing = analyzingId === lead.id;
                    const owner = ALL_USERS[lead.ownerId];

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => { setSelectedLead(lead); setIsEditingLead(false); }}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group relative animate-fade-in ${lead.isSameDay ? 'border-l-4 border-l-[#00BCD4]' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${SERVICE_COLORS[lead.serviceType] || SERVICE_COLORS['Other']}`}>
                            {lead.serviceType}
                          </span>
                          
                          {lead.score !== undefined && (
                             <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-black ${getScoreColor(lead.score)}`}>
                                <TrendingUp size={10} /> {lead.score}%
                             </div>
                          )}
                        </div>
                        
                        {lead.rescueStatus && (
                          <div className={`mb-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter w-fit border ${
                            lead.rescueStatus === 'Critical' ? 'bg-red-500 text-white border-red-600 animate-pulse' :
                            lead.rescueStatus === 'Warning' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}>
                            🚨 Rescate: {lead.rescueStatus === 'Critical' ? 'CRÍTICO' : lead.rescueStatus === 'Warning' ? 'EN RIESGO' : 'A SALVO'}
                          </div>
                        )}
                        
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-0.5 truncate text-sm">{lead.company}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed italic">{lead.title}</p>
                        
                        <div className="flex items-center justify-between text-[10px] pt-3 border-t border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-1 font-black text-slate-800 dark:text-slate-100">
                            <DollarSign size={10} className="text-green-500" />
                            {(lead.value / 1000).toFixed(0)}k
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                             {lead.slaDeadline && (
                               <div className="flex items-center gap-1 text-slate-400 font-bold mr-2">
                                 <Clock size={10} />
                                 {new Date(lead.slaDeadline).toLocaleDateString([], {day: 'numeric', month: 'short'})}
                               </div>
                             )}
                             {lead.isSameDay && <Zap size={12} className="text-[#00BCD4]" fill="currentColor" />}
                             {owner && <img src={owner.avatarUrl} className="w-4 h-4 rounded-full border border-white dark:border-slate-600 shadow-sm" />}
                          </div>
                        </div>

                        <button 
                            onClick={(e) => handleAIAnalysis(e, lead)}
                            disabled={isAnalyzing}
                            className={`absolute bottom-3 right-3 p-1.5 rounded-full text-purple-400 bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all z-10 ${isAnalyzing ? 'opacity-100' : ''}`}
                            title="Actualizar Rescue Index"
                        >
                            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                      </div>
                    );
                  })}
                  
                  {filteredLeads.filter(l => l.status === column.id).length === 0 && (
                     <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-[10px] gap-2">
                        <Filter size={16} opacity={0.3} />
                        <span>Sin resultados</span>
                     </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Details Modal - EXPANDED FOR SCORING */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 transition-all">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-850">
               <div className="flex-1">
                  {isEditingLead ? (
                      <div className="space-y-3">
                        <input 
                            className="text-xl font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded w-full text-slate-800 dark:text-white"
                            value={editForm.company}
                            onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                        />
                      </div>
                  ) : (
                      <>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{selectedLead.company}</h2>
                            {selectedLead.score !== undefined && (
                                <div className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${getScoreColor(selectedLead.score)}`}>
                                    <TrendingUp size={14} /> Rescue Index: {selectedLead.score}%
                                </div>
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{selectedLead.title}</p>
                      </>
                  )}
               </div>
               <div className="flex items-center gap-2">
                 {!isEditingLead ? (
                    <button onClick={() => startEditingLead(selectedLead)} className="p-2 text-slate-400 hover:text-blue-500 transition-all"><Edit2 size={20} /></button>
                 ) : (
                    <button onClick={handleSaveLeadEdit} className="p-2 text-white bg-green-500 rounded-full shadow-lg"><Save size={20} /></button>
                 )}
                 <button onClick={() => { setSelectedLead(null); setIsEditingLead(false); }} className="text-slate-400 hover:text-red-500 p-2"><X size={24} /></button>
               </div>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 bg-white dark:bg-slate-800">
               
               {/* Advanced Metrics Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                     <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 flex items-center gap-1"><DollarSign size={10} /> Presupuesto</p>
                     <p className="font-black text-lg text-slate-800 dark:text-white">${selectedLead.value.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                     <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 flex items-center gap-1"><Target size={10} /> Industria</p>
                     <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{selectedLead.industry || 'No definida'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                     <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 flex items-center gap-1"><Users size={10} /> Tamaño</p>
                     <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{selectedLead.companySize || 'No especif.'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                     <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1 flex items-center gap-1"><Zap size={10} /> Urgencia</p>
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        selectedLead.urgencyLevel === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                        selectedLead.urgencyLevel === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                        {selectedLead.urgencyLevel || 'Media'}
                     </span>
                  </div>
               </div>

               {/* AI Resolution Radar Section */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 space-y-6">
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-sm">
                          <h3 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                              <Sparkles size={16} className="text-blue-500" /> Algoritmo de Rescate Estratégico
                          </h3>
                          <div className="space-y-4">
                              <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-white dark:border-slate-800">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estrategia de Cierre</p>
                                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic font-medium">
                                      {selectedLead.closingStrategy || "Solicita un análisis AI para generar una estrategia de resolución personalizada basada en el perfil del cliente."}
                                  </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-white/30 dark:bg-slate-900/30 rounded-xl border border-white dark:border-slate-800">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Tono Recomendado</p>
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Ejecutivo & Rápido</p>
                                  </div>
                                  <div className="p-3 bg-white/30 dark:bg-slate-900/30 rounded-xl border border-white dark:border-slate-800">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Medio Óptimo</p>
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                          <MessageCircle size={12} className="text-[#25D366]" /> WhatsApp
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-5 space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-full">
                          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Desglose del Score</h3>
                          <div className="space-y-5">
                              {selectedLead.scoreJustification ? (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                      "{selectedLead.scoreJustification}"
                                  </p>
                              ) : (
                                  <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                                      <TrendingUp size={40} className="mb-2 opacity-20" />
                                      <p className="text-[10px] font-bold uppercase">Sin desglose disponible</p>
                                  </div>
                              )}
                              
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                  <button 
                                    onClick={(e) => handleAIAnalysis(e, selectedLead)}
                                    disabled={analyzingId === selectedLead.id}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
                                  >
                                      {analyzingId === selectedLead.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                      Ejecutar Scoring AI
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Loader2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
