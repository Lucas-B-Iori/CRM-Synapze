import { create } from 'zustand';

export interface Card {
  id: string;
  column_id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  message: string;
  company_info: string;
  order_index: number;
  nicho?: string;
  lead_origin?: string;
  proof_link?: string;
  website?: string;
  test_result?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generated_messages?: any; // jsonb in DB
  is_ai_active?: boolean;
}

export interface Column {
  id: string;
  title: string;
  order_index: number;
}

interface KanbanState {
  columns: Column[];
  cards: Card[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  updateColumn: (id: string, title: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  addCard: (column_id: string, card: Omit<Card, 'id' | 'column_id' | 'order_index'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Omit<Card, 'id' | 'column_id'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, newOrder: number) => Promise<void>;
  reorderColumn: (columnId: string, newOrder: number) => Promise<void>;
}

import { supabase } from '@/lib/supabase';

const initialColumns: Column[] = [
  { id: 'col-1', title: 'Mensagem não enviada', order_index: 0 },
  { id: 'col-2', title: 'Mensagem enviada', order_index: 1 },
  { id: 'col-3', title: 'Follow-up', order_index: 2 },
];

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  cards: [],
  isLoading: true,

  fetchData: async () => {
    set({ isLoading: true });

    // Fetch columns
    const { data: dbColumns, error: colError } = await supabase
      .from('columns')
      .select('*')
      .order('order_index', { ascending: true });

    // Fetch leads
    const { data: dbLeads, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .order('order_index', { ascending: true });

    if (colError || leadError) {
      console.error('Error fetching kanban data:', colError, leadError);
      set({ isLoading: false });
      return;
    }

    if (!dbColumns || dbColumns.length === 0) {
      // Initialize default columns if database is empty
      for (const col of initialColumns) {
        await supabase.from('columns').insert([col]);
      }
      set({ columns: initialColumns, cards: dbLeads as Card[] || [], isLoading: false });
    } else {
      set({ columns: dbColumns as Column[], cards: dbLeads as Card[] || [], isLoading: false });
    }
  },

  addColumn: async (title) => {
    const newColumn: Column = {
      id: crypto.randomUUID(),
      title,
      order_index: get().columns.length,
    };

    const { error } = await supabase.from('columns').insert([newColumn]);
    if (!error) {
      set((state) => ({ columns: [...state.columns, newColumn] }));
    }
  },

  updateColumn: async (id, title) => {
    const { error } = await supabase.from('columns').update({ title }).eq('id', id);
    if (!error) {
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === id ? { ...col, title } : col
        ),
      }));
    }
  },

  deleteColumn: async (id) => {
    await supabase.from('leads').delete().eq('column_id', id);
    const { error } = await supabase.from('columns').delete().eq('id', id);

    if (!error) {
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== id),
        cards: state.cards.filter((card) => card.column_id !== id),
      }));
    }
  },

  addCard: async (column_id, cardData) => {
    const state = get();
    const columnCards = state.cards.filter((card) => card.column_id === column_id);
    const newCard: Card = {
      id: crypto.randomUUID(),
      column_id,
      ...cardData,
      order_index: columnCards.length,
    };

    const { error } = await supabase.from('leads').insert([newCard]);
    if (!error) {
      set((state) => ({ cards: [...state.cards, newCard] }));
    } else {
      console.error('Error adding card', error);
    }
  },

  updateCard: async (id, cardData) => {
    const { error } = await supabase.from('leads').update(cardData).eq('id', id);
    if (!error) {
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, ...cardData } : card
        ),
      }));
    }
  },

  deleteCard: async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
      }));
    }
  },

  moveCard: async (cardId, sourceColumnId, destinationColumnId, newOrder) => {
    const state = get();
    const cardToMove = state.cards.find((c) => c.id === cardId);
    if (!cardToMove) return;

    // Optimistic UI update
    set((state) => {
      const updatedCards = [...state.cards];
      const cardsInDest = updatedCards
        .filter((c) => c.column_id === destinationColumnId && c.id !== cardId)
        .sort((a, b) => a.order_index - b.order_index);

      const cardIndex = updatedCards.findIndex((c) => c.id === cardId);
      updatedCards.splice(cardIndex, 1);

      const updatedCardToMove = { ...cardToMove, column_id: destinationColumnId, order_index: newOrder };
      cardsInDest.splice(newOrder, 0, updatedCardToMove);

      cardsInDest.forEach((c, idx) => { c.order_index = idx; });

      if (sourceColumnId !== destinationColumnId) {
        const cardsInSource = updatedCards
          .filter((c) => c.column_id === sourceColumnId)
          .sort((a, b) => a.order_index - b.order_index);

        cardsInSource.forEach((c, idx) => { c.order_index = idx; });

        return {
          cards: [
            ...updatedCards.filter(c => c.column_id !== sourceColumnId && c.column_id !== destinationColumnId),
            ...cardsInSource,
            ...cardsInDest
          ]
        };
      }

      return {
        cards: [
          ...updatedCards.filter(c => c.column_id !== destinationColumnId),
          ...cardsInDest
        ]
      };
    });

    // Send update to Supabase
    const currentState = get();

    // Update the moved card
    await supabase.from('leads')
      .update({ column_id: destinationColumnId, order_index: newOrder })
      .eq('id', cardId);

    // Sync other affected cards in destination
    const destCards = currentState.cards.filter((c) => c.column_id === destinationColumnId);
    for (const c of destCards) {
      if (c.id !== cardId) {
        await supabase.from('leads').update({ order_index: c.order_index }).eq('id', c.id);
      }
    }

    // Sync other affected cards in source (if column changed)
    if (sourceColumnId !== destinationColumnId) {
      const sourceCards = currentState.cards.filter((c) => c.column_id === sourceColumnId);
      for (const c of sourceCards) {
        await supabase.from('leads').update({ order_index: c.order_index }).eq('id', c.id);
      }
    }
  },

  reorderColumn: async (columnId, newOrder) => {
    const state = get();
    const columnsContext = [...state.columns].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = columnsContext.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) return;

    // Optimistic Update
    set((state) => {
      const cols = [...state.columns].sort((a, b) => a.order_index - b.order_index);
      const [removed] = cols.splice(currentIndex, 1);
      cols.splice(newOrder, 0, removed);
      const updatedColumns = cols.map((c, idx) => ({ ...c, order_index: idx }));
      return { columns: updatedColumns };
    });

    // Sync to Supabase
    const currentState = get();
    for (const c of currentState.columns) {
      await supabase.from('columns').update({ order_index: c.order_index }).eq('id', c.id);
    }
  },
}));
