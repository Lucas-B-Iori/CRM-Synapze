"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { KanbanCard } from "./Card";
import { type Column as ColumnType, type Card as CardType } from "@/store/kanbanStore";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { CardModal } from "./CardModal";
import { ColumnModal } from "./ColumnModal";

interface ColumnProps {
    column: ColumnType;
    cards: CardType[];
    index: number;
}

export function KanbanColumn({ column, cards, index }: ColumnProps) {
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    return (
        <>
            <Draggable draggableId={column.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
              w-80 flex-shrink-0 flex flex-col bg-neutral-900/50 rounded-2xl border border-neutral-800/80
              ${snapshot.isDragging ? "ring-2 ring-indigo-500/50 opacity-90" : ""}
            `}
                    >
                        <div
                            {...provided.dragHandleProps}
                            className="p-4 flex justify-between items-center border-b border-neutral-800/80 cursor-grab active:cursor-grabbing"
                        >
                            <div className="flex items-center gap-3">
                                <h2 className="font-semibold text-neutral-100">{column.title}</h2>
                                <span className="bg-neutral-800 text-neutral-400 text-xs py-0.5 px-2 rounded-full font-medium">
                                    {cards.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsColumnModalOpen(true)}
                                className="text-neutral-500 hover:text-white transition-colors p-1 rounded-md hover:bg-neutral-800"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <Droppable droppableId={column.id} type="card">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`
                    flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]
                    ${snapshot.isDraggingOver ? "bg-indigo-500/5" : ""}
                  `}
                                >
                                    {cards.map((card, index) => (
                                        <KanbanCard key={card.id} card={card} index={index} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <div className="p-3 border-t border-neutral-800/50">
                            <button
                                onClick={() => setIsCardModalOpen(true)}
                                className="w-full flex items-center gap-2 justify-center py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700 border-dashed"
                            >
                                <Plus size={16} />
                                Add Contact
                            </button>
                        </div>
                    </div>
                )}
            </Draggable>

            <CardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                columnId={column.id}
            />
            <ColumnModal
                isOpen={isColumnModalOpen}
                onClose={() => setIsColumnModalOpen(false)}
                columnToEdit={column}
            />
        </>
    );
}
