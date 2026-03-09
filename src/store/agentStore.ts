import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface AgentSettings {
    id?: string;
    system_prompt: string;
    active: boolean;
    message_delay_minutes: number;
    max_daily_messages: number;
}

export interface AgentScript {
    id: string;
    title: string;
    content: string;
    script_type: 'roteiro' | 'objecao';
}

interface AgentState {
    settings: AgentSettings | null;
    scripts: AgentScript[];
    documentCount: number;
    isLoading: boolean;
    fetchAgentData: () => Promise<void>;
    fetchDocumentCount: () => Promise<void>;
    clearAllDocuments: () => Promise<void>;
    updateSettings: (settings: Partial<AgentSettings>) => Promise<void>;
    addScript: (script: Omit<AgentScript, 'id'>) => Promise<void>;
    updateScript: (id: string, content: string, title?: string) => Promise<void>;
    deleteScript: (id: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
    settings: null,
    scripts: [],
    documentCount: 0,
    isLoading: true,

    fetchAgentData: async () => {
        set({ isLoading: true });

        // Fetch Settings (Assuming there's only one row for MVP)
        const { data: settingsData, error: settingsError } = await supabase
            .from('agent_settings')
            .select('*')
            .limit(1)
            .single();

        if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is 'not found'
            console.error('Error fetching agent settings:', settingsError);
        }

        // Initialize default settings if none exist
        let currentSettings = settingsData;
        if (!settingsData && (!settingsError || settingsError.code === 'PGRST116')) {
            const defaultSettings = {
                system_prompt: 'Você é um(a) Assistente Especialista de Prospecção do escritório.',
                active: false,
                message_delay_minutes: 2,
                max_daily_messages: 100
            };
            const { data: insertedSettings, error: insertError } = await supabase
                .from('agent_settings')
                .insert([defaultSettings])
                .select()
                .single();

            if (!insertError) {
                currentSettings = insertedSettings;
            }
        }

        // Fetch Scripts
        const { data: scriptsData, error: scriptsError } = await supabase
            .from('agent_scripts')
            .select('*')
            .order('created_at', { ascending: true });

        if (scriptsError) {
            console.error('Error fetching agent scripts:', scriptsError);
        }

        set({
            settings: currentSettings || null,
            scripts: scriptsData || [],
            isLoading: false
        });
    },

    updateSettings: async (newSettings) => {
        const currentState = get();
        if (!currentState.settings?.id) return;

        // Optimistic Update
        set((state) => ({
            settings: state.settings ? { ...state.settings, ...newSettings } : null
        }));

        const { error } = await supabase
            .from('agent_settings')
            .update(newSettings)
            .eq('id', currentState.settings.id);

        if (error) {
            console.error('Error updating settings:', error);
            // Rollback is recommended in a real app
        }
    },

    addScript: async (scriptData) => {
        const { data, error } = await supabase
            .from('agent_scripts')
            .insert([scriptData])
            .select()
            .single();

        if (!error && data) {
            set((state) => ({ scripts: [...state.scripts, data] }));
        } else {
            console.error('Error adding script:', error);
        }
    },

    updateScript: async (id, content, title) => {
        const updatePayload: Partial<AgentScript> = { content };
        if (title) updatePayload.title = title;

        set((state) => ({
            scripts: state.scripts.map(s => s.id === id ? { ...s, ...updatePayload } : s)
        }));

        const { error } = await supabase
            .from('agent_scripts')
            .update(updatePayload)
            .eq('id', id);

        if (error) {
            console.error('Error updating script:', error);
        }
    },

    deleteScript: async (id) => {
        set((state) => ({
            scripts: state.scripts.filter(s => s.id !== id)
        }));

        const { error } = await supabase
            .from('agent_scripts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting script:', error);
        }
    },

    fetchDocumentCount: async () => {
        const { count, error } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
            set({ documentCount: count });
        } else if (error) {
            console.error('Error fetching document count:', error);
        }
    },

    clearAllDocuments: async () => {
        // Warning: This deletes everything in the documents table
        const { error } = await supabase
            .from('documents')
            .delete()
            .neq('id', 0); // Hacky way to delete all rows avoiding no-filter restriction if any

        if (!error) {
            set({ documentCount: 0 });
        } else {
            console.error('Error clearing documents:', error);
        }
    }
}));
