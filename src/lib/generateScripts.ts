
export function generateScripts(contactName: string) {
    const nameLabel = contactName || "Doutor(a)";

    return {
        script1: {
            msg1: `Olá ${nameLabel}, tudo bem? Meu nome é Lucas. Estava fazendo um mapeamento sobre captação no Direito do Consumidor e os anúncios do seu escritório apareceram para mim. Muito bem estruturados, por sinal.`,
            msg2: `Uma dúvida rápida: hoje vocês focam a operação para atender o cliente só em horário comercial, ou vocês têm alguma esteira automática para 'segurar' e qualificar aquele lead que clica no anúncio de madrugada e no final de semana?`
        },
        script2: {
            balloon1: `Olá ${nameLabel}, tudo bem? Acompanho o setor jurídico e vi as campanhas de vocês rodando no Meta. Estão com uma abordagem muito legal.`,
            balloon2: `Doutora, conversando com algumas bancas de Consumidor, notei um padrão no mercado: o custo do clique até tá legal, mas muita gente esbarra na 'janela de 5 minutos' (o cliente chama no WhatsApp, a equipe demora um pouquinho por causa da demanda, e o cara some). Vocês também sentem esse desafio com leads frios, ou o fluxo de vocês já tá redondo nisso?`
        },
        script3: {
            msg1: `Olá ${nameLabel}, tudo bem? Estava analisando as tendências de tráfego de escritórios de Consumidor e caí nos anúncios de vocês.`,
            msg2: `Notei que vocês usam a estratégia de mandar o tráfego direto pro WhatsApp. É ótimo para volume, mas costuma trazer muito 'curioso' que toma o tempo de triagem da equipe, né? Eu estruturei um mapa visual mostrando como alguns escritórios estão usando IA para filtrar esse curioso automaticamente antes de a mensagem chegar no advogado. Faz sentido eu te mandar um PDF/Vídeo rápido pra dar uma olhada (sem compromisso)?`
        }
    };
}
