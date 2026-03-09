"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./Column";
import { useKanbanStore } from "@/store/kanbanStore";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ColumnModal } from "./ColumnModal";

export function Board() {
    const { columns, cards, moveCard, reorderColumn } = useKanbanStore();
    const [mounted, setMounted] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    useEffect(() => {
        useKanbanStore.getState().fetchData().then(() => {
            setMounted(true);
        });
    }, []);

    if (!mounted) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-500">
                Loading board...
            </div>
        );
    }

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === "column") {
            reorderColumn(draggableId, destination.index);
            return;
        }

        // It's a card
        moveCard(draggableId, source.droppableId, destination.droppableId, destination.index);
    };

    const sortedColumns = [...columns].sort((a, b) => a.order_index - b.order_index);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" type="column" direction="horizontal">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex h-full p-6 p-8 overflow-x-auto overflow-y-hidden gap-6 items-start items-stretch"
                    >
                        {sortedColumns.map((column, index) => {
                            const columnCards = cards
                                .filter((c) => c.column_id === column.id)
                                .sort((a, b) => a.order_index - b.order_index);

                            return (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    cards={columnCards}
                                    index={index}
                                />
                            );
                        })}
                        {provided.placeholder}

                        <button
                            onClick={() => setIsColumnModalOpen(true)}
                            className="flex-shrink-0 w-80 flex items-center gap-2 justify-center py-4 rounded-2xl text-sm font-medium text-neutral-400 bg-neutral-900/40 hover:text-white hover:bg-neutral-800 transition-colors border border-neutral-800 border-dashed h-fit">
                            <Plus size={18} />
                            Add Column
                        </button>
                    </div>
                )}
            </Droppable>

            <ColumnModal
                isOpen={isColumnModalOpen}
                onClose={() => setIsColumnModalOpen(false)}
            />
        </DragDropContext>
    );
}
