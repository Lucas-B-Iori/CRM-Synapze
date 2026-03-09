"use client";

import { useState, useEffect } from "react";
import { Bot, FileText, MessageSquare, Clock, Loader2 } from "lucide-react";
import { useAgentStore } from "@/store/agentStore";

export function AgentSettings() {
    const [activeTab, setActiveTab] = useState<"persona" | "rag" | "scripts" | "limits">("persona");

    const { settings, scripts, documentCount, isLoading, fetchAgentData, updateSettings, addScript, updateScript, deleteScript, fetchDocumentCount, clearAllDocuments } = useAgentStore();

    const [localSettings, setLocalSettings] = useState({
        system_prompt: "",
        message_delay_minutes: 2,
        max_daily_messages: 100,
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAgentData();
    }, [fetchAgentData]);

    useEffect(() => {
        if (settings) {
            setLocalSettings({
                system_prompt: settings.system_prompt,
                message_delay_minutes: settings.message_delay_minutes,
                max_daily_messages: settings.max_daily_messages,
            });
        }
    }, [settings]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        await updateSettings(localSettings);
        setIsSaving(false);
    };

    const [isUploadingRag, setIsUploadingRag] = useState(false);
    const [ragUploadStatus, setRagUploadStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleRagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingRag(true);
        setRagUploadStatus(null);

        try {
            const text = await file.text();
            let chunks;
            try {
                // Remove caracteres de escape que podem vir no JSON bruto do ChatGPT
                const cleanedText = text.replace(/\\_/g, '_').replace(/\\[/g, '[').replace(/\\]/g, ']');
                chunks = JSON.parse(cleanedText);
            } catch {
                setRagUploadStatus({ message: 'O arquivo não é um JSON válido. Verifique se o ChatGPT formatou corretamente.', type: 'error' });
                setIsUploadingRag(false);
                return;
            }

            if (!Array.isArray(chunks)) {
                setRagUploadStatus({ message: 'O JSON deve ser uma lista (array) de chunks de texto.', type: 'error' });
                setIsUploadingRag(false);
                return;
            }

            const response = await fetch('/api/rag/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chunks })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro desconhecido na API');
            }

            setRagUploadStatus({ message: `Sucesso! ${data.successCount} chunks inseridos no banco RAG.`, type: 'success' });
            fetchDocumentCount();
        } catch (error: unknown) {
            const errBase = error as Error;
            setRagUploadStatus({ message: `Falha no envio: ${errBase.message}`, type: 'error' });
        } finally {
            setIsUploadingRag(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto border border-neutral-800 rounded-2xl bg-neutral-900/50 overflow-hidden flex flex-col min-h-[80vh]">
            <div className="flex border-b border-neutral-800 bg-neutral-900/80 p-4 gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("persona")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'persona' ? 'bg-indigo-500/20 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800'}`}
                >
                    <Bot size={18} />
                    Persona & System Prompt
                </button>
                <button
                    onClick={() => setActiveTab("scripts")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'scripts' ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-400 hover:bg-neutral-800'}`}
                >
                    <MessageSquare size={18} />
                    Roteiros e Objeções
                </button>
                <button
                    onClick={() => setActiveTab("rag")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'rag' ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-400 hover:bg-neutral-800'}`}
                >
                    <FileText size={18} />
                    Base de Conhecimento (RAG)
                </button>
                <button
                    onClick={() => setActiveTab("limits")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'limits' ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-400 hover:bg-neutral-800'}`}
                >
                    <Clock size={18} />
                    Limites Humanizados
                </button>
            </div>

            <div className="flex-1 p-6">
                {activeTab === "persona" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2">Instruções do Sistema (System Prompt)</h2>
                            <p className="text-sm text-neutral-400 mb-4">
                                Defina exatamente como a IA deve se comportar, qual o tom de voz e as regras inquebráveis.
                            </p>
                            <textarea
                                rows={10}
                                value={localSettings.system_prompt}
                                onChange={(e) => setLocalSettings({ ...localSettings, system_prompt: e.target.value })}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono text-sm leading-relaxed"
                                placeholder="Ex: Você é Maria, uma assistente jurídica sênior. Seu objetivo é sempre ser educada..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Salvando..." : "Salvar Persona"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "scripts" && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Roteiros de Abordagem Ativa</h2>
                                    <p className="text-sm text-neutral-400">
                                        Configure as mensagens iniciais e as cadências. A IA iniciará as conversas usando estas mensagens.
                                    </p>
                                </div>
                                <button
                                    onClick={() => addScript({ title: 'Novo Roteiro', content: '', script_type: 'roteiro' })}
                                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 text-sm font-medium transition-colors"
                                >
                                    + Adicionar Roteiro
                                </button>
                            </div>

                            {scripts.filter(s => s.script_type === 'roteiro').map((script) => (
                                <div key={script.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                                        <input
                                            value={script.title}
                                            onChange={(e) => updateScript(script.id, script.content, e.target.value)}
                                            className="font-medium text-emerald-400 bg-transparent border-none outline-none w-full"
                                            placeholder="Título do Roteiro"
                                        />
                                        <button
                                            onClick={() => deleteScript(script.id)}
                                            className="text-rose-500 hover:text-rose-400 text-sm ml-4 shrink-0 transition-colors"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <textarea
                                            rows={3}
                                            value={script.content}
                                            onChange={(e) => updateScript(script.id, e.target.value)}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                            placeholder="Conteúdo da mensagem..."
                                        />
                                    </div>
                                </div>
                            ))}

                            {scripts.filter(s => s.script_type === 'roteiro').length === 0 && (
                                <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                                    Nenhum roteiro cadastrado. Adicione um para começar.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "rag" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2">Base de Conhecimento Suprema (PDFs & Textos)</h2>
                            <p className="text-sm text-neutral-400 mb-6">
                                Faça o upload do arquivo <code>chunk.json</code> gerado pelo seu script. O CRM utilizará imediatamente a OpenAI para gerar os Embeddings e adicionar os vetores no banco de dados, igual ao n8n!
                            </p>

                            <label className="block border-2 border-dashed border-neutral-700 bg-neutral-950/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-neutral-900/50 hover:border-blue-500/50 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleRagUpload}
                                    disabled={isUploadingRag}
                                />
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FileText className="text-blue-400" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">
                                    {isUploadingRag ? 'Processando embeddings aguarde...' : 'Selecione o chunk.json aqui'}
                                </h3>
                                <p className="text-sm text-neutral-400 max-w-sm mb-6">
                                    O formato precisa ser aquele mesmo JSON com content, tokens, priority_level, etc.
                                </p>
                                {isUploadingRag && (
                                    <Loader2 className="animate-spin text-blue-400 mx-auto" size={24} />
                                )}
                                {!isUploadingRag && (
                                    <span className="px-5 py-2 rounded-lg bg-neutral-800 text-neutral-200 font-medium hover:bg-neutral-700 transition-colors pointer-events-none">
                                        Procurar Arquivo
                                    </span>
                                )}
                            </label>

                            {ragUploadStatus && (
                                <div className={`mt-4 p-4 rounded-xl text-sm ${ragUploadStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/50 text-rose-400'}`}>
                                    {ragUploadStatus.message}
                                </div>
                            )}

                            <div className="mt-8 space-y-3">
                                <h4 className="font-medium text-neutral-300 text-sm uppercase tracking-wider mb-4">Estatísticas do Banco RAG</h4>
                                <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                                            <FileText className="text-indigo-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Documentos (Chunks) Vectorizados</p>
                                            <p className="text-xs text-neutral-500">Prontos para serem buscados pela Inteligência</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-bold text-white bg-neutral-900 px-4 py-1 rounded-lg border border-neutral-800">
                                            {documentCount}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja APAGAR TODOS OS VETORES DO BANCO DE DADOS?')) {
                                                    clearAllDocuments();
                                                }
                                            }}
                                            className="text-rose-400 hover:text-rose-300 text-sm font-medium px-3 py-1 rounded-md hover:bg-rose-400/10 transition-colors"
                                        >
                                            Limpar RAG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "limits" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2">Comportamento Humanizado & Limites</h2>
                            <p className="text-sm text-neutral-400 mb-6">
                                Evite parecer um robô que responde em 1 segundo e proteja seu chip (Evolution API) de banimentos do WhatsApp por spam.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                                    <h3 className="font-medium text-amber-400 border-b border-neutral-800 pb-2">Delay de Digitação</h3>
                                    <div>
                                        <label className="block text-sm text-neutral-300 mb-2">Atraso mínimo antes de responder (minutos)</label>
                                        <input
                                            type="number"
                                            value={localSettings.message_delay_minutes}
                                            onChange={(e) => setLocalSettings({ ...localSettings, message_delay_minutes: Number(e.target.value) })}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-300 mb-2">Tempo de digitação extra por caractere (milissegundos)</label>
                                        <input type="number" defaultValue={50} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500/50" />
                                        <p className="text-xs text-neutral-500 mt-1">Ex: Uma mensagem de 100 caracteres levará (100 * 50ms) = 5 segundos &quot;digitando&quot;.</p>
                                    </div>
                                </div>

                                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                                    <h3 className="font-medium text-amber-400 border-b border-neutral-800 pb-2">Limites da Fila (Prospecção Ativa)</h3>
                                    <div>
                                        <label className="block text-sm text-neutral-300 mb-2">Máximo de mensagens ativas iniciadas por dia</label>
                                        <input
                                            type="number"
                                            value={localSettings.max_daily_messages}
                                            onChange={(e) => setLocalSettings({ ...localSettings, max_daily_messages: Number(e.target.value) })}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Salvando..." : "Salvar Comportamentos"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
