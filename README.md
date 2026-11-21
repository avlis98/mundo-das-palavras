# Mundo das Palavras

Plataforma inteligente e adaptativa de alfabetização infantil em Português Brasileiro (`pt-BR`), desenvolvida como Progressive Web App (PWA) responsiva para celulares Android, tablets e computadores Windows.

## Visão Geral

- **Público-alvo**: Crianças em processo de alfabetização (aprox. 7 a 9 anos), com suporte a múltiplos perfis individuais.
- **Personagem guia**: **Lumi**, a corujinha curiosa que acolhe, explica, incentiva e comemora conquistas sem punições ou rankings competitivos.
- **Privacidade e LGPD**: 100% *local-first* usando **IndexedDB**. Sem anúncios, sem chat público e sem envio automático de dados ou gravações de voz para servidores externos.

## Funcionalidades Implementadas

### 1. Estrutura Pedagógica (7 Níveis / Mundos)
1. **Mundo das Letras**: Alfabeto completo, maiúsculas/minúsculas, vogais/consoantes, som da letra (fonema) e palavra-âncora.
2. **Mundo dos Sons**: Consciência fonológica, contagem de sílabas e separação sonora.
3. **Fábrica de Sílabas**: Combinador interativo de Consoante + Vogal (`B + A = BA`) e leitura de sílabas.
4. **Construindo Palavras**: Ensino progressivo de sílabas simples e padrões ortográficos (`CH`, `LH`, `NH`, `RR`, `SS`, `QU`, `GU`).
5. **Leitura de Frases**: Frases curtas com áudio de apoio e perguntas de compreensão.
6. **Pequenas Histórias**: Biblioteca de histórias originais com narração, destaque de frases e perguntas literais, inferenciais e de vocabulário.
7. **Escrita e Ortografia**: Ditados, escrita livre de minihistórias e lousa tátil (`HandwritingCanvas`) para treino motor com dedo ou mouse.

### 2. Os 10 Jogos Educativos Funcionais
1. **Caçadora de Sons** (`sound-hunter`)
2. **Fábrica de Palavras** (`word-factory`)
3. **Robô do Ditado** (`dictation-robot`)
4. **Detetive das Histórias** (`story-detective`)
5. **Palavra Misteriosa** (`mystery-word`)
6. **Qual é o Som Inicial?** (`initial-sound`)
7. **Palavra Incompleta** (`incomplete-word`)
8. **Construtor de Frases** (`sentence-builder`)
9. **Leitura em Aventura / Contra o Relógio** (`timed-reading` — sem punição por velocidade)
10. **Escuta e Escreve** (`listen-and-write`)

### 3. Motor de Aprendizagem Adaptativa (`src/adaptive/engine.ts`)
- Rastreamento individual por habilidade (`SkillMastery`): tentativas, acertos, sequência recente, pontuação ponderada (70% desempenho recente + 30% histórico total) e tempo médio de resposta.
- **Critério de domínio multi-tentativa**: exige no mínimo `3` tentativas, pontuação ≥ `80` e `2` acertos consecutivos (nunca avança com um único acerto isolado).
- **Repetição espaçada**: intervalos progressivos de `1, 3, 7 e 14 dias` para revisão; em caso de dificuldade, agenda revisão rápida (~4 horas).
- **Detector de confusões**: identifica trocas recorrentes como `M/N`, `B/P`, `B/D`, `F/V`, `T/D`, `S/Z`, `CH/X`, `LH/LI`, `NH/NI`, `RR/R`, `SS/S`, `Ç/S` e prioriza essas letras/sons nas próximas atividades.

### 4. Avaliação Inicial, Missão Diária e Painel dos Responsáveis
- **Avaliação diagnóstica lúdica**: adapta o nível inicial sem caráter punitivo e sem emitir diagnósticos clínicos.
- **Missão Diária**: rotina configurável (padrão 15 min) em 5 blocos (Revisão, Descoberta, Jogo, Leitura/Escrita, Recompensa).
- **Painel dos Responsáveis (PIN padrão: `1234`)**: gráficos reais de leitura e escrita, evolução semanal/mensal, dificuldades identificadas, palavras com maior índice de erro, histórico de atividades, recomendações práticas, exportação/importação JSON e reinicialização/exclusão segura de perfil.

## Como Executar

Pré-requisito: **Node.js LTS** (já instalado neste ambiente).

```powershell
# Na pasta do projeto:
cd c:\Users\André\Desktop\projetos\mundo-das-palavras

# Instalar dependências (se necessário):
npm.cmd install

# Executar em modo de desenvolvimento:
npm.cmd run dev

# Executar testes automatizados:
npm.cmd test

# Gerar build de produção (PWA):
npm.cmd run build

# Visualizar build de produção localmente:
npm.cmd run preview
```

> **Nota para Windows PowerShell**: Caso a política de execução de scripts bloqueie `npm`, utilize `npm.cmd` conforme os comandos acima.

## Banco de Dados
- Utiliza **IndexedDB** nativo do navegador via biblioteca `idb` (`src/services/db.ts`).
- Nenhuma credencial ou banco externo é necessário para funcionar 100% offline.
- Backups entre dispositivos podem ser feitos no **Painel dos Responsáveis → Exportar dados (JSON) / Importar backup**.

## Como Publicar (Deploy)
O build gera arquivos estáticos completos na pasta `dist/`, compatíveis com hospedagem gratuita HTTPS (necessária para instalação como PWA em Android/Desktop):
- **Vercel / Netlify / Cloudflare Pages**: conecte o repositório ou faça upload da pasta `dist/` (comando de build: `npm run build`, diretório de saída: `dist`).

## Limitações Conhecidas
1. **Pronúncia de fonemas isolados no TTS**: a síntese de voz `speechSynthesis` (`pt-BR`) varia conforme o sistema operacional e pode ler o nome da letra em vez do fonema puro; por isso o app combina aproximações fonéticas (`phonemeHint`) com palavras-âncora e apoio visual.
2. **Reconhecimento de fala (`SpeechRecognition`)**: depende de suporte do navegador (funciona melhor em Chrome/Edge). Nunca é obrigatório e nunca marca erro automático em caso de baixa confiança ou ruído.
3. **Escrita manual na tela**: a lousa (`HandwritingCanvas`) é voltada ao treino motor livre com referência visual; a correção ortográfica automática utiliza o teclado ou os blocos táteis de letras/sílabas.
