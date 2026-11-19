import { assignmentsKey, assignmentStatus, bulletinsKey, groupsKey, initialGroups, readLocal, useLocal, defaultProfile, profileKey } from "./local";
import type { Assignment, Bulletin } from "./local";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Brand, go } from "./public-navigation";
import { Landing } from "./landing";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Copy,
  House,
  LogOut,
  Menu,
  MessageCircle,
  Users,
  Wallet,
  Video,
  FolderOpen,
  Send,
} from "lucide-react";
export function PublicExperience({ route }: { route: string }) {
  const [role, setRole] = useState("professor");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const auth = route === "login" || route === "cadastro";
  if (!auth) return <Landing />;

  return (
    <div className="public-site auth-page">
      <header className="public-header">
        <Brand />
        <button
          className="public-menu"
          aria-label="Abrir navegação"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
        <nav className={open ? "expanded" : ""}>
          <button onClick={() => go("login")}>Entrar</button>
          <button className="primary" onClick={() => go("cadastro")}>
            Começar grátis <ArrowUpRight size={15} />
          </button>
        </nav>
      </header>
      <div className="auth-layout">
        <section className="auth-story">
          <span className="public-pill">FEITO PARA QUEM ENSINA</span>
          <h1>
            Organize suas aulas,
            <br />
            agenda e finanças.
          </h1>
          <p>
            Tudo o que você precisa para a gestão das aulas.
            <br />
            Feito para professores particulares.
          </p>
          <div className="auth-quote">
            <span>“</span>
            <p>
              Ensinar é transformar. Organizar sua rotina também pode ser
              simples.
            </p>
            <b>iorCLASS · seu espaço para crescer</b>
          </div>
          <span className="auth-decoration">✧</span>
        </section>
        <section className="auth-form">
          <button className="text-button" onClick={() => go("inicio")}>
            <ChevronLeft size={15} /> Voltar ao site
          </button>
          <span className="eyebrow">ACESSO iorCLASS</span>
          <h2>
            {route === "cadastro"
              ? "Criar uma conta"
              : "Login Professor"}
          </h2>
          <p>
            {route === "cadastro"
              ? "Experimente por 30 dias. Sem cartão de crédito."
              : "Entre no seu espaço e continue de onde parou."}
          </p>
          <div className="tabs auth-roles">
            {["professor", "aluno"].map((r) => (
              <button
                className={role === r ? "selected" : ""}
                key={r}
                onClick={() => setRole(r)}
              >
                {r === "professor" ? "Sou professor" : "Sou aluno"}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(
                "Este é um protótipo. Use o acesso demo abaixo para explorar sem criar uma conta real.",
              );
            }}
          >
            {route === "cadastro" && (
              <label>
                Seu nome
                <input
                  required
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
              />
            </label>
            <label>
              Senha
              <input
                required
                type="password"
                autoComplete={
                  route === "cadastro" ? "new-password" : "current-password"
                }
                minLength={6}
                placeholder="Pelo menos 6 caracteres"
              />
            </label>
            {route === "cadastro" && (
              <label className="terms">
                <input type="checkbox" required /> Entendo que este cadastro é
                uma demonstração.
              </label>
            )}
            <button className="primary full">
              {route === "cadastro" ? "Criar minha conta" : "Entrar"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}
          <div className="auth-or">OU EXPLORE SEM CADASTRO</div>
          <button
            className="demo-login"
            onClick={() => go(role === "professor" ? "professor" : "aluno")}
          >
            <MessageCircle size={17} /> Login demo ·{" "}
            {role === "professor" ? "Professor" : "Aluno"}{" "}
            <ArrowRight size={16} />
          </button>
          <p className="auth-switch">
            {route === "cadastro"
              ? "Já tem uma conta?"
              : "Ainda não tem conta?"}{" "}
            <button
              onClick={() => {
                setMessage("");
                go(route === "cadastro" ? "login" : "cadastro");
              }}
            >
              {route === "cadastro" ? "Entrar" : "Cadastre-se grátis"}
            </button>
          </p>
          <small className="auth-disclaimer">
            Demonstração com dados fictícios. Sem autenticação real.
          </small>
        </section>
      </div>
    </div>
  );
}
export function StudentExperience() {
  const [tab, setTab] = useState("Início");
  const [assignments, setAssignments] = useLocal<Assignment[]>(assignmentsKey, []);
  const [notice, setNotice] = useState("");
  const [answer, setAnswer] = useState(
    () => localStorage.getItem("ior-student-answer") || "",
  );
  const [sent, setSent] = useState(() =>
    Boolean(localStorage.getItem("ior-student-answer")),
  );
  const [notes, setNotes] = useState(
    () => localStorage.getItem("ior-student-notes") || "",
  );
  const profile = readLocal(profileKey, defaultProfile);
  const groups = readLocal(groupsKey, initialGroups).filter((group) => group.members.includes(1));
  const bulletins = readLocal<Bulletin[]>(bulletinsKey, []).filter((item) => item.recipients.includes(1));
  const lessons = readLocal<{ id: number; student: string; time: string; end: string; subject: string; status: string }[]>("ior-lessons", [])
    .filter((lesson) => lesson.student === "Mariana Costa" || groups.some((group) => group.name === lesson.student));
  const studentLessons = lessons.length
    ? lessons
    : [
        {
          id: 1,
          time: "09:00",
          end: "10:00",
          subject: "Canto · Respiração e apoio",
          status: "Pendente",
        },
      ];
  const payments = JSON.parse(
    localStorage.getItem("ior-payments") || "[]",
  ).filter((p: { name: string }) => p.name === "Mariana Costa");
  const studentPayments = payments.length
    ? payments
    : [{ id: 1, value: 320, paid: false, due: "20 nov." }];
  const nav = [
    ["Início", House],
    ["Minhas aulas", CalendarDays],
    ["Atividades", BookOpen],
    ["Pagamentos", Wallet],
    ["Materiais", FolderOpen],
    ["Recados", MessageCircle],
  ];
  return (
    <div className="student-app" style={{ "--student-accent": profile.color } as CSSProperties}>
      <header className="student-header">
        <Brand />
        <span className="student-space-label">
          ESPAÇO DO ALUNO <span className="status purple">DEMO</span>
        </span>
        <div>
          <button className="secondary" onClick={() => go("professor")}>
            <Users size={15} /> Visão do professor
          </button>
          <button className="student-exit" onClick={() => go("inicio")}>
            <LogOut size={17} /> Sair
          </button>
        </div>
      </header>
      <div className="student-layout">
        <aside className="student-sidebar">
          <div className="student-identity">
            <span>MC</span>
            <h3>Mariana Costa</h3>
            <p>Canto e técnica vocal</p>
            <small>{profile.name} · {profile.studio}</small>
          </div>
          <nav>
            {nav.map(([name, Icon]) => {
              const I = Icon as typeof House;
              return (
                <button
                  className={tab === name ? "selected" : ""}
                  onClick={() => {
                    setTab(String(name));
                    setNotice("");
                  }}
                  key={String(name)}
                >
                  <I size={19} />
                  {String(name)}
                </button>
              );
            })}
          </nav>
          <div className="student-sidebar-note">
            <MessageCircle size={22} />
            <p>
              Cada pequeno passo
              <br />
              faz parte da sua evolução.
            </p>
          </div>
        </aside>
        <section className="student-content">
          <div className="student-page-heading">
            <span className="eyebrow">SEU APRENDIZADO CONTINUA AQUI</span>
            <h1>{tab === "Início" ? "Olá, Mariana ✦" : tab}</h1>
            <p>
              {tab === "Início"
                ? "Que bom te ver. Vamos dar o próximo passo?"
                : "Seu espaço para acompanhar cada conquista."}
            </p>
          </div>
          {notice && (
            <div className="student-notice" role="status">
              <Check size={16} />
              {notice}
            </div>
          )}
          {tab === "Início" ? (
            <>
              <section className="student-welcome">
                <span className="public-pill">
                  UMA NOVA SEMANA PARA EVOLUIR
                </span>
                <h2>
                  Sua voz tem muito
                  <br />
                  para contar.
                </h2>
                <p>
                  Continue praticando. A próxima conquista
                  <br />
                  começa com um pequeno passo hoje.
                </p>
                <button
                  className="primary"
                  onClick={() => setTab("Minhas aulas")}
                >
                  Ver minhas aulas <ArrowRight size={16} />
                </button>
                <span>·</span>
              </section>
              <div className="student-overview">
                <article className="card">
                  <span className="eyebrow">NOSSO PRÓXIMO ENCONTRO</span>
                  <CalendarDays size={24} />
                  <h3>Canto · Técnica vocal</h3>
                  <p>Segunda-feira, 16 de novembro</p>
                  <b>09:00 – 10:00 · Online</b>
                  <button
                    className="text-button"
                    onClick={() => setTab("Minhas aulas")}
                  >
                    Detalhes da aula <ArrowRight size={15} />
                  </button>
                </article>
                <article className="card student-message">
                  <span className="eyebrow">UM RECADO DA CAROL</span>
                  <span className="message-quote">“</span>
                  <p>
                    Continue com os exercícios de respiração. Seu controle e sua
                    confiança estão evoluindo a cada encontro!
                  </p>
                  <small>Carol Hends · Professora de canto</small>
                </article>
              </div>
              <h3 className="student-section-title">Seu próximo passo</h3>
              <button
                className="student-assignment-link card"
                onClick={() => setTab("Atividades")}
              >
                <span className="activity-icon">
                  <BookOpen size={23} />
                </span>
                <div>
                  <h3>Exercícios de respiração e apoio</h3>
                  <p>Reserve 10 minutos para praticar hoje.</p>
                </div>
                <span className="status purple">
                  {sent ? "Respondido" : "Pendente"}
                </span>
                <ArrowRight size={18} />
              </button>
            </>
          ) : tab === "Recados" ? (
            <section className="card management">
              <h2>Recados do professor</h2>
              {bulletins.length ? bulletins.map((item) => <p className="management-message" key={item.id}>{item.text}</p>) : <p>Nenhum recado para você.</p>}
            </section>
          ) : tab === "Minhas aulas" ? (
            <>
              <div className="card student-lessons">
                {studentLessons.map(
                  (l: {
                    id: number;
                    time: string;
                    end: string;
                    subject: string;
                    status: string;
                  }) => (
                    <article key={l.id}>
                      <div className="student-date">
                        <b>16</b>
                        <span>NOV</span>
                      </div>
                      <div>
                        <h3>{l.subject}</h3>
                        <p>
                          {l.time} – {l.end} · Google Meet
                        </p>
                        <span
                          className={
                            "status " +
                            (l.status === "Realizada" ? "green" : "purple")
                          }
                        >
                          {l.status}
                        </span>
                      </div>
                      <button
                        className="secondary"
                        onClick={() =>
                          setNotice(
                            "Esta é uma aula de demonstração. Não há sala de vídeo real vinculada.",
                          )
                        }
                      >
                        <Video size={16} /> Acessar aula
                      </button>
                    </article>
                  ),
                )}
              </div>
              <section className="card student-notes">
                <h3>Meu caderno de aula</h3>
                <p>
                  Registre suas dúvidas e descobertas para o próximo encontro.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="O que você aprendeu hoje?"
                />
                <button
                  className="primary"
                  onClick={() => {
                    localStorage.setItem("ior-student-notes", notes);
                    setNotice("Anotações salvas neste navegador.");
                  }}
                >
                  Salvar anotações <Check size={15} />
                </button>
              </section>
            </>
          ) : tab === "Atividades" ? (
            <>
            <section className="card student-exercise">
              <span className={"status " + (sent ? "green" : "purple")}>
                {sent ? "Respondido" : "Pendente"}
              </span>
              <h2>Exercícios de respiração e apoio</h2>
              <p>
                Pratique a respiração diafragmática por 10 minutos ao dia.
                Inspire em 4 tempos e solte o ar em 8. Repita 5 vezes e observe
                seu controle.
              </p>
              <div className="exercise-meta">
                <ClockIcon /> Entrega: 20 de novembro · Professora Carol
              </div>
              <label>
                Como foi a prática? Conte sua experiência.
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Compartilhe suas descobertas e dúvidas..."
                />
              </label>
              <button
                className="primary"
                disabled={!answer.trim()}
                onClick={() => {
                  localStorage.setItem("ior-student-answer", answer);
                  setSent(true);
                  setNotice(
                    "Resposta salva na demonstração. Nenhuma mensagem externa foi enviada.",
                  );
                }}
              >
                {sent ? "Atualizar resposta" : "Enviar resposta"}{" "}
                <Send size={15} />
              </button>
            </section>
            {assignments.filter((item) => item.id && item.studentId === 1).map((item) => (
              <section className="card management" key={item.id}>
                <span className="status purple">{assignmentStatus(item)}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                {item.status === "Avaliado" ? <p className="management-message">{item.answer}</p> :
                  <form onSubmit={(event) => {
                    event.preventDefault();
                    const answer = String(new FormData(event.currentTarget).get("answer")).trim();
                    if (!answer) return;
                    setAssignments((current) => current.map((record) => record.id === item.id ? { ...record, answer, status: undefined } : record));
                    setNotice("Resposta salva neste navegador.");
                  }}>
                    <label>Resposta para {item.title}<textarea name="answer" required maxLength={3000} defaultValue={item.answer} /></label>
                    <button className="primary">Salvar resposta da atividade</button>
                  </form>}
              </section>
            ))}
            </>
          ) : tab === "Pagamentos" ? (
            <>
              <div className="demo-notice">
                Pagamentos de demonstração. Nenhuma cobrança ou chave PIX real
                está disponível.
              </div>
              {studentPayments.map(
                (p: {
                  id: number;
                  value: number;
                  paid: boolean;
                  due: string;
                }) => (
                  <article className="card student-payment" key={p.id}>
                    <Wallet size={26} />
                    <div>
                      <h3>Mensalidade · Novembro</h3>
                      <p>Vencimento: {p.due} 2026</p>
                      <strong>
                        {p.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </strong>
                    </div>
                    <span className={"status " + (p.paid ? "green" : "amber")}>
                      {p.paid ? "Pago" : "Pendente"}
                    </span>
                    {!p.paid && (
                      <button
                        className="secondary"
                        onClick={() =>
                          setNotice(
                            "PIX indisponível na demonstração. Nenhuma cobrança será realizada.",
                          )
                        }
                      >
                        <Copy size={15} /> Ver pagamento
                      </button>
                    )}
                  </article>
                ),
              )}
            </>
          ) : (
            <section className="card student-material">
              <FolderOpen size={37} />
              <h2>Seu material de prática</h2>
              <p>Um guia para acompanhar sua rotina de estudos.</p>
              <article>
                <BookOpen size={23} />
                <div>
                  <h3>Guia de aquecimento vocal</h3>
                  <p>
                    1. Relaxe ombros e mandíbula.
                    <br />
                    2. Faça vibrações leves de lábios por 2 minutos.
                    <br />
                    3. Pratique respiração em 4 e 8 tempos.
                    <br />
                    4. Cante escalas em uma região confortável.
                  </p>
                </div>
              </article>
              <small>
                Material demonstrativo · Siga sempre as orientações do seu
                professor.
              </small>
            </section>
          )}
          <footer className="student-footer">
            Área do aluno. <span>iorCLASS · Demo</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
function ClockIcon() {
  return <CalendarDays size={15} />;
}
