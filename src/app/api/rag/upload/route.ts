import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Em produção, seria ideal usar SERVICE_ROLE_KEY caso RLS não fosse 100% true
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { chunks } = await req.json();

        if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
            return NextResponse.json(
                { error: 'Por favor, envie um array válido de chunks no formato JSON.' },
                { status: 400 }
            );
        }

        console.log(`Recebido JSON com ${chunks.length} chunks para processar.`);

        const successes = [];
        const failures = [];

        // Processamento sequencial (poderia usar Promise.all em lotes pra ser mais rápido)
        for (const chunk of chunks) {
            try {
                const content = chunk.content;
                if (!content) {
                    failures.push({ chunk_id: chunk.chunk_id, reason: 'Sem campo content' });
                    continue;
                }

                // Gera embedding na OpenAI (usa small embeddings, dimensão 1536)
                const response = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: content,
                });
                const embedding = response.data[0].embedding;

                // Limpa alguns dados para virar metadata
                const metadata = {
                    chunk_id: chunk.chunk_id,
                    section_path: chunk.section_path,
                    token_count: chunk.token_count,
                    content_type: chunk.content_type,
                    priority_level: chunk.priority_level,
                    keywords: chunk.keywords,
                    is_actionable: chunk.is_actionable,
                };

                // Insere no Supabase
                const { error: dbError } = await supabase.from('documents').insert({
                    content: content,
                    metadata: metadata,
                    embedding: embedding,
                });

                if (dbError) {
                    console.error(`Erro ao inserir chunk ${chunk.chunk_id}:`, dbError);
                    failures.push({ chunk_id: chunk.chunk_id, reason: dbError.message });
                } else {
                    successes.push(chunk.chunk_id);
                }
            } catch (e: unknown) {
                const _e = e as Error;
                console.error(`Falha inesperada no chunk ${chunk.chunk_id}:`, _e);
                failures.push({ chunk_id: chunk.chunk_id, reason: _e.message });
            }
        }

        return NextResponse.json({
            success: true,
            total: chunks.length,
            successCount: successes.length,
            failureCount: failures.length,
            failures,
        });
    } catch (error: unknown) {
        console.error('Erro na API de RAG/Upload:', error);
        return NextResponse.json(
            { error: 'Falha interna no servidor ao processar os chunks.' },
            { status: 500 }
        );
    }
}
