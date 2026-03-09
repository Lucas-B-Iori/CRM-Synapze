import { Sidebar } from "@/components/layout/Sidebar";
import { AgentSettings } from "@/components/settings/AgentSettings";

export default function AgentSettingsPage() {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-200">
            <header className="h-16 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between px-6 shrink-0">
                <h1 className="text-lg font-semibold text-white">Configurações do Agente de IA</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-6 relative">
                <AgentSettings />
            </main>
        </div>
    );
}
