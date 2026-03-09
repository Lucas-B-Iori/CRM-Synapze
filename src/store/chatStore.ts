import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Card as Lead } from './kanbanStore';

export interface Message {
    id: string;
    lead_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface ChatState {
    leads: Lead[];
    messages: Message[];
    activeLeadId: string | null;
    isLoadingLeads: boolean;
    isLoadingMessages: boolean;

    fetchLeads: () => Promise<void>;
    setActiveLead: (leadId: string) => void;
    fetchMessages: (leadId: string) => Promise<void>;
    sendMessage: (leadId: string, phone: string, content: string) => Promise<void>;

    // Expose subscription function for realistic Whatsapp feel
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
}

import { RealtimeChannel } from '@supabase/supabase-js';

let messageSubscription: RealtimeChannel | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
    leads: [],
    messages: [],
    activeLeadId: null,
    isLoadingLeads: false,
    isLoadingMessages: false,

    fetchLeads: async () => {
        set({ isLoadingLeads: true });
        // Fetch all leads that have phones (assumed whatsapp candidates)
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .not('phone', 'is', null)
            .order('updated_at', { ascending: false });

        if (!error && data) {
            set({ leads: data });
        }
        set({ isLoadingLeads: false });
    },

    setActiveLead: (leadId) => {
        set({ activeLeadId: leadId });
        get().fetchMessages(leadId);
    },

    fetchMessages: async (leadId) => {
        set({ isLoadingMessages: true });
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            set({ messages: data });
        }
        set({ isLoadingMessages: false });
    },

    sendMessage: async (leadId, phone, content) => {
        // 1. Otimista (UX instantânea)
        const tempMsg: Message = {
            id: `temp-${Date.now()}`,
            lead_id: leadId,
            role: 'assistant', // O CRM humano respondendo fará papel de assistant aqui
            content: content,
            created_at: new Date().toISOString()
        };

        set((state) => ({ messages: [...state.messages, tempMsg] }));

        // 2. Chama a API de envio que fará a ponte com a Evolution
        try {
            const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, phone, content })
            });

            if (!res.ok) throw new Error('Falha no envio API');

            // Em teoria o proprio supabase emitiria o insert se a API salvou, entao a subscription pegaria. 
            // Mas podemos forcar refresh por precaução.
            get().fetchMessages(leadId);

        } catch (e) {
            console.error('Falha ao enviar msg via store:', e);
            // Retry/Rollback logic se necessario
        }
    },

    subscribeToMessages: () => {
        if (messageSubscription) return;

        messageSubscription = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new as Message;
                    const state = get();

                    // Se a msg for pro lead ativo, insere na tela na hora
                    if (state.activeLeadId === newMsg.lead_id) {
                        // Evitar duplicatas do optimisic update (checagem basica)
                        const exists = state.messages.find(m => m.id === newMsg.id || (m.content === newMsg.content && m.created_at >= new Date(Date.now() - 5000).toISOString()));

                        if (!exists) {
                            set({ messages: [...state.messages, newMsg] });
                        }
                    }

                    // Dar um bump no lead na lista (atualizar updated_at do lead seria o ideal, mas faking it for now)
                    get().fetchLeads();
                }
            )
            .subscribe();
    },

    unsubscribeFromMessages: () => {
        if (messageSubscription) {
            supabase.removeChannel(messageSubscription);
            messageSubscription = null;
        }
    }

}));
