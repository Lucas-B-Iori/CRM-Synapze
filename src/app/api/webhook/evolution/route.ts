import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Eventos da Evolution API (MESSAGES_UPSERT é o principal para mensagens novas)
        if (body.event !== 'messages.upsert') {
            return NextResponse.json({ success: true, message: 'Ignored non-message event' });
        }

        const messageData = body.data?.messages?.[0];
        if (!messageData) {
            return NextResponse.json({ success: true, message: 'No payload inside messages.upsert' });
        }

        // Se a mensagem for do próprio sistema, ignora (evitar loop infinito ou registrar duplicado)
        if (messageData.key.fromMe) {
            return NextResponse.json({ success: true, message: 'Ignored outgoing message' });
        }

        // Pega o número real da pessoa (formato do WhatsApp ex: 5511999999999@s.whatsapp.net)
        const remoteJid = messageData.key.remoteJid as string;

        // Extrai o número raw para usar no nosso banco
        const phoneNumber = remoteJid.split('@')[0];

        // O texto em si pode vir de varias formas dependendo do tipo (conversation, extendedTextMessage, etc)
        const messageContent = messageData.message?.conversation
            || messageData.message?.extendedTextMessage?.text
            || '[Mídia ou outro formato não suportado ainda]';

        console.log(`Nova mensagem de ${phoneNumber}: ${messageContent}`);

        // ----- LOGICA DE CRM: Encontrar ou Criar o Lead -----

        // 1. Tentar encontrar o lead
        let { data: lead } = await supabase
            .from('leads')
            .select('*')
            .eq('phone', phoneNumber)
            .single();

        if (!lead) {
            // 2. Se não existe, cria um Novo Lead no Kanban na coluna 'lead' (Entrada)
            const { data: newLead, error: insertError } = await supabase
                .from('leads')
                .insert([{
                    name: messageData.pushName || phoneNumber, // Nome do zap ou próprio número
                    phone: phoneNumber,
                    column_id: 'lead', // Coluna de entrada padrao
                    is_ai_active: true // Por padrão a ia ficaria ativa. Mas estamos bloqueando no código principal.
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Erro ao registrar novo Lead via Webhook:', insertError);
                return NextResponse.json({ error: 'Erro de banco.' }, { status: 500 });
            }
            lead = newLead;
        }

        // ----- LOGICA DE CRM: Salvar no Histórico -----
        const { error: msgError } = await supabase
            .from('messages')
            .insert([{
                lead_id: lead.id,
                role: 'user',
                content: messageContent,
            }]);

        if (msgError) {
            console.error('Erro ao salvar mensagem no histórico:', msgError);
        }

        // TODO: Disparar worker de RAG/IA aqui no futuro (quando Objetivo 4 ligar)
        // No momento: A IA ESTÁ DESLIGADA conforme solicitação do Lucas.
        console.log(`Mensagem registrada para lead ${lead.id}. IA não ativada ainda.`);

        return NextResponse.json({ success: true, lead_id: lead.id });

    } catch (error: unknown) {
        const errBase = error as Error;
        console.error('Evolution Webhook Error:', errBase.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
