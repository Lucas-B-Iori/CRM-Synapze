/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useKanbanStore, type Column } from "@/store/kanbanStore";

interface ColumnModalProps {
    isOpen: boolean;
    onClose: () => void;
    columnToEdit?: Column;
}

export function ColumnModal({ isOpen, onClose, columnToEdit }: ColumnModalProps) {
    const { addColumn, updateColumn } = useKanbanStore();

    const [title, setTitle] = useState("");

    useEffect(() => {
        if (columnToEdit) {
            setTitle(columnToEdit.title);
        } else {
            setTitle("");
        }
    }, [columnToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (columnToEdit) {
            updateColumn(columnToEdit.id, title);
        } else {
            addColumn(title);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={columnToEdit ? "Edit Column" : "Add New Column"}>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                    <label className="text-neutral-400 font-medium">Column Name <span className="text-rose-500">*</span></label>
                    <input
                        autoFocus
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="e.g. Negotiation"
                    />
                </div>

                <div className="pt-4 flex justify-between items-center pb-2">
                    {columnToEdit ? (
                        <button
                            type="button"
                            onClick={() => {
                                const confirmed = window.confirm(`Are you sure you want to delete "${columnToEdit.title}" and all its contacts?`);
                                if (confirmed) {
                                    useKanbanStore.getState().deleteColumn(columnToEdit.id);
                                    onClose();
                                }
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                        >
                            {columnToEdit ? "Save Changes" : "Create Column"}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
