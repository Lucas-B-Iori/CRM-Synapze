export const evolutionApi = {
    /**
     * Envia uma mensagem de texto via Evolution API
     */
    async sendMessage(number: string, text: string) {
        const url = process.env.EVOLUTION_API_URL;
        const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
        const apiKey = process.env.EVOLUTION_API_KEY;

        if (!url || !instanceName || !apiKey) {
            console.error('EVOLUTION API credentials missing in .env.local');
            return { success: false, error: 'Credenciais ausentes' };
        }

        try {
            // Formata numero (Evolution API geralmente prefere formato internacional 5511999999999)
            const cleanNumber = number.replace(/\D/g, '');
            // Ideal é garantir o DDI. Simplificação para MVP:
            const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

            console.log(`[EVOLUTION SEND] Sending to ${url}/message/sendText/${encodeURIComponent(instanceName)}`);

            const response = await fetch(`${url}/message/sendText/${encodeURIComponent(instanceName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey,
                    // Evolution 2.0 often expects Authorization Bearer
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    number: formattedNumber,
                    textMessage: {
                        text: text
                    },
                    options: {
                        delay: 1200,
                        presence: 'composing'
                    }
                })
            });

            const data = await response.json().catch(() => ({ message: 'Cannot parse JSON response' }));

            if (!response.ok) {
                console.error("[EVOLUTION API RAW ERROR]:", JSON.stringify(data, null, 2));
                throw new Error(data.message || data.error || 'Erro desconhecido na Evolution API');
            }

            return { success: true, data };
        } catch (error: unknown) {
            const e = error as Error;
            console.error('Evolution API Send Error:', e);
            return { success: false, error: e.message };
        }
    }
};
