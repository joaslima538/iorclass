import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, Send, X } from "lucide-react";

const topics = [
  {
    keywords: ["aluno", "aluna", "alunos", "turma", "grupo"],
    prompt: "Como cadastro um aluno?",
    answer: "Abra Alunos → Listar Alunos e clique em Novo aluno. Preencha os dados, escolha o curso e finalize o cadastro. Para montar uma turma, use Novo grupo e selecione os alunos.",
    next: "Na listagem você pode buscar por nome, e-mail ou curso. Use Lista para consultar os detalhes ou Kanban para ver os alunos organizados por curso.",
  },
  {
    keywords: ["agenda", "horario", "agendar", "reagendar", "aula", "aulas", "recorrencia", "meet"],
    prompt: "Como agendo uma aula?",
    answer: "Abra Agenda → Novo agendamento. Selecione o aluno ou grupo, informe a data e os horários e salve. Para repetir a aula, escolha a recorrência semanal no formulário.",
    next: "Para concluir uma aula, use o botão de confirmação em Aulas de Hoje. Na Agenda, você também pode abrir a aula agendada e marcar como realizada.",
  },
  {
    keywords: ["financeiro", "cobranca", "pagamento", "mensalidade", "pagar"],
    prompt: "Como confirmo um pagamento?",
    answer: "Abra Financeiro, encontre a mensalidade em Pendentes e clique em Confirmar pagamento. Para despesas ou receitas pessoais, use Financeiro → Financeiro Pessoal.",
    next: "Você pode exportar os lançamentos filtrados em CSV. Os valores e pagamentos desta demonstração ficam no navegador.",
  },
  {
    keywords: ["parceiro", "parceiros", "permissao", "permissoes", "equipe"],
    prompt: "Como adiciono um professor à equipe?",
    answer: "Em Parceiros → Listar Parceiros, preencha o nome e o e-mail do professor. Marque Ver tela em cada área permitida e, ao lado, escolha as ações que ele pode executar. Clique em Salvar parceiro.",
    next: "Para mudar o acesso, use Editar parceiro. Essas permissões são demonstrativas. Para acompanhar as aulas dele, selecione o parceiro responsável no agendamento e abra o Relatório de Trabalho Parceiro.",
  },
  {
    keywords: ["arquivo", "arquivos", "pasta", "pastas", "upload", "anexo"],
    prompt: "Como adiciono um arquivo?",
    answer: "Abra Arquivos e escolha Adicionar arquivo. Selecione o arquivo, a pasta de destino e, se quiser, adicione etiquetas. Clique em Salvar arquivo.",
    next: "Use Nova pasta para organizar os materiais. Na linha de um arquivo, você pode trocar a pasta, baixar ou excluir o arquivo.",
  },
  {
    keywords: ["tarefa", "tarefas", "checklist", "prazo", "subtarefa"],
    prompt: "Como crio uma tarefa com checklist?",
    answer: "Na página Tarefas, clique em Nova tarefa. Digite o título, escolha a etapa e, se precisar, coloque o prazo. Abra Adicionar descrição ou checklist e escreva um item por linha.",
    next: "Clique no título do cartão para ver os detalhes, anexar arquivos e atualizar o checklist. Para mover uma tarefa, arraste o cartão ou use o seletor de etapa.",
  },
  {
    keywords: ["relatorio", "relatorios", "exportar", "csv", "pdf", "extrato"],
    prompt: "Como exporto um relatório?",
    answer: "No menu Relatórios, abra o relatório desejado e aplique os filtros. Use Exportar CSV filtrado ou Imprimir / PDF. O arquivo leva os registros que aparecem na tela.",
    next: "No Extrato de Aulas, escolha um aluno ou grupo. Você também pode incluir as anotações do professor.",
  },
  {
    keywords: ["recado", "recados", "aviso", "mensagem"],
    prompt: "Onde publico um recado?",
    answer: "Em Alunos → Painel Geral de Recados, escreva o aviso, marque os destinatários e clique em Publicar recado. Para professores da equipe, use o Painel Geral de Recados em Parceiros.",
    next: "No app de demonstração da Mariana aparecem somente os recados endereçados a ela ou a grupos dos quais ela faz parte.",
  },
  {
    keywords: ["atividade", "atividades", "avaliar", "resposta"],
    prompt: "Como envio uma atividade?",
    answer: "Em Atividades, clique em Nova atividade, escreva o enunciado e escolha o destinatário. Na demo, a Mariana pode abrir a atividade e salvar uma resposta no app do aluno.",
    next: "Quando a resposta aparecer em Atividades, você pode marcar como avaliada ou pedir para refazer.",
  },
  {
    keywords: ["beneficio", "beneficios", "vantagem", "oferta", "ofertas", "flui"],
    prompt: "O que é a tela de benefícios?",
    answer: "Meus Benefícios reúne as vantagens e ofertas destinadas aos professores. Na demonstração, você encontra um exemplo de catálogo da Flui, com recursos para aulas de inglês.",
    next: "Para encontrar o catálogo, abra Meus Benefícios no menu lateral. O cartão da Flui está identificado como exemplo da demonstração.",
  },
  {
    keywords: ["perfil", "configuracoes", "estudio", "cor"],
    prompt: "Como personalizo meu perfil?",
    answer: "Em Configurações, edite seu nome, estúdio, área de ensino e cor de destaque. Use Salvar perfil para aplicar as mudanças.",
    next: "O app do aluno usa o nome do estúdio e a cor que você escolheu.",
  },
];

