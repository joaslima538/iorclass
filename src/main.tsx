import { PublicExperience, StudentExperience } from "./experience";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  House,
  CalendarDays,
  Users,
  Wallet,
  FolderOpen,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Bell,
  ArrowUpRight,
  ArrowRight,
  Check,
  Clock,
  Video,
  MapPin,
  MoreHorizontal,
  MessageCircle,
  Send,
  X,
  CheckCheck,
  GraduationCap,
  LogOut,
  LayoutGrid,
  Download,
  Copy,
  Mail,
  Menu,
  Mic,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./style.css";
const initialStudents = [
  "Mariana Costa",
  "João Pedro",
  "Beatriz Almeida",
  "Lucas Ferreira",
  "Ana Clara",
  "Pedro Henrique",
  "Sofia Martins",
  "Gabriel Santos",
  "Laura Oliveira",
  "Rafael Lima",
  "Julia Ribeiro",
  "Miguel Alves",
].map((name, i) => ({
  id: i + 1,
  name,
  course: [
    "Canto e técnica vocal",
    "Piano · Intermediário",
    "Inglês · Conversação",
  ][i % 3],
  email: name.toLowerCase().split(" ")[0] + "@email.com",
  color: ["#eee7ff", "#e4f2ee", "#fff0df", "#e5edff"][i % 4],
  paid: i % 4 !== 2,
}));
type Student = (typeof initialStudents)[number];
type Lesson = {
  id: number;
  student: string;
  subject: string;
  time: string;
  end: string;
  online: boolean;
  status: string;
  color: string;
  day?: number;
};
const seedLessons: Lesson[] = [
  {
    id: 1,
    student: "Mariana Costa",
    subject: "Canto · Respiração e apoio",
    time: "09:00",
    end: "10:00",
    online: true,
    status: "Realizada",
    color: "violet",
  },
  {
    id: 2,
    student: "João Pedro",
    subject: "Piano · Escalas e arpejos",
    time: "10:30",
    end: "11:30",
    online: false,
    status: "Realizada",
    color: "orange",
  },
  {
    id: 3,
    student: "Beatriz Almeida",
    subject: "Canto · Extensão vocal",
    time: "14:00",
    end: "15:00",
    online: true,
    status: "Pendente",
    color: "pink",
  },
  {
    id: 4,
    student: "Lucas Ferreira",
    subject: "Canto · Interpretação musical",
    time: "15:30",
    end: "16:30",
    online: true,
    status: "Pendente",
    color: "blue",
  },
];
function useLocal<T>(key: string, initial: T) {
  const [v, set] = useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [v, key]);
  return [v, set] as const;
}
const money = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function Owl({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 27 : 36}
      height={small ? 27 : 36}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M5 7l10 4a19 19 0 0110 0l10-4-2 17c-2 9-10 13-13 14C12 35 6 30 6 23Z"
        fill="#101c50"
      />
      <circle cx="14" cy="21" r="7" fill="white" />
      <circle cx="26" cy="21" r="7" fill="white" />
      <circle cx="15" cy="21" r="3" fill="#101c50" />
      <circle cx="25" cy="21" r="3" fill="#101c50" />
      <path d="m18 28 2 3 2-3" fill="#FBC407" />
    </svg>
  );
}
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: ["#eee5dd", "#e8e5f5", "#dfece7", "#f5e3e6"][
          name.length % 4
        ],
      }}
    >
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function App() {
  const [page, setPage] = useState("Início");
  const [extraLeads, setExtraLeads] = useLocal(
    "ior-extra-leads",
    [] as { name: string; email: string }[],
  );
  const [extraActivities, setExtraActivities] = useLocal(
    "ior-extra-activities",
    [] as { title: string; description: string }[],
  );
  const [leadStages, setLeadStages] = useLocal(
    "ior-lead-stages",
    {} as Record<string, number>,
  );
  const [students, setStudents] = useLocal("ior-students", initialStudents);
  const [lessons, setLessons] = useLocal("ior-lessons", seedLessons);
  const [tasks, setTasks] = useLocal("ior-tasks", [
    { text: "Preparar atividade de técnica vocal", done: false },
    { text: "Enviar material para a Mariana", done: false },
    { text: "Revisar planejamento da semana", done: true },
  ]);
  const [payments, setPayments] = useLocal(
    "ior-payments",
    initialStudents.slice(0, 8).map((s, i) => ({
      id: s.id,
      name: s.name,
      value: i % 2 ? 280 : 320,
      paid: i < 4,
      due: i === 4 ? "12 nov." : "20 nov.",
    })),
  );
  const [hideSummary, setHideSummary] = useLocal("ior-hide-summary", false);
  const incomingForecast = payments.reduce((total, payment) => total + payment.value, 0);
  const incomingReceived = payments.filter((payment) => payment.paid).reduce((total, payment) => total + payment.value, 0);
  // This prototype records incoming payments only; there are no expense entries yet.
  const outgoingForecast = 0;
  const outgoingPaid = 0;
  const summaryMoney = (value: number) => hideSummary ? "••••" : money(value);
  const summaryCount = (value: number) => hideSummary ? "••" : value;
  const [modal, setModal] = useState("");
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Todos");
  const [selected, setSelected] = useState<Student | null>(null);
  const [detailTab, setDetailTab] = useState("Visão geral");
  const [ai, setAi] = useState("");
  const [proposal, setProposal] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("Canto e técnica vocal");
  const [value, setValue] = useState("320");
  const [view, setView] = useState("Semana");
  const [week, setWeek] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [notices, setNotices] = useState(false);
  const [activityStatus, setActivityStatus] = useLocal("ior-activities", [
    "Respondido",
    "Pendente",
    "Avaliado",
    "Pendente",
  ]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("ai");
      }
      if (e.key === "Escape") {
        setModal("");
        setNotices(false);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  function navigate(p: string) {
    setPage(p);
    setQuery("");
    setTab("Todos");
    setSelected(null);
    setMobile(false);
  }
  function notify(t: string) {
    setToast(t);
  }
  function complete(id: number) {
    setLessons(
      lessons.map((l) => (l.id === id ? { ...l, status: "Realizada" } : l)),
    );
    notify("Aula marcada como realizada. Bom trabalho!");
  }
  function addStudent() {
    if (!name.trim()) return;
    setStudents([
      ...students,
      { id: Date.now(), name, email, course, color: "#eee7ff", paid: false },
    ]);
    setLessons([
      ...lessons,
      {
        id: Date.now(),
        student: name,
        subject: course,
        time: "16:30",
        end: "17:30",
        online: true,
        status: "Pendente",
        color: "violet",
      },
    ]);
    setPayments([
      ...payments,
      {
        id: Date.now(),
        name,
        value: Number(value) || 320,
        paid: false,
        due: "20 nov.",
      },
    ]);
    setModal("");
    setStep(0);
    setName("");
    notify("Aluno cadastrado com aula e cobrança de demonstração.");
  }
  function exportData() {
    const blob = new Blob(
      [
        "Aluno,Valor,Status\n" +
          payments
            .map((p) => `${p.name},${p.value},${p.paid ? "Pago" : "Pendente"}`)
            .join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "iorclass-financeiro.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    notify("Relatório exportado.");
  }
  const nav = [
    {
      title: "PRINCIPAL",
      items: [
        ["Início", House],
        ["Agenda", CalendarDays],
        ["Alunos", Users],
        ["Financeiro", Wallet],
      ],
    },
    {
      title: "ENSINO & GESTÃO",
      items: [
        ["Atividades", BookOpen],
        ["Arquivos", FolderOpen],
        ["Leads", LayoutGrid],
        ["Relatórios", ChartNoAxesCombined],
      ],
    },
  ];
  return (
    <div className="app">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <a className="logo" onClick={() => navigate("Início")}>
          <Owl />
          <span>
            ior<span>CLASS</span>
            <small>GESTÃO PARA PROFESSORES</small>
          </span>
        </a>
        <button className="teacher-profile" onClick={() => setModal("profile")}>
          <img src="/images/carol.jpg" alt="Perfil de Carol Hends" />
          <b>Carol Hends</b><small>Professora de canto</small>
        </button>
        <div className="sidebar-summary"><span><Users size={21} /><b>{students.length}</b> alunos</span><span><CalendarDays size={21} /><b>{lessons.length}</b> aulas</span></div>
        <button className="plan-strip" onClick={() => setModal("plans")}><b>Você está utilizando o plano FREE.</b><span>Conhecer os planos</span></button>
        {nav.map((group) => (
          <div className="navgroup" key={group.title}>
            <label>{group.title}</label>
            {group.items.map(([label, Icon]) => {
              const I = Icon as typeof House;
              return (
                <button
                  key={String(label)}
                  className={page === label ? "nav active" : "nav"}
                  onClick={() => navigate(String(label))}
                >
                  <I size={19} />
                  <span>{String(label)}</span>
                  {label === "Atividades" && <b>4</b>}
                  {page === label && <span className="navdot" />}
                </button>
              );
            })}
          </div>
        ))}
        <div className="sidebar-bottom">
          <button
            className="nav"
            onClick={() => {
              window.location.hash = "aluno";
            }}
          >
            <GraduationCap size={18} /> App do aluno <ExternalLink size={14} />
          </button>
          <button
            className="nav"
            onClick={() => {
              window.location.hash = "inicio";
            }}
          >
            <LogOut size={18} /> Sair e ver site
          </button>
          <button className="nav" onClick={() => setModal("settings")}>
            <Settings size={18} />
            Configurações
          </button>
          <button className="nav" onClick={() => setModal("help")}>
            <HelpCircle size={18} />
            Central de ajuda <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            <button className="mobile-menu" onClick={() => setMobile(!mobile)}>
              <Menu size={20} />
            </button>
            Meu espaço <span>/</span>
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button
              className="global-search"
              onClick={() => setModal("search")}
            >
              <Search size={16} />
              <span>Buscar na iorCLASS</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="notification"
              onClick={() => setNotices(!notices)}
            >
              <Bell size={19} />
              <i />
            </button>
            <span className="top-divider" />
            <img
              className="top-avatar"
              src="/images/carol.jpg"
              onClick={() => setModal("profile")}
            />
          </div>
          {notices && (
            <div className="notifications">
              <b>Suas notificações</b>
              <p>Beatriz enviou uma atividade para correção.</p>
              <p>✓ Mariana confirmou a aula de hoje.</p>
              <p>Seu resumo de novembro está disponível.</p>
            </div>
          )}
        </header>
        <div className="content">
          <section className="stats overview-stats" aria-label="Resumo financeiro e de aulas">
            <article className="stat summary-profit">
              <button
                className="summary-visibility"
                onClick={() => setHideSummary(!hideSummary)}
                aria-label={hideSummary ? "Mostrar valores do cabeçalho" : "Ocultar valores do cabeçalho"}
                aria-pressed={hideSummary}
                title={hideSummary ? "Mostrar valores do cabeçalho" : "Ocultar valores do cabeçalho"}
              >
                {hideSummary ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <strong className="summary-profit-value">{summaryMoney(incomingReceived - outgoingPaid)}</strong>
              <span className="summary-period">Lucro em Novembro 2026</span>
            </article>
            <article className="stat summary-finance">
              <div>
                <span className="stat-top">Previsão de Entradas:</span>
                <strong>{summaryMoney(incomingForecast)}</strong>
                <span className="stat-top">Entradas Realizadas:</span>
                <strong className="summary-positive">{summaryMoney(incomingReceived)}</strong>
              </div>
              <Undo2 className="summary-flow incoming" size={46} aria-hidden="true" />
            </article>
            <article className="stat summary-finance">
              <div>
                <span className="stat-top">Previsão de Saídas:</span>
                <strong>{summaryMoney(outgoingForecast)}</strong>
                <span className="stat-top">Saídas realizadas:</span>
                <strong className="summary-negative">{summaryMoney(outgoingPaid)}</strong>
              </div>
              <Redo2 className="summary-flow outgoing" size={46} aria-hidden="true" />
            </article>
            <article className="stat summary-lessons">
              <div><CalendarDays size={17} /><span>Aulas pendentes</span><strong>{summaryCount(lessons.filter((lesson) => lesson.status === "Pendente").length)}</strong></div>
              <div className="summary-cancelled"><X size={17} /><span>Aulas canceladas</span><strong>{summaryCount(lessons.filter((lesson) => lesson.status === "Cancelada").length)}</strong></div>
              <div className="summary-positive"><CheckCheck size={17} /><span>Aulas realizadas</span><strong>{summaryCount(lessons.filter((lesson) => lesson.status === "Realizada").length)}</strong></div>
            </article>
          </section>
          {page === "Início" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    SEGUNDA-FEIRA, 16 DE NOVEMBRO DE 2026
                  </div>
                  <h1>
                    Bom dia, Carol <span className="wave">☀</span>
                  </h1>
                  <p>Confira suas aulas, tarefas e pagamentos.</p>
                </div>
                <button className="primary" onClick={() => setModal("event")}>
                  <Plus size={17} /> Novo agendamento
                </button>
              </div>
              <div className="dashboard-grid">
                <section className="card today">
                  <div className="section-heading">
                    <div>
                      <h3>
                        Suas aulas de hoje{" "}
                        <span className="count">{lessons.length}</span>
                      </h3>
                      <p>Acompanhe os horários e confirme as aulas realizadas.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("Agenda")}
                    >
                      Ver agenda <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="date-tabs">
                    {[
                      "Seg, 16",
                      "Ter, 17",
                      "Qua, 18",
                      "Qui, 19",
                      "Sex, 20",
                    ].map((d, i) => (
                      <button
                        key={d}
                        className={week === i ? "selected" : ""}
                        onClick={() => setWeek(i)}
                      >
                        {d}
                        {i === 0 && <span />}
                      </button>
                    ))}
                    <button onClick={() => setWeek((week + 1) % 5)}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="lesson-list">
                    {(week === 0
                      ? lessons
                      : lessons.slice(week % 2, (week % 2) + 2)
                    ).map((l) => (
                      <div className="lesson" key={l.id}>
                        <div className="lesson-time">
                          <b>{l.time}</b>
                          <span>{l.end}</span>
                        </div>
                        <div className={"lesson-line " + l.color} />
                        <Avatar name={l.student} />
                        <div className="lesson-info">
                          <b>{l.student}</b>
                          <span>{l.subject}</span>
                          <small>
                            {l.online ? (
                              <Video size={12} />
                            ) : (
                              <MapPin size={12} />
                            )}{" "}
                            {l.online ? "Google Meet" : "Presencial"}{" "}
                            <span>·</span> 60 min
                          </small>
                        </div>
                        <div className="lesson-action">
                          {l.status === "Realizada" ? (
                            <span className="status green">
                              <Check size={12} /> Realizada
                            </span>
                          ) : (
                            <>
                              <span className="status purple">Agendada</span>
                              <button
                                className="complete"
                                onClick={() => complete(l.id)}
                                title="Marcar como realizada"
                              >
                                <Check size={16} />
                              </button>
                            </>
                          )}
                        </div>
                        <button
                          className="more"
                          onClick={() => {
                            setSelected(
                              students.find((s) => s.name === l.student) ||
                                null,
                            );
                            setModal("lesson");
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="today-footer">
                    <span>
                      <span className="green-dot" />
                      {
                        lessons.filter((l) => l.status === "Realizada").length
                      }{" "}
                      aulas realizadas
                    </span>
                    <span>
                      <Clock size={13} />
                      {
                        lessons.filter((l) => l.status === "Pendente").length
                      }{" "}
                      aulas pela frente
                    </span>
                    <span>
                      Resumo das aulas
                    </span>
                  </div>
                </section>
                <div className="right-column">
                  <section className="ai-card">
                    <div className="ai-card-top">
                      <span className="sparkle-box">
                        <MessageCircle size={21} />
                      </span>
                      <span className="ai-label">
                        ASSISTENTE iorIA <b>DEMO</b>
                      </span>
                      <ArrowUpRight size={17} />
                    </div>
                    <h3>
                      Ajuda com a gestão
                    </h3>
                    <p>
                      Consulte pagamentos e organize as aulas com ações de demonstração.
                    </p>
                    <button onClick={() => setModal("ai")}>
                      <span>Abrir assistente</span>
                      <span className="ai-send">
                        <ArrowRight size={16} />
                      </span>
                    </button>
                    <div className="ai-foot">
                      <span /> Assistente de demonstração.
                    </div>
                  </section>
                  <section className="card tasks">
                    <div className="section-heading">
                      <h3>
                        Para fazer{" "}
                        <span className="count">
                          {tasks.filter((t) => !t.done).length}
                        </span>
                      </h3>
                      <button
                        className="icon-button"
                        onClick={() => setModal("task")}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {tasks.map((t, i) => (
                      <button
                        key={i}
                        className={"task " + (t.done ? "done" : "")}
                        onClick={() =>
                          setTasks(
                            tasks.map((x, j) =>
                              j === i ? { ...x, done: !x.done } : x,
                            ),
                          )
                        }
                      >
                        <span className="checkbox">
                          {t.done && <Check size={12} />}
                        </span>
                        <span>{t.text}</span>
                      </button>
                    ))}
                    <div className="task-bottom">
                      Acompanhe suas tarefas.
                    </div>
                  </section>
                </div>
              </div>
              <section className="card payments-preview">
                <div className="section-heading">
                  <div>
                    <h3>
                      Resumo financeiro <span className="little-dot" />
                    </h3>
                    <p>Recebimentos e previsão do mês.</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("Financeiro")}
                  >
                    Ver financeiro <ArrowRight size={15} />
                  </button>
                </div>
                <div className="finance-preview-row">
                  <div className="mini-finance">
                    <span className="finance-icon">
                      <Wallet size={20} />
                    </span>
                    <div>
                      <span>Seu mês está no caminho certo</span>
                      <b>Você já recebeu 76% do previsto.</b>
                    </div>
                  </div>
                  <div className="preview-progress">
                    <span>
                      <b>R$ 6.840,00</b> de R$ 9.000,00
                    </span>
                    <div>
                      <i />
                    </div>
                  </div>
                  <span className="positive">
                    <TrendingUp size={15} /> Tudo sob controle
                  </span>
                </div>
              </section>
              <footer className="footer">
                Gestão para professores particulares.
                <span>
                  iorCLASS © 2026
                </span>
              </footer>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">GESTÃO DE AULAS</div>
                  <h1>
                    {selected && page === "Alunos" ? selected.name : page}
                  </h1>
                  <p>
                    {
                      {
                        Agenda:
                          "Consulte os horários e organize seus agendamentos.",
                        Alunos:
                          "Cadastre alunos e acompanhe aulas e pagamentos.",
                        Financeiro:
                          "Acompanhe entradas, pendências e recebimentos.",
                        Atividades: "Crie atividades e acompanhe as entregas dos alunos.",
                        Leads: "Organize os contatos interessados nas suas aulas.",
                        Relatórios: "Consulte os resultados e exporte seus relatórios.",
                        Arquivos: "Organize os materiais compartilhados nas aulas.",
                      }[page]
                    }
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    if (page === "Alunos") {
                      setStep(0);
                      setModal("student");
                    } else if (page === "Agenda") setModal("event");
                    else if (page === "Financeiro") setModal("payment");
                    else if (page === "Relatórios") exportData();
                    else setModal(page === "Leads" ? "lead" : "activity");
                  }}
                >
                  <Plus size={17} />
                  {page === "Alunos"
                    ? "Novo aluno"
                    : page === "Agenda"
                      ? "Novo agendamento"
                      : page === "Financeiro"
                        ? "Novo lançamento"
                        : page === "Relatórios"
                          ? "Exportar relatório"
                          : page === "Leads"
                            ? "Novo lead"
                            : "Nova atividade"}
                </button>
              </div>
              {page === "Alunos" &&
                (selected ? (
                  <section className="card detail">
                    <button
                      className="text-button"
                      onClick={() => setSelected(null)}
                    >
                      <ChevronLeft size={16} /> Todos os alunos
                    </button>
                    <div className="student-detail-head">
                      <Avatar name={selected.name} size={72} />
                      <div>
                        <h2>{selected.name}</h2>
                        <p>
                          {selected.course} · {selected.email}
                        </p>
                      </div>
                      <span className="status green">Ativo</span>
                    </div>
                    <div className="tabs">
                      {[
                        "Visão geral",
                        "Aulas",
                        "Financeiro",
                        "Atividades",
                        "Anotações",
                        "Contratos",
                        "Arquivos",
                      ].map((t) => (
                        <button
                          className={detailTab === t ? "selected" : ""}
                          onClick={() => setDetailTab(t)}
                          key={t}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {detailTab === "Visão geral" ? (
                      <>
                        <div className="stats">
                          <Stat
                            label="Aulas realizadas"
                            value="18"
                            icon={<BookOpen />}
                            note="Evoluindo a cada encontro"
                          />
                          <Stat
                            label="Presença"
                            value="96%"
                            icon={<Check />}
                            note="Excelente participação"
                          />
                        </div>
                        <h3>Último acompanhamento</h3>
                        <p>
                          Trabalhamos respiração diafragmática e exercícios de
                          apoio. Boa evolução no controle do ar e na projeção
                          vocal.
                        </p>
                        <h3>Próximo encontro</h3>
                        <p>Segunda-feira, às 14:00 · Google Meet</p>
                      </>
                    ) : detailTab === "Anotações" ? (
                      <>
                        <textarea
                          className="notes-area"
                          placeholder="Registre uma observação sobre o aluno..."
                          defaultValue={
                            localStorage.getItem("note-" + selected.id) || ""
                          }
                          onBlur={(e) => {
                            localStorage.setItem(
                              "note-" + selected.id,
                              e.target.value,
                            );
                            notify("Anotação salva.");
                          }}
                        />
                        <p>As anotações são salvas ao sair do campo.</p>
                      </>
                    ) : (
                      <div className="detail-items">
                        {(detailTab === "Financeiro"
                          ? payments
                              .filter((p) => p.name === selected.name)
                              .map(
                                (p) =>
                                  `${money(p.value)} · ${p.paid ? "Pago" : "Pendente"}`,
                              )
                          : detailTab === "Aulas"
                            ? lessons
                                .filter((l) => l.student === selected.name)
                                .map(
                                  (l) =>
                                    `${l.time} · ${l.subject} · ${l.status}`,
                                )
                            : detailTab === "Atividades"
                              ? ["Exercícios de respiração · Pendente"]
                              : ["Nenhum documento adicionado para este aluno."]
                        ).map((x) => (
                          <p key={x}>{x}</p>
                        ))}
                      </div>
                    )}
                  </section>
                ) : (
                  <>
                    <div className="toolbar">
                      <div className="tabs">
                        {["Todos", "Individuais", "Grupos"].map((t) => (
                          <button
                            onClick={() => setTab(t)}
                            className={tab === t ? "selected" : ""}
                            key={t}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="search-field">
                        <Search size={17} />
                        <input
                          placeholder="Buscar aluno..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="student-grid">
                      {tab === "Grupos"
                        ? ["Vozes em harmonia", "Inglês em boa companhia"].map(
                            (g, i) => (
                              <button
                                className="card student-card"
                                key={g}
                                onClick={() =>
                                  notify(
                                    "Grupo com " +
                                      (i ? 4 : 3) +
                                      " alunos · Aulas às quartas, 18h",
                                  )
                                }
                              >
                                <span className="group-avatar">
                                  <Users size={30} />
                                </span>
                                <h3>{g}</h3>
                                <p>{i ? 4 : 3} alunos · Encontros semanais</p>
                                <span className="status purple">
                                  Grupo ativo
                                </span>
                              </button>
                            ),
                          )
                        : students
                            .filter((s) =>
                              s.name
                                .toLowerCase()
                                .includes(query.toLowerCase()),
                            )
                            .map((s) => (
                              <button
                                className="card student-card"
                                key={s.id}
                                onClick={() => {
                                  setSelected(s);
                                  setDetailTab("Visão geral");
                                }}
                              >
                                <div className="student-card-top">
                                  <span className="status green">Ativo</span>
                                  <MoreHorizontal size={18} />
                                </div>
                                <Avatar name={s.name} size={58} />
                                <h3>{s.name}</h3>
                                <p>{s.course}</p>
                                <div className="student-card-bottom">
                                  <span
                                    className={
                                      "status " + (s.paid ? "green" : "amber")
                                    }
                                  >
                                    {s.paid ? "Em dia" : "Pagamento pendente"}
                                  </span>
                                  <ArrowUpRight size={16} />
                                </div>
                              </button>
                            ))}
                    </div>
                  </>
                ))}
              {page === "Agenda" && (
                <section className="card calendar">
                  <div className="toolbar">
                    <div className="calendar-controls">
                      <button onClick={() => setWeek(week - 1)}>
                        <ChevronLeft size={18} />
                      </button>
                      <h3>
                        {week === 0
                          ? "16 – 20"
                          : 16 + week * 7 + " – " + (20 + week * 7)}{" "}
                        de novembro
                      </h3>
                      <button onClick={() => setWeek(week + 1)}>
                        <ChevronRight size={18} />
                      </button>
                      <button className="secondary" onClick={() => setWeek(0)}>
                        Hoje
                      </button>
                    </div>
                    <div className="tabs">
                      {["Semana", "Mês"].map((t) => (
                        <button
                          className={view === t ? "selected" : ""}
                          onClick={() => setView(t)}
                          key={t}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {view === "Semana" ? (
                    <div className="week-calendar">
                      <div className="time-column">
                        <div />
                        <span>09:00</span>
                        <span>10:30</span>
                        <span>12:00</span>
                        <span>14:00</span>
                        <span>15:30</span>
                        <span>17:00</span>
                      </div>
                      {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map(
                        (d, i) => (
                          <div
                            className="day-column"
                            key={d}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              const id = Number(
                                e.dataTransfer.getData("lesson"),
                              );
                              setLessons(
                                lessons.map((l) =>
                                  l.id === id
                                    ? {
                                        ...l,
                                        day: i,
                                        subject:
                                          l.subject.split(" · Reagendada")[0] +
                                          " · Reagendada " +
                                          d,
                                      }
                                    : l,
                                ),
                              );
                              notify("Aula reagendada para " + d);
                            }}
                          >
                            <div
                              className={
                                i === 0 ? "day-head current" : "day-head"
                              }
                            >
                              {d}
                              <b>{16 + week * 7 + i}</b>
                            </div>
                            {lessons
                              .filter((l) => (l.day ?? 0) === i)
                              .map((l, j) => (
                                <button
                                  draggable
                                  onDragStart={(e) =>
                                    e.dataTransfer.setData(
                                      "lesson",
                                      String(l.id),
                                    )
                                  }
                                  className={"calendar-event " + l.color}
                                  style={{ top: 76 + j * 116 + (i % 2) * 45 }}
                                  key={l.id}
                                  onClick={() => {
                                    setSelected(
                                      students.find(
                                        (s) => s.name === l.student,
                                      ) || null,
                                    );
                                    setModal("lesson");
                                  }}
                                >
                                  <small>
                                    {l.time} – {l.end}
                                  </small>
                                  <b>{l.student}</b>
                                  <span>{l.subject.split(" · ")[0]}</span>
                                  {l.online ? (
                                    <Video size={13} />
                                  ) : (
                                    <MapPin size={13} />
                                  )}
                                </button>
                              ))}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="month-grid">
                      {Array.from({ length: 35 }, (_, i) => (
                        <button key={i} onClick={() => setModal("event")}>
                          <b>{(i % 30) + 1}</b>
                          {i % 3 === 0 && <span>2 aulas agendadas</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="calendar-footer">
                    <span className="status purple">Canto</span>
                    <span className="status amber">Piano</span>
                    <span>Arraste uma aula para outro dia para reagendar.</span>
                  </div>
                </section>
              )}
              {page === "Financeiro" && (
                <>
                  <section className="stats">
                    <Stat
                      label="Recebido"
                      value={money(
                        payments
                          .filter((p) => p.paid)
                          .reduce((s, p) => s + p.value, 0),
                      )}
                      icon={<Wallet />}
                      note="Pagamentos confirmados"
                      trend
                    />
                    <Stat
                      label="A receber"
                      value={money(
                        payments
                          .filter((p) => !p.paid)
                          .reduce((s, p) => s + p.value, 0),
                      )}
                      icon={<Clock />}
                      note="Previsão de novembro"
                    />
                    <Stat
                      label="Receita prevista"
                      value={money(payments.reduce((s, p) => s + p.value, 0))}
                      icon={<TrendingUp />}
                      note="Seu planejamento mensal"
                    />
                  </section>
                  <section className="card">
                    <div className="toolbar">
                      <div className="tabs">
                        {["Todos", "Pagos", "Pendentes"].map((t) => (
                          <button
                            key={t}
                            className={tab === t ? "selected" : ""}
                            onClick={() => setTab(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <button className="secondary" onClick={exportData}>
                        <Download size={15} /> Exportar
                      </button>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>ALUNO / DESCRIÇÃO</th>
                            <th>VENCIMENTO</th>
                            <th>VALOR</th>
                            <th>STATUS</th>
                            <th>AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments
                            .filter(
                              (p) =>
                                tab === "Todos" ||
                                (tab === "Pagos" ? p.paid : !p.paid),
                            )
                            .map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div className="table-person">
                                    <Avatar name={p.name} />
                                    <span>
                                      <b>{p.name}</b>
                                      <small>Mensalidade · Novembro</small>
                                    </span>
                                  </div>
                                </td>
                                <td>{p.due} 2026</td>
                                <td>
                                  <b>{money(p.value)}</b>
                                </td>
                                <td>
                                  <span
                                    className={
                                      "status " + (p.paid ? "green" : "amber")
                                    }
                                  >
                                    {p.paid ? "Pago" : "Pendente"}
                                  </span>
                                </td>
                                <td>
                                  {p.paid ? (
                                    <CheckCheck size={18} color="#429078" />
                                  ) : (
                                    <button
                                      className="text-button"
                                      onClick={() => {
                                        setPayments(
                                          payments.map((x) =>
                                            x.id === p.id
                                              ? { ...x, paid: true }
                                              : x,
                                          ),
                                        );
                                        notify("Pagamento confirmado.");
                                      }}
                                    >
                                      Confirmar pagamento <Check size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
              {page === "Leads" && (
                <div className="kanban">
                  {[
                    "Contato Inicial",
                    "Negociação",
                    "Aula Experimental",
                    "Aguardando Agenda",
                    "Aguardando Contrato",
                    "Fechado",
                    "Perdido",
                  ].map((stage, i) => (
                    <div
                      className="kanban-column"
                      key={stage}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const id = e.dataTransfer.getData("lead");
                        setLeadStages({ ...leadStages, [id]: i });
                        notify("Lead movido para " + stage);
                      }}
                    >
                      <h3>
                        <span className={"kanban-dot c" + i} />
                        {stage}
                        <small>{i === 0 ? 2 : 1}</small>
                      </h3>
                      {extraLeads
                        .filter(
                          (l) =>
                            (leadStages["extra-lead-" + l.email] ?? 0) === i,
                        )
                        .map((l, j) => (
                          <div
                            className="card lead-card"
                            id={"extra-lead-" + l.email}
                            draggable
                            onDragStart={(e) =>
                              e.dataTransfer.setData("lead", e.currentTarget.id)
                            }
                            key={l.email}
                          >
                            <Avatar name={l.name} />
                            <h4>{l.name}</h4>
                            <p>{l.email}</p>
                            <span className="status purple">Novo contato</span>
                          </div>
                        ))}
                      {[
                        "Fernanda Souza",
                        "André Moreira",
                        "Thiago Costa",
                        "Camila Mendes",
                        "Bruno Melo",
                        "Isabela Dias",
                        "Luiza Rocha",
                        "Daniel Alves",
                      ].map((leadName, n) => {
                        const id = "lead-" + n;
                        return (
                          (leadStages[id] ?? (n < 2 ? 0 : n - 1)) === i && (
                            <div
                              id={id}
                              draggable
                              onDragStart={(e) =>
                                e.dataTransfer.setData("lead", id)
                              }
                              className="card lead-card"
                              key={id}
                            >
                              <Avatar name={leadName} />
                              <h4>{leadName}</h4>
                              <p>Canto · Iniciante</p>
                              <span className="stars">
                                {"★".repeat(3 + (n % 3))}
                                <span>{"☆".repeat(2 - (n % 3))}</span>
                              </span>
                              <hr />
                              <small>
                                <Clock size={12} /> Próximo contato: hoje
                              </small>
                              <button
                                className="text-button"
                                onClick={() => {
                                  setName(leadName);
                                  setModal("student");
                                  setStep(0);
                                }}
                              >
                                Converter em aluno <ArrowRight size={13} />
                              </button>
                            </div>
                          )
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
              {page === "Atividades" && (
                <section className="card">
                  <div className="toolbar">
                    <div className="tabs">
                      {[
                        "Todos",
                        "Pendente",
                        "Respondido",
                        "Avaliado",
                        "Refazer",
                      ].map((t) => (
                        <button
                          className={tab === t ? "selected" : ""}
                          key={t}
                          onClick={() => setTab(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {extraActivities.map((a, i) => (
                    <div className="activity-row" key={i}>
                      <span className="activity-icon">
                        <BookOpen size={23} />
                      </span>
                      <div>
                        <h3>{a.title}</h3>
                        <p>{a.description}</p>
                      </div>
                      <span className="status purple">Pendente</span>
                    </div>
                  ))}
                  {[
                    "Exercícios de respiração e apoio",
                    "Escalas maiores — prática semanal",
                    "Interpretação: sua música favorita",
                    "Aquecimento vocal diário",
                  ].map(
                    (a, i) =>
                      (tab === "Todos" || tab === activityStatus[i]) && (
                        <div className="activity-row" key={a}>
                          <span className="activity-icon">
                            <BookOpen size={23} />
                          </span>
                          <div>
                            <h3>{a}</h3>
                            <p>
                              {students[i].name} · Entrega em 20 de novembro
                            </p>
                          </div>
                          <span
                            className={
                              "status " +
                              (activityStatus[i] === "Avaliado"
                                ? "green"
                                : "purple")
                            }
                          >
                            {activityStatus[i]}
                          </span>
                          <button
                            className="secondary"
                            onClick={() => {
                              setSelected(students[i]);
                              setStep(i);
                              setModal("review");
                            }}
                          >
                            Ver atividade <ArrowUpRight size={14} />
                          </button>
                        </div>
                      ),
                  )}
                </section>
              )}
              {page === "Relatórios" && (
                <>
                  <section className="stats">
                    <Stat
                      label="Receita total do ano"
                      value="R$ 67.420"
                      icon={<TrendingUp />}
                      note="18% acima do ano anterior"
                      trend
                    />
                    <Stat
                      label="Aulas realizadas"
                      value="328"
                      icon={<GraduationCap />}
                      note="92% de presença média"
                    />
                    <Stat
                      label="Evolução de alunos"
                      value="+24%"
                      icon={<Users />}
                      note="Crescendo com propósito"
                      trend
                    />
                  </section>
                  <div className="report-grid">
                    <section className="card chart-card">
                      <h3>Seu crescimento em 2026</h3>
                      <p>Receita recebida por mês</p>
                      <div className="bar-chart">
                        {[35, 46, 40, 53, 49, 61, 58, 72, 65, 79, 88, 76].map(
                          (v, i) => (
                            <div key={i}>
                              <span>{money(v * 80)}</span>
                              <i style={{ height: v + "%" }} />
                              <small>
                                {
                                  [
                                    "Jan",
                                    "Fev",
                                    "Mar",
                                    "Abr",
                                    "Mai",
                                    "Jun",
                                    "Jul",
                                    "Ago",
                                    "Set",
                                    "Out",
                                    "Nov",
                                    "Dez",
                                  ][i]
                                }
                              </small>
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                    <section className="card chart-card">
                      <h3>Cada aula conta</h3>
                      <p>Distribuição de status</p>
                      <div className="donut">
                        <div>
                          <strong>328</strong>
                          <span>aulas realizadas</span>
                        </div>
                      </div>
                      <div className="chart-legend">
                        <span>● Realizadas 82%</span>
                        <span>● Pendentes 12%</span>
                        <span>● Canceladas 6%</span>
                      </div>
                    </section>
                  </div>
                  <section className="ai-report">
                    <MessageCircle />
                    <div>
                      <h3>Converse com seus números</h3>
                      <p>
                        Pergunte sobre receitas, frequência ou evolução dos
                        alunos.
                      </p>
                    </div>
                    <button className="primary" onClick={() => setModal("ai")}>
                      Perguntar à iorIA <ArrowRight size={16} />
                    </button>
                  </section>
                </>
              )}
              {page === "Arquivos" && (
                <section className="card empty-state">
                  <FolderOpen size={52} />
                  <h2>Um lugar para todo o seu conhecimento.</h2>
                  <p>
                    Organize partituras, exercícios e materiais para
                    compartilhar com seus alunos.
                  </p>
                  <button className="primary" onClick={() => setModal("plans")}>
                    Conhecer o módulo de arquivos <ArrowUpRight size={16} />
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <button
        className="floating-ai"
        onClick={() => setModal("ai")}
        title="Abrir assistente iorIA"
      >
        <MessageCircle size={20} /><span>Ajuda</span>
      </button>
      <nav className="mobile-nav">
        {[
          ["Início", House],
          ["Agenda", CalendarDays],
          ["Alunos", Users],
          ["Financeiro", Wallet],
        ].map(([p, I]) => {
          const Icon = I as typeof House;
          return (
            <button
              key={String(p)}
              className={p === page ? "active" : ""}
              onClick={() => navigate(String(p))}
            >
              <Icon size={20} />
              <span>{String(p)}</span>
            </button>
          );
        })}
      </nav>
      {toast && (
        <div className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal("")}>
          <section
            className={"modal " + (modal === "ai" ? "ai-modal" : "")}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setModal("")}>
              <X size={20} />
            </button>
            {modal === "ai" ? (
              <>
                <span className="modal-symbol">
                  <MessageCircle size={27} />
                </span>
                <span className="eyebrow">SUA ASSISTENTE DE ROTINA</span>
                <h2>Oi, Carol. Vamos simplificar?</h2>
                <p>
                  Me conte o que aconteceu. Você revisa antes de qualquer
                  alteração.
                </p>
                <div className="demo-notice">
                  Demonstração · Respostas e ações simuladas, sem conexão com
                  IA.
                </div>
                <textarea
                  value={ai}
                  onChange={(e) => {
                    setAi(e.target.value);
                    setProposal(false);
                  }}
                  placeholder="Ex.: João faltou hoje e Maria pagou R$ 200 no PIX"
                />
                <div className="suggestions">
                  {[
                    "Resumir meu dia",
                    "Analisar meu financeiro",
                    "Concluir as aulas de hoje",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setAi(t);
                        setProposal(true);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {proposal && (
                  <div className="proposal">
                    <b>
                      <MessageCircle size={15} />{" "}
                      {ai.toLowerCase().includes("concluir")
                        ? "Proposta de alteração"
                        : "Seu resumo de demonstração"}
                    </b>
                    <p>
                      {ai.toLowerCase().includes("financeiro")
                        ? `Há ${payments.filter((p) => !p.paid).length} pagamentos pendentes, totalizando ${money(payments.filter((p) => !p.paid).reduce((a, p) => a + p.value, 0))}. Você pode confirmá-los no Financeiro.`
                        : ai.toLowerCase().includes("concluir")
                          ? `${lessons.filter((l) => l.status === "Pendente").length} aulas serão marcadas como realizadas. Deseja confirmar?`
                          : `Você tem ${lessons.length} aulas na agenda e ${tasks.filter((t) => !t.done).length} tarefas pendentes. Para esta simulação, você pode concluir as aulas de hoje.`}
                    </p>
                    {ai.toLowerCase().includes("concluir") && (
                      <button
                        className="primary"
                        onClick={() => {
                          setLessons(
                            lessons.map((l) => ({ ...l, status: "Realizada" })),
                          );
                          setModal("");
                          notify("Aulas de hoje concluídas.");
                        }}
                      >
                        Confirmar alterações <Check size={16} />
                      </button>
                    )}
                  </div>
                )}
                <button
                  className="primary full"
                  disabled={!ai.trim()}
                  onClick={() => setProposal(true)}
                >
                  Enviar para iorIA <Send size={16} />
                </button>
              </>
            ) : modal === "student" ? (
              <>
                <span className="eyebrow">NOVOS COMEÇOS</span>
                <h2>Novo aluno</h2>
                <p>Preencha os dados do aluno e configure as aulas.</p>
                <div className="wizard-steps">
                  {[
                    "Dados",
                    "Responsável",
                    "Aulas",
                    "Pagamento",
                    "Revisão",
                  ].map((s, i) => (
                    <span key={s} className={step >= i ? "current" : ""}>
                      {i + 1}
                      <small>{s}</small>
                    </span>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    step === 4 ? addStudent() : setStep(step + 1);
                  }}
                >
                  {step === 0 ? (
                    <>
                      <label>
                        Nome completo
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Como seu aluno se chama?"
                        />
                      </label>
                      <label>
                        E-mail
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aluno@email.com"
                        />
                      </label>
                      <label>
                        Curso
                        <select
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                        >
                          <option>Canto e técnica vocal</option>
                          <option>Piano · Intermediário</option>
                          <option>Inglês · Conversação</option>
                        </select>
                      </label>
                    </>
                  ) : step === 1 ? (
                    <>
                      <p>
                        Para alunos menores de idade, informe o responsável.
                      </p>
                      <label>
                        Nome do responsável
                        <input placeholder="Opcional" />
                      </label>
                      <label>
                        Telefone
                        <input placeholder="(11) 99999-9999" />
                      </label>
                    </>
                  ) : step === 2 ? (
                    <>
                      <label>
                        Recorrência
                        <select>
                          <option>Semanal</option>
                        </select>
                      </label>
                      <label>
                        Dia e horário
                        <input
                          readOnly
                          value="Segunda-feira · 16:30 às 17:30"
                        />
                      </label>
                      <p>
                        Na demonstração, será criada uma aula de exemplo na
                        agenda.
                      </p>
                    </>
                  ) : step === 3 ? (
                    <>
                      <label>
                        Mensalidade (R$)
                        <input
                          type="number"
                          min="1"
                          required
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      </label>
                      <label>
                        Forma de pagamento
                        <select>
                          <option>PIX</option>
                        </select>
                      </label>
                      <p>
                        Vencimento: 20 de novembro. Será criado um lançamento de
                        exemplo.
                      </p>
                    </>
                  ) : (
                    <div className="review-summary">
                      <Avatar name={name} size={52} />
                      <h3>{name}</h3>
                      <p>
                        {email} · {course}
                      </p>
                      <p>
                        <CalendarDays size={16} /> 1 aula · Segunda, 16:30
                      </p>
                      <p>
                        <Wallet size={16} /> 1 cobrança · {money(Number(value))}{" "}
                        via PIX
                      </p>
                      <span className="status purple">
                        Prévia da demonstração — sem cobranças reais
                      </span>
                    </div>
                  )}
                  <div className="modal-buttons">
                    {step > 0 && (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setStep(step - 1)}
                      >
                        Voltar
                      </button>
                    )}
                    <button className="primary" type="submit">
                      {step === 4 ? "Cadastrar aluno" : "Continuar"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </>
            ) : modal === "event" ? (
              <>
                <h2>Novo agendamento</h2>
                <p>Reserve um tempo para o que transforma.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    setLessons([
                      ...lessons,
                      {
                        id: Date.now(),
                        student: String(f.get("student")),
                        subject: String(f.get("subject")),
                        time: String(f.get("time")),
                        end: "17:30",
                        online: f.get("format") === "Online",
                        status: "Pendente",
                        color: "violet",
                      },
                    ]);
                    setModal("");
                    notify("Agendamento criado para 16 de novembro.");
                  }}
                >
                  <label>
                    Aluno
                    <select name="student">
                      {students.map((s) => (
                        <option key={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Título da aula
                    <input
                      name="subject"
                      required
                      placeholder="Ex.: Canto · Repertório"
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Data
                      <input type="date" readOnly value="2026-11-16" />
                    </label>
                    <label>
                      Horário
                      <input
                        name="time"
                        type="time"
                        required
                        defaultValue="16:30"
                      />
                    </label>
                  </div>
                  <label>
                    Formato
                    <select name="format">
                      <option>Online</option>
                      <option>Presencial</option>
                    </select>
                  </label>
                  <button className="primary full">
                    Criar agendamento <Check size={16} />
                  </button>
                </form>
              </>
            ) : modal === "payment" ? (
              <>
                <h2>Novo lançamento</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    setPayments([
                      ...payments,
                      {
                        id: Date.now(),
                        name: String(f.get("student")),
                        value: Number(f.get("value")),
                        paid: false,
                        due: "20 nov.",
                      },
                    ]);
                    setModal("");
                    notify("Lançamento adicionado.");
                  }}
                >
                  <label>
                    Aluno
                    <select name="student">
                      {students.map((s) => (
                        <option key={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Valor (R$)
                    <input
                      name="value"
                      type="number"
                      min="1"
                      required
                      placeholder="320"
                    />
                  </label>
                  <p>Vencimento: 20 de novembro de 2026</p>
                  <button className="primary full">Salvar lançamento</button>
                </form>
              </>
            ) : modal === "task" ? (
              <>
                <h2>Uma coisa de cada vez.</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = String(
                      new FormData(e.currentTarget).get("task"),
                    );
                    setTasks([...tasks, { text, done: false }]);
                    setModal("");
                    notify("Tarefa adicionada.");
                  }}
                >
                  <label>
                    O que você precisa fazer?
                    <input
                      name="task"
                      required
                      placeholder="Descreva sua tarefa"
                      autoFocus
                    />
                  </label>
                  <button className="primary full">
                    Adicionar tarefa <Plus size={16} />
                  </button>
                </form>
              </>
            ) : modal === "lesson" ? (
              <>
                <h2>Detalhes da aula</h2>
                <div className="student-detail-head">
                  <Avatar name={selected?.name || "Aluno"} />
                  <div>
                    <h3>{selected?.name || "Aula particular"}</h3>
                    <p>16 de novembro · 60 minutos</p>
                  </div>
                </div>
                <label>
                  Anotações da aula
                  <textarea
                    placeholder="Como foi a aula?"
                    defaultValue={
                      localStorage.getItem("lesson-note-" + selected?.id) || ""
                    }
                    onBlur={(e) =>
                      localStorage.setItem(
                        "lesson-note-" + selected?.id,
                        e.target.value,
                      )
                    }
                  />
                </label>
                <button
                  className="primary full"
                  onClick={() => {
                    const l = lessons.find((l) => l.student === selected?.name);
                    if (l) complete(l.id);
                    setModal("");
                  }}
                >
                  Marcar como realizada <Check size={16} />
                </button>
              </>
            ) : modal === "review" ? (
              <>
                <h2>Correção de atividade</h2>
                <p>{selected?.name} · Exercícios de técnica vocal</p>
                <div className="proposal">
                  <b>Resposta do aluno</b>
                  <p>
                    Pratiquei o exercício de respiração por 10 minutos todos os
                    dias. Senti mais facilidade em sustentar as notas.
                  </p>
                </div>
                <label>
                  Seu feedback
                  <textarea placeholder="Conte ao aluno como ele pode evoluir..." />
                </label>
                <label>
                  Nota
                  <input type="number" min="0" max="10" defaultValue="9" />
                </label>
                <button
                  className="primary full"
                  onClick={() => {
                    setActivityStatus(
                      activityStatus.map((s, i) =>
                        i === step ? "Avaliado" : s,
                      ),
                    );
                    setModal("");
                    notify("Atividade avaliada.");
                  }}
                >
                  Salvar avaliação <Check size={16} />
                </button>
              </>
            ) : modal === "search" ? (
              <>
                <h2>Encontre o que precisa</h2>
                <div className="search-field">
                  <Search size={18} />
                  <input
                    autoFocus
                    placeholder="Busque alunos ou páginas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="search-results">
                  {[
                    "Início",
                    "Agenda",
                    "Alunos",
                    "Financeiro",
                    "Atividades",
                    "Relatórios",
                  ]
                    .filter((p) =>
                      p.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((p) => (
                      <button
                        onClick={() => {
                          navigate(p);
                          setModal("");
                        }}
                        key={p}
                      >
                        {p}
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  {students
                    .filter(
                      (s) =>
                        query &&
                        s.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          navigate("Alunos");
                          setSelected(s);
                          setModal("");
                        }}
                      >
                        <Avatar name={s.name} />
                        {s.name}
                        <ArrowRight size={16} />
                      </button>
                    ))}
                </div>
              </>
            ) : modal === "plans" ? (
              <>
                <span className="eyebrow">MAIS POSSIBILIDADES</span>
                <h2>Seu próximo capítulo começa aqui.</h2>
                <p>Todos os recursos para sua rotina, em um só lugar.</p>
                <div className="plans">
                  {[
                    ["Mensal", "99", "por mês"],
                    ["Semestral", "415", "a cada 6 meses"],
                    ["Anual", "717", "por ano"],
                  ].map(([p, v, d]) => (
                    <button
                      key={p}
                      onClick={() =>
                        notify(
                          "Contratação indisponível no protótipo. Nenhuma cobrança realizada.",
                        )
                      }
                    >
                      <b>{p}</b>
                      <strong>R$ {v}</strong>
                      <span>{d}</span>
                    </button>
                  ))}
                </div>
                <div className="demo-notice">
                  Demonstração visual. Não há integração com pagamentos.
                </div>
              </>
            ) : modal === "help" ? (
              <>
                <h2>Vamos te ajudar.</h2>
                <p>Um guia rápido para você aproveitar seu espaço.</p>
                {[
                  "Cadastre alunos e gere sua primeira aula.",
                  "Confirme aulas realizadas na tela Início.",
                  "Acompanhe e confirme pagamentos no Financeiro.",
                  "Use a iorIA para explorar ações simuladas.",
                ].map((t) => (
                  <p className="help-item" key={t}>
                    <Check size={16} />
                    {t}
                  </p>
                ))}
              </>
            ) : modal === "settings" || modal === "profile" ? (
              <>
                <h2>Seu espaço, do seu jeito.</h2>
                <div className="student-detail-head">
                  <img className="settings-avatar" src="/images/carol.jpg" />
                  <div>
                    <h3>Carol Hends</h3>
                    <p>Professora de canto e técnica vocal</p>
                  </div>
                </div>
                <label>
                  Nome do estúdio
                  <input
                    defaultValue={
                      localStorage.getItem("studio") || "Estúdio Carol Hends"
                    }
                    onBlur={(e) => {
                      localStorage.setItem("studio", e.target.value);
                      notify("Preferência salva neste navegador.");
                    }}
                  />
                </label>
                <div className="demo-notice">
                  Ambiente de demonstração com dados fictícios. Os dados ficam
                  neste navegador.
                </div>
                <button
                  className="secondary full"
                  onClick={() => {
                    setModal("");
                    window.location.hash = "aluno";
                  }}
                >
                  <ExternalLink size={16} /> Visualizar app do aluno
                </button>
              </>
            ) : (
              <>
                <h2>{modal === "lead" ? "Novo contato" : "Nova atividade"}</h2>
                <p>
                  {modal === "lead"
                    ? "O início de uma nova conexão."
                    : "Uma nova oportunidade de aprender."}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    if (modal === "lead")
                      setExtraLeads([
                        ...extraLeads,
                        {
                          name: String(f.get("title")),
                          email: String(f.get("description")),
                        },
                      ]);
                    else
                      setExtraActivities([
                        ...extraActivities,
                        {
                          title: String(f.get("title")),
                          description: String(f.get("description")),
                        },
                      ]);
                    setModal("");
                    notify(
                      modal === "lead"
                        ? "Contato adicionado ao funil."
                        : "Atividade criada.",
                    );
                  }}
                >
                  <label>
                    {modal === "lead"
                      ? "Nome do contato"
                      : "Título da atividade"}
                    <input name="title" required />
                  </label>
                  <label>
                    {modal === "lead" ? "E-mail" : "Descrição"}
                    <textarea name="description" required />
                  </label>
                  <button className="primary full">
                    Salvar <Check size={16} />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function Stat({
  label,
  value,
  icon,
  note,
  trend = false,
  accent = "",
  suffix = "",
  progress = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  note: string;
  trend?: boolean;
  accent?: string;
  suffix?: string;
  progress?: boolean;
}) {
  return (
    <div className={"stat " + accent}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">
        {value}
        <span>{suffix}</span>
      </div>
      {progress && (
        <div className="stat-progress">
          <i />
        </div>
      )}
      <small>
        {trend && <ArrowUpRight size={13} />}
        <span>{note}</span>
      </small>
    </div>
  );
}
function ExperienceRouter() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || "inicio",
  );
  useEffect(() => {
    const update = () => {
      setRoute(window.location.hash.slice(1) || "inicio");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return route === "professor" ? (
    <App />
  ) : route === "aluno" ? (
    <StudentExperience />
  ) : (
    <PublicExperience route={route} />
  );
}
createRoot(document.getElementById("root")!).render(<ExperienceRouter />);
