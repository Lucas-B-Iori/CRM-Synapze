"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, CheckCheck } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export default function WhatsAppPage() {
    const {
        leads,
        messages,
        activeLeadId,
        isLoadingLeads,
        fetchLeads,
        setActiveLead,
        sendMessage,
        subscribeToMessages,
        unsubscribeFromMessages
    } = useChatStore();

    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchLeads();
        subscribeToMessages();
        return () => {
            unsubscribeFromMessages();
        };
    }, [fetchLeads, subscribeToMessages, unsubscribeFromMessages]);

    // Role scroll top na conversa sempre q houver nova msg
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const activeLead = leads.find(l => l.id === activeLeadId);

    const handleSend = () => {
        if (!inputText.trim() || !activeLead?.phone) return;
        sendMessage(activeLead.id, activeLead.phone, inputText);
        setInputText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MessageCircle className="text-emerald-500" size={32} />
                    WhatsApp (Escuta Ativa)
                </h1>
                <p className="text-neutral-400 mt-2">
                    Acompanhe todas as conversas conectadas à sua instância da Evolution API em tempo real. Neste momento a IA está <strong>desligada</strong>, você pode responder manualmente.
                </p>
            </div>

            <div className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex overflow-hidden">
                {/* Lista de Contatos (Leads) */}
                <div className="w-1/3 border-r border-neutral-800 flex flex-col">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/80">
                        <input
                            type="text"
                            placeholder="Buscar contato..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoadingLeads && <div className="p-4 text-center text-neutral-500 text-sm">Carregando contatos...</div>}

                        {leads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => setActiveLead(lead.id)}
                                className={`p-4 border-b border-neutral-800/50 cursor-pointer transition-colors ${activeLeadId === lead.id ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500' : 'hover:bg-neutral-800/30'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium text-white text-sm truncate max-w-[70%]">{lead.company_name || lead.phone}</h3>
                                </div>
                                <p className="text-xs text-neutral-400 truncate">{lead.phone}</p>
                            </div>
                        ))}

                        {!isLoadingLeads && leads.length === 0 && (
                            <div className="p-8 text-center text-neutral-500 text-sm">
                                Nenhum lead com telefone encontrado. Envios via API criarão novos leads aqui.
                            </div>
                        )}
                    </div>
                </div>

                {/* Área da Conversa */}
                <div className="flex-1 flex flex-col bg-neutral-950/20 relative">
                    {activeLeadId ? (
                        <>
                            {/* Header da Conversa */}
                            <div className="p-4 border-b border-neutral-800 bg-neutral-900/80 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold uppercase">
                                    {activeLead?.company_name?.substring(0, 2) || 'LE'}
                                </div>
                                <div>
                                    <h2 className="text-white font-medium">{activeLead?.company_name || activeLead?.phone}</h2>
                                    <p className="text-xs text-neutral-500">Kanban: {activeLead?.column_id}</p>
                                </div>
                            </div>

                            {/* Mensagens */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-2xl max-w-[70%] ${msg.role === 'assistant' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-neutral-800 text-white rounded-tl-sm'}`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <div className="flex justify-end items-center gap-1 mt-1">
                                                <span className={`text-[10px] ${msg.role === 'assistant' ? 'text-emerald-200' : 'text-neutral-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.role === 'assistant' && <CheckCheck size={12} className="text-emerald-200" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-neutral-900/80 border-t border-neutral-800">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Digite uma mensagem para enviar..."
                                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputText.trim()}
                                        className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
                            <MessageCircle size={48} className="text-neutral-800 mb-4" />
                            <h3 className="text-lg font-medium text-neutral-400">Selecione uma conversa</h3>
                            <p className="text-sm max-w-sm mt-2">Clique em um contato ao lado para abrir o histórico do WhatsApp e enviar novas mensagens.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