type ChatMessage = { role: "user" | "assistant"; text: string };
const initialMessage: ChatMessage = {
  role: "assistant",
  text: "Olá! Sou a iorIA. Posso te mostrar como usar o iorCLASS. Qual é a sua dúvida?",
};

export function HelpChat({ open, onClose, onSupport }: { open: boolean; onClose: () => void; onSupport: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [draft, setDraft] = useState("");
  const [pendingReply, setPendingReply] = useState("");
  const [lastTopic, setLastTopic] = useState<(typeof topics)[number]>();
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [open, messages, pendingReply]);
  useEffect(() => {
    if (!pendingReply) return;
    const timeout = window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", text: pendingReply }]);
      setPendingReply("");
    }, 850);
    return () => window.clearTimeout(timeout);
  }, [pendingReply]);

  function send(text: string) {
    const question = text.trim();
    if (!question || pendingReply) return;
    const normalized = question.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const words = new Set(normalized.match(/[a-z]+/g));
    let match: (typeof topics)[number] | undefined;
    let bestScore = 0;
    for (const topic of topics) {
      const score = topic.keywords.filter((word) => words.has(word)).length;
      if (score > bestScore) {
        match = topic;
        bestScore = score;
      }
    }

    let reply = "Ainda não tenho uma resposta para essa pergunta na demonstração. Pode reformular ou abrir a Central de ajuda.";
    if (match) {
      reply = lastTopic === match ? match.next : match.answer;
      setLastTopic(match);
    } else if (/^(obrigad[oa]|valeu|agrade[cç]o)\b/.test(normalized)) {
      reply = "De nada! Se precisar de ajuda com outra parte do iorCLASS, é só perguntar.";
    } else if (/^(oi|ola|bom dia|boa tarde|boa noite)[!.\s]*$/.test(normalized)) {
      reply = initialMessage.text;
    } else if (lastTopic && /^(e |me de |mostre |pode )?(como (continuo|faco)|onde (vejo|encontro)|depois|mais detalhes|um exemplo|sim)[?!.\s]*$/.test(normalized)) {
      reply = lastTopic.next;
    }
    setMessages((current) => [...current, { role: "user", text: question }]);
    setPendingReply(reply);
    setDraft("");
    input.current?.focus();
  }

  return (
    <section className="help-chat" id="help-chat" role="dialog" aria-labelledby="help-chat-title" hidden={!open}>
      <header className="help-chat-header">
        <span className="help-chat-symbol"><MessageCircle size={20} /></span>
        <div><h2 id="help-chat-title">Ajuda iorIA</h2><p>Simulação · sem consumo de créditos</p></div>
        <button className="help-chat-close" aria-label="Fechar chat" onClick={onClose}><X size={19} /></button>
      </header>
      <div className="help-chat-log" ref={log} role="log" aria-label="Conversa com a iorIA">
        {messages.map((message, index) =>
          <p key={index} className={`chat-message chat-message-${message.role}`}><span className="sr-only">{message.role === "user" ? "Você: " : "iorIA: "}</span>{message.text}</p>
        )}
        {pendingReply && <div className="chat-message chat-typing" role="status">
          iorIA digitando<span className="chat-typing-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>}
      </div>
      {messages.length === 1 && <div className="help-chat-prompts" aria-label="Perguntas sugeridas">
        {[topics[0], topics[1], topics[5]].map((topic) => <button key={topic.prompt} onClick={() => send(topic.prompt)}>{topic.prompt}</button>)}
      </div>}
      <form className="help-chat-composer" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
        <input ref={input} aria-label="Sua mensagem" placeholder="Digite sua dúvida..." value={draft} maxLength={400} onChange={(event) => setDraft(event.target.value)} />
        <button className="primary" aria-label="Enviar mensagem" disabled={!draft.trim() || Boolean(pendingReply)}><Send size={17} /></button>
      </form>
      <button className="text-button help-chat-support" onClick={onSupport}>Central de ajuda <ArrowUpRight size={14} /></button>
    </section>
  );
}
