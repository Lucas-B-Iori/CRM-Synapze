"use client";

import { Draggable } from "@hello-pangea/dnd";
import { type Card as CardType } from "@/store/kanbanStore";
import { Phone, User, MessageCircle } from "lucide-react";
import { useState } from "react";
import { CardModal } from "./CardModal";

interface CardProps {
    card: CardType;
    index: number;
}

export function KanbanCard({ card, index }: CardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <Draggable draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setIsEditModalOpen(true)}
                        className={`
              bg-neutral-800/80 p-4 rounded-xl border border-neutral-700/50 
              shadow-sm hover:border-indigo-500/50 transition-colors cursor-grab active:cursor-grabbing
              ${snapshot.isDragging ? "shadow-xl ring-2 ring-indigo-500 border-indigo-500 bg-neutral-800" : ""}
            `}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-white text-sm tracking-wide">
                                {card.company_name}
                            </h3>
                        </div>
                        <div className="space-y-2 text-xs text-neutral-400">
                            {card.contact_name && (
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-neutral-500" />
                                    <span>{card.contact_name}</span>
                                </div>
                            )}
                            {card.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-neutral-500" />
                                    <span>{card.phone}</span>
                                </div>
                            )}
                            {card.message && (
                                <div className="flex items-center gap-2 text-indigo-400 mt-2 bg-indigo-500/10 p-2 rounded truncate max-w-full">
                                    <MessageCircle size={14} className="shrink-0" />
                                    <span className="truncate">{card.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Draggable>

            <CardModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                cardToEdit={card}
            />
        </>
    );
}
