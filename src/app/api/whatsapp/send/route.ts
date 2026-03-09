import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { evolutionApi } from '@/lib/evolution';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { leadId, phone, content } = await req.json();

        if (!leadId || !phone || !content) {
            return NextResponse.json({ error: 'Faltam dados obrigatórios' }, { status: 400 });
        }

        // 1. Tentar enviar via Evolution API primeiro
        const evolutionResponse = await evolutionApi.sendMessage(phone, content);

        if (!evolutionResponse.success) {
            console.error('Falha na Evolution API:', evolutionResponse.error);
            return NextResponse.json({ error: 'Falha ao enviar mensagem para o WhatsApp' }, { status: 502 });
        }

        // 2. Se enviou com sucesso pro zap, registrar no nosso banco como Assistant (que na verdade é o app enviando)
        // Isso garante que fica na timeline
        const { error: dbError } = await supabase.from('messages').insert({
            lead_id: leadId,
            role: 'assistant',
            content: content
        });

        if (dbError) {
            console.error('Erro ao salvar msg de saída no banco:', dbError);
            // A msg já chegou no cliente, então podemos retornar 200, mas com warning no log.
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const _e = error as Error;
        console.error('Erro no /api/whatsapp/send:', _e.message);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
