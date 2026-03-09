import Link from 'next/link';
import { MessageCircle, LayoutDashboard, Users, Settings } from 'lucide-react';

export function Sidebar() {
    return (
        <div className="w-64 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col p-4 text-white shrink-0">
            <div className="text-2xl font-bold mb-8 tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent px-2">
                CRM PRO
            </div>
            <nav className="flex-1 space-y-2">
                <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Board</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                    <Users size={20} />
                    <span className="font-medium">Contatos</span>
                </Link>
                <Link href="/whatsapp" className="flex items-center space-x-3 p-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                    <MessageCircle size={20} />
                    <span className="font-medium">WhatsApp</span>
                </Link>
                <Link href="/settings/agent" className="flex items-center space-x-3 p-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                    <Settings size={20} />
                    <span className="font-medium">Agente IA</span>
                </Link>
            </nav>

            <div className="mt-auto pt-4 border-t border-neutral-800">
                <div className="flex items-center space-x-3 p-3 text-sm text-neutral-400">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        U
                    </div>
                    <div>
                        <p className="font-medium text-white">User</p>
                        <p className="text-xs">Free Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
