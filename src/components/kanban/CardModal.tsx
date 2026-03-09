/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useKanbanStore, type Card } from "@/store/kanbanStore";
import { Copy, Check } from "lucide-react";

interface CardModalProps {
    isOpen: boolean;
    onClose: () => void;
    columnId?: string;
    cardToEdit?: Card;
}

function ScriptMessage({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 relative group">
            <span className="text-xs text-neutral-500 block mb-1 font-medium">{label}</span>
            <p className="pr-8 text-neutral-300">{text}</p>
            <button
                type="button"
                onClick={() => {
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors"
                title="Copiar área de transferência"
            >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
        </div>
    );
}

export function CardModal({ isOpen, onClose, columnId, cardToEdit }: CardModalProps) {
    const { addCard, updateCard } = useKanbanStore();

    const [activeTab, setActiveTab] = useState<"info" | "scripts">("info");

    const [formData, setFormData] = useState({
        company_name: "",
        contact_name: "",
        phone: "",
        message: "",
        company_info: "",
        nicho: "",
        lead_origin: "",
        proof_link: "",
        website: "",
        test_result: "",
    });

    useEffect(() => {
        if (!isOpen) {
            setActiveTab("info");
        }
        if (cardToEdit) {
            setFormData({
                company_name: cardToEdit.company_name,
                contact_name: cardToEdit.contact_name,
                phone: cardToEdit.phone || "",
                message: cardToEdit.message || "",
                company_info: cardToEdit.company_info || "",
                nicho: cardToEdit.nicho || "",
                lead_origin: cardToEdit.lead_origin || "",
                proof_link: cardToEdit.proof_link || "",
                website: cardToEdit.website || "",
                test_result: cardToEdit.test_result || "",
            });
        } else {
            setFormData({
                company_name: "",
                contact_name: "",
                phone: "",
                message: "",
                company_info: "",
                nicho: "",
                lead_origin: "",
                proof_link: "",
                website: "",
                test_result: "",
            });
        }
    }, [cardToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cardToEdit) {
            updateCard(cardToEdit.id, formData);
        } else if (columnId) {
            addCard(columnId, formData);
        }
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={cardToEdit ? "Edit Contact" : "Add New Contact"}>
            <div className="flex gap-4 border-b border-neutral-800 pb-0 mb-4 px-1">
                <button
                    type="button"
                    onClick={() => setActiveTab("info")}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                    Detalhes
                </button>
                {cardToEdit?.generated_messages && (
                    <button
                        type="button"
                        onClick={() => setActiveTab("scripts")}
                        className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'scripts' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
                        Roteiros de Abordagem
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === "info" ? (
                    <>
                        <div className="space-y-1.5">
                            <label className="text-neutral-400 font-medium">Company Name <span className="text-rose-500">*</span></label>
                            <input
                                autoFocus
                                required
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-neutral-400 font-medium">Contact Name</label>
                                <input
                                    name="contact_name"
                                    value={formData.contact_name}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. John Doe / Dra. Maria"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-neutral-400 font-medium">Phone Number</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. (11) 99999-9999"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-neutral-400 font-medium">Niche</label>
                                <input
                                    name="nicho"
                                    value={formData.nicho}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Consumidor"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-neutral-400 font-medium">Lead Origin</label>
                                <input
                                    name="lead_origin"
                                    value={formData.lead_origin}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Meta Ads"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-neutral-400 font-medium">Website</label>
                                <input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. https://..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-neutral-400 font-medium">Test Result</label>
                                <input
                                    name="test_result"
                                    value={formData.test_result}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. 2 minutos"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-neutral-400 font-medium">Proof Link</label>
                            <input
                                name="proof_link"
                                value={formData.proof_link}
                                onChange={handleChange}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                placeholder="Link da biblioteca de anúncios"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-neutral-400 font-medium">Company Info / Notes</label>
                            <textarea
                                name="company_info"
                                value={formData.company_info}
                                onChange={handleChange}
                                rows={2}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                                placeholder="Important details about the company..."
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 pb-2">
                        {cardToEdit?.generated_messages && (
                            <>
                                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-emerald-400 text-sm">🟢 Roteiro 1: Curiosidade de Mercado</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <ScriptMessage text={cardToEdit.generated_messages.script1.msg1} label="Mensagem 1" />
                                        <ScriptMessage text={cardToEdit.generated_messages.script1.msg2} label="Mensagem 2" />
                                    </div>
                                </div>
                                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-amber-400 text-sm">🟡 Roteiro 2: Desafio Compartilhado</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <ScriptMessage text={cardToEdit.generated_messages.script2.balloon1} label="Balão 1" />
                                        <ScriptMessage text={cardToEdit.generated_messages.script2.balloon2} label="Balão 2" />
                                    </div>
                                </div>
                                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-blue-400 text-sm">🔵 Roteiro 3: Insights</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <ScriptMessage text={cardToEdit.generated_messages.script3.msg1} label="Mensagem 1" />
                                        <ScriptMessage text={cardToEdit.generated_messages.script3.msg2} label="Mensagem 2" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="pt-4 flex justify-between items-center pb-2 sticky bottom-0 bg-neutral-900">
                    {cardToEdit ? (
                        <button
                            type="button"
                            onClick={() => {
                                useKanbanStore.getState().deleteCard(cardToEdit.id);
                                onClose();
                            }}
                            className="px-4 py-2.5 rounded-lg font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                        >
                            Delete
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                        >
                            Close
                        </button>
                        {activeTab === "info" && (
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                            >
                                {cardToEdit ? "Save Changes" : "Create Contact"}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
