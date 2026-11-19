import { HelpChat } from "./help-chat";
import { Bulletins, exportCsv, Files, GroupForm, lessonDate, lessonDay, matches, Partners, PartnerWorkReport, PersonalFinance, reportKinds, Reports, SettingsPanel, Support, Tasks } from "./management";
import { assignmentsKey, assignmentStatus, defaultProfile, profileKey, formatMoney as money, groupsKey, initialGroups, partnersKey, logTask, useLocal } from "./local";
import type { Assignment, Partner, Task } from "./local";
import { PublicExperience, StudentExperience } from "./experience";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Cake,
  Gift,
  Columns3,
  List,
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
type Student = (typeof initialStudents)[number] & { birthDate?: string };
type Appointment = { id: string; day: number; title: string; time: string; done: boolean };

const demoDates = ["Seg, 16", "Ter, 17", "Qua, 18", "Qui, 19", "Sex, 20"];
const demoLeads = [
  "Fernanda Souza", "André Moreira", "Thiago Costa", "Camila Mendes",
  "Bruno Melo", "Isabela Dias", "Luiza Rocha", "Daniel Alves",
];
const leadStageNames = [
  "Contato Inicial", "Negociação", "Aula Experimental", "Aguardando Agenda",
  "Aguardando Contrato", "Fechado", "Perdido",
];
const demoBirthdays = [
  { name: "Mariana Costa", day: 19 },
  { name: "Lucas Ferreira", day: 26 },
];
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
  partnerId?: string;
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
  const [studentLayout, setStudentLayout] = useLocal<"Lista" | "Kanban">("ior-student-layout", "Lista");
  const [leadLayout, setLeadLayout] = useLocal<"Lista" | "Kanban">("ior-lead-layout", "Kanban");
  const [helpOpen, setHelpOpen] = useState(false);
  const helpTrigger = React.useRef<HTMLButtonElement>(null);

  function closeHelp() {
    setHelpOpen(false);
    helpTrigger.current?.focus();
  }
  const [reportKind, setReportKind] = useState(reportKinds[0]);
  const [partners, setPartners] = useLocal<Partner[]>(partnersKey, []);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const [groups, setGroups] = useLocal(groupsKey, initialGroups);
  const [profile, setProfile] = useLocal(profileKey, {
    ...defaultProfile,
    studio: localStorage.getItem("studio") || defaultProfile.studio,
  });
  const [guideStep, setGuideStep] = useLocal("ior-guide-step", 0);
  const guide = [
    { label: "Cadastre seus alunos", page: "Alunos", modal: "student", description: "Comece com um aluno individual. Você também pode reunir alunos em um grupo." },
    { label: "Organize a agenda", page: "Agenda", modal: "event", description: "Agende uma aula para um aluno ou grupo e confira o horário no calendário." },
    { label: "Acompanhe seus pagamentos", page: "Financeiro", modal: "", description: "Confira as mensalidades e confirme um lançamento quando receber." },
  ];

  const [extraLeads, setExtraLeads] = useLocal(
    "ior-extra-leads",
    [] as { name: string; email: string }[],
  );
  const [extraActivities, setExtraActivities] = useLocal<Assignment[]>(assignmentsKey, []);
  const [leadStages, setLeadStages] = useLocal(
    "ior-lead-stages",
    {} as Record<string, number>,
  );
  const demoLeadStage = (index: number) => leadStages["lead-" + index] ?? Math.max(0, index - 1);
  const newLeadStage = (email: string) => leadStages["extra-lead-" + email] ?? 0;
  const leadCounts = leadStageNames.map((_, stage) =>
    demoLeads.filter((_, index) => demoLeadStage(index) === stage).length +
    extraLeads.filter((item) => newLeadStage(item.email) === stage).length
  );
  const [students, setStudents] = useLocal<Student[]>("ior-students", initialStudents);
  const [lessons, setLessons] = useLocal("ior-lessons", seedLessons);
  const [day, setDay] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const activeLesson = lessons.find((item) => item.id === activeLessonId);
  const activeLessonNoteKey = activeLesson ? `ior-lesson-note-${activeLesson.id}` : "";
  const eventDay = page === "Início" ? day : 0;
  const [appointments, setAppointments] = useLocal<Appointment[]>("ior-personal-appointments", []);
  const dayLessons = lessons.filter((lesson) => (lesson.day ?? 0) === day)
    .sort((a, b) => a.time.localeCompare(b.time));
  const pendingLessons = lessons.filter((lesson) => lesson.status === "Pendente").length;
  const cancelledLessons = lessons.filter((lesson) => lesson.status === "Cancelada").length;
  const completedLessons = lessons.filter((lesson) => lesson.status === "Realizada").length;
  const now = new Date();
  const birthdayMonth = String(now.getMonth() + 1).padStart(2, "0");
  const birthdayMonthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);
  const birthdays = students.flatMap((student) => {
    const date = student.birthDate;
    return date?.slice(5, 7) === birthdayMonth
      ? [{ id: student.id, name: student.name, day: Number(date.slice(8, 10)) }]
      : [];
  }).sort((a, b) => a.day - b.day);
  const [tasks, setTasks] = useLocal<Task[]>("ior-tasks", [
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
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("Canto e técnica vocal");
  const [value, setValue] = useState("320");
  const [view, setView] = useState("Semana");
  const [week, setWeek] = useState(0);
  const weekStart = new Date(lessonDate(week * 7) + "T12:00:00");
  const weekEnd = new Date(lessonDate(week * 7 + 4) + "T12:00:00");
  const calendarFormat = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1, 12);
  const monthLength = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0).getDate();
  function moveCalendar(direction: number) {
    if (view === "Semana") {
      setWeek(week + direction);
      return;
    }
    const target = new Date(Date.UTC(weekStart.getFullYear(), weekStart.getMonth() + direction, 8));
    setWeek(Math.floor(lessonDay(target.toISOString().slice(0, 10)) / 7));
  }
  function openEvent(date: string) {
    setEventDate(date);
    setModal("event");
  }
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
        if (document.getElementById("help-chat")?.contains(document.activeElement)) closeHelp();
        setModal("");
        setNotices(false);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  function navigate(p: string, { keepMenu = false, report = reportKinds[0] } = {}) {
    setPage(p);
    setQuery("");
    setTab("Todos");
    setSelected(null);
    if (p === "Relatórios") setReportKind(report);
    if (!keepMenu) setMobile(false);
    const section = submenus.find((menu) => menu.children.some((child) => child.page === p));
    if (section) setExpandedMenus((current) => current.includes(section.label) ? current : [...current, section.label]);
  }
  const visibleStudents = students.filter((student) => matches(`${student.name} ${student.email} ${student.course}`, query));
  const studentCourses = [...new Set(visibleStudents.map((student) => student.course))];
  const leadRows = [
    ...demoLeads.map((name, index) => ({ id: "lead-" + index, name, subtitle: "Canto · Iniciante", email: "", stage: demoLeadStage(index) })),
    ...extraLeads.map((lead) => ({ id: "extra-lead-" + lead.email, name: lead.name, subtitle: lead.email, email: lead.email, stage: newLeadStage(lead.email) })),
  ];
  function convertLead(name: string, email: string) {
    setName(name);
    setEmail(email);
    setBirthDate("");
    setStep(0);
    setModal("student");
  }
  function studentRow(student: Student) {
    return (
      <button className="card student-directory-item" key={student.id} onClick={() => {
        setSelected(student);
        setDetailTab("Visão geral");
      }}>
        <Avatar name={student.name} size={42} />
        <div><h3>{student.name}</h3><p>{student.email}</p></div>
        {studentLayout === "Lista" && <span className="directory-course">{student.course}</span>}
        <span className={`status ${student.paid ? "green" : "amber"}`}>{student.paid ? "Em dia" : "Pagamento pendente"}</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    );
  }
  function notify(t: string) {
    setToast(t);
  }
  function complete(id: number) {
    setLessons(
      current => current.map((l) => (l.id === id && l.status === "Pendente" ? { ...l, status: "Realizada" } : l)),
    );
    notify("Aula marcada como realizada. Bom trabalho!");
  }
  function addStudent() {
    if (!name.trim()) return;
    setStudents([
      ...students,
      { id: Date.now(), name, email, course, birthDate: birthDate || undefined, color: "#eee7ff", paid: false },
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
    setBirthDate("");
    notify("Aluno cadastrado com aula e cobrança de demonstração.");
  }
  function paymentStatus(payment: (typeof payments)[number]) {
    if (payment.paid) return "Em dia";
    const dueDay = Number.parseInt(payment.due, 10);
    const days = dueDay - 16;
    if (days < 0) return "Vencido";
    if (days === 0) return "Vence hoje";
    return `Vence em ${days} ${days === 1 ? "dia" : "dias"}`;
  }
  const visiblePayments = payments.filter((payment) => tab === "Todos" || (tab === "Pagos" ? payment.paid : !payment.paid));
  function exportData() {
    exportCsv("iorclass-financeiro.csv", ["Aluno", "Valor", "Status", "Situação do prazo"],
      visiblePayments.map((payment) => [payment.name, String(payment.value), payment.paid ? "Pago" : "Pendente", paymentStatus(payment)]));
    notify("Relatório exportado.");
  }
  type MenuDestination = { label: string; page: string; report?: string };
  const submenus: { label: string; icon: typeof House; children: MenuDestination[] }[] = [
    { label: "Alunos", icon: Users, children: [
      { label: "Listar Alunos", page: "Alunos" },
      { label: "Gerenciar Leads", page: "Leads" },
      { label: "Painel Geral de Recados", page: "Recados" },
    ] },
    { label: "Financeiro", icon: Wallet, children: [
      { label: "Financeiro", page: "Financeiro" },
      { label: "Financeiro Pessoal", page: "Financeiro pessoal" },
    ] },
    { label: "Relatórios", icon: ChartNoAxesCombined, children: [
      { label: "Relatório de Aulas", page: "Relatórios", report: reportKinds[0] },
      { label: "Relatório de Aluno", page: "Relatórios", report: reportKinds[1] },
      { label: "Relatório Lista de Alunos", page: "Relatórios", report: reportKinds[2] },
      { label: "Extrato de Aulas", page: "Relatórios", report: reportKinds[3] },
      { label: "Relatório de Fluxo de Caixa", page: "Relatórios", report: reportKinds[4] },
      { label: "Relatório Financeiro", page: "Relatórios", report: reportKinds[5] },
    ] },
    { label: "Parceiros", icon: Users, children: [
      { label: "Listar Parceiros", page: "Parceiros" },
      { label: "Painel Geral de Recados", page: "Recados para parceiros" },
      { label: "Relatório de Trabalho Parceiro", page: "Trabalho de parceiros" },
    ] },
  ];
  const links = [
    { label: "Início", icon: House },
    { label: "Agenda", icon: CalendarDays },
    { label: "Arquivos", icon: FolderOpen },
    { label: "Atividades", icon: BookOpen },
    { label: "Tarefas", icon: CheckCheck },
    { label: "Benefícios", icon: Gift },
  ];
  const activeMenu = submenus.find((menu) => menu.children.some((child) => child.page === page));
  const activeChild = activeMenu?.children.find((child) => child.page === page && (!child.report || child.report === reportKind));
  const searchPages: MenuDestination[] = [
    ...links.map((link) => ({ label: link.label, page: link.label })),
    ...submenus.flatMap((menu) => menu.children.map((child) => ({
      ...child, label: child.page.includes("Recados") ? child.label + " · " + menu.label : child.label,
    }))),
    ...["Configurações", "Central de ajuda"].map((label) => ({ label, page: label })),
  ];
  function renderMenu(menu: (typeof submenus)[number]) {
    const expanded = expandedMenus.includes(menu.label);
    const active = activeMenu?.label === menu.label;
    const id = "submenu-" + submenus.indexOf(menu);
    return (
      <div className={`sidebar-section${expanded ? " expanded" : ""}`} key={menu.label}>
        <button className={`nav sidebar-section-trigger${active ? " active" : ""}`}
          aria-expanded={expanded} aria-controls={id}
          onClick={() => {
            if (expanded) {
              setExpandedMenus((current) => current.filter((label) => label !== menu.label));
              return;
            }
            const first = menu.children[0];
            if (!active) navigate(first.page, { keepMenu: true, report: first.report });
            else setExpandedMenus((current) => [...current, menu.label]);
          }}>
          <menu.icon size={19} />
          <span>{menu.label}</span>
          <ChevronDown className="submenu-chevron" size={15} aria-hidden="true" />
        </button>
        <div className="sidebar-submenu" id={id} role="group" aria-label={`Submenu de ${menu.label}`} hidden={!expanded}>
          {menu.children.map((child) => (
            <button key={child.label} aria-current={child === activeChild ? "page" : undefined}
              onClick={() => navigate(child.page, { report: child.report })}>{child.label}</button>
          ))}
        </div>
      </div>
    );
  }
  function renderLink({ label, icon: Icon }: (typeof links)[number]) {
    return (
      <button key={label} className={`nav${page === label ? " active" : ""}`}
        aria-current={page === label ? "page" : undefined} onClick={() => navigate(label)}>
        <Icon size={19} /><span>{label === "Benefícios" ? "Meus Benefícios" : label}</span>
      </button>
    );
  }
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
          <b>{profile.name}</b><small>{profile.subject}</small>
        </button>
        <div className="sidebar-summary"><span><Users size={21} /><b>{students.length}</b> alunos</span><span><CalendarDays size={21} /><b>{lessons.length}</b> aulas</span></div>
        <button className="plan-strip" onClick={() => setModal("plans")}><b>Você está utilizando o plano FREE.</b><span>Conhecer os planos</span></button>
        <nav className="navgroup teacher-navigation" aria-label="Menu do professor">
          {links.slice(0, 2).map(renderLink)}
          {submenus.slice(0, 2).map(renderMenu)}
          {links.slice(2, 5).map(renderLink)}
          {submenus.slice(2).map(renderMenu)}
          {renderLink(links[5])}
        </nav>
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
          <button className={page === "Configurações" ? "nav active" : "nav"} onClick={() => navigate("Configurações")}>
            <Settings size={18} />
            Configurações
          </button>
          <button className={page === "Central de ajuda" ? "nav active" : "nav"} onClick={() => navigate("Central de ajuda")}>
            <HelpCircle size={18} />
            Central de ajuda <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            <button className="mobile-menu" aria-label="Menu do professor" aria-expanded={mobile} onClick={() => setMobile(!mobile)}>
              <Menu size={20} />
            </button>
            Meu espaço <span>/</span>
            <strong>{activeMenu?.label ?? page}</strong>
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
              <div><CalendarDays size={17} /><span>Aulas pendentes</span><strong>{summaryCount(pendingLessons)}</strong></div>
              <div className="summary-cancelled"><X size={17} /><span>Aulas canceladas</span><strong>{summaryCount(cancelledLessons)}</strong></div>
              <div className="summary-positive"><CheckCheck size={17} /><span>Aulas realizadas</span><strong>{summaryCount(completedLessons)}</strong></div>
            </article>
          </section>
          {page === "Início" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    AGENDA DEMONSTRATIVA · NOVEMBRO DE 2026
                  </div>
                  <h1>Bom dia, {profile.name.split(" ")[0]}</h1>
                  <p>Confira suas aulas e compromissos.</p>
                </div>
                <div className="home-actions">
                  <button className="secondary" onClick={() => setModal("guide")}>Primeiros passos</button>
                  <button className="secondary" onClick={() => setModal("birthdays")} aria-label="Aniversariantes do mês" title="Aniversariantes do mês">
                    <Cake size={20} />
                  </button>
                  <button className="primary" onClick={() => openEvent(lessonDate(eventDay))}>
                    <Plus size={17} /> Novo agendamento
                  </button>
                </div>
              </div>
              <section className="lesson-progress" aria-labelledby="lesson-progress-title">
                <h2 id="lesson-progress-title">Progresso das aulas</h2>
                <div className="trophy-counts" aria-live="polite">
                  <div className="trophy-total"><strong>{pendingLessons}</strong><span>Aulas pendentes</span></div>
                  <div className="trophy-art" aria-hidden="true">
                    <span className="trophy-handles" />
                    <span className="trophy-cup" />
                    <span className="trophy-stem" />
                    <span className="trophy-base" />
                  </div>
                  <div className="trophy-total"><strong>{completedLessons}</strong><span>Aulas realizadas</span></div>
                </div>
                <p className="trophy-cancelled">Aulas canceladas: {cancelledLessons}</p>
              </section>
              <div className="date-tabs dashboard-dates" role="group" aria-label="Dia da agenda demonstrativa">
                {demoDates.map((date, i) => (
                  <button key={date} className={day === i ? "selected" : ""}
                    aria-pressed={day === i} onClick={() => setDay(i)}>
                    {date}
                  </button>
                ))}
              </div>
              <div className="daily-grid">
                <section className="card today">
                  <div className="section-heading">
                    <h3>{day === 0 ? "Aulas de Hoje" : `Aulas de ${16 + day} de novembro`}</h3>
                    <button className="text-button" onClick={() => navigate("Agenda")}>
                      Ver agenda <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="lesson-list">
                    {dayLessons.length === 0 && <p className="daily-empty">Nenhuma aula neste dia.</p>}
                    {dayLessons.map((l) => (
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
                            {l.online ? "Google Meet" : "Presencial"}
                          </small>
                        </div>
                        <div className="lesson-action">
                          <span className={`status ${l.status === "Realizada" ? "green" : "purple"}`}>
                            {l.status}
                          </span>
                          {l.status === "Pendente" && (
                            <button className="complete" onClick={() => complete(l.id)}
                              title="Marcar como realizada" aria-label={`Confirmar realização da aula de ${l.student}`}>
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                        <button
                          className="more"
                          onClick={() => {
                            setActiveLessonId(l.id);
                            setModal("lesson");
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="card appointments" aria-labelledby="appointments-title">
                  <div className="section-heading">
                    <h3 id="appointments-title">Compromissos do dia</h3>
                    <button className="text-button" onClick={() => setModal("appointment")}>
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                  {appointments.every((item) => item.day !== day) && (
                    <p className="daily-empty">Nenhum compromisso pessoal neste dia.</p>
                  )}
                  <ul className="daily-items">
                    {appointments.filter((item) => item.day === day)
                      .sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
                        <li key={item.id}>
                          <div><b>{item.title}</b><time>{item.time}</time></div>
                          <label>
                            <input type="checkbox" checked={item.done}
                              aria-label={`Concluir compromisso ${item.title}`}
                              onChange={(e) => {
                                const done = e.target.checked;
                                setAppointments(current => current.map(record =>
                                  record.id === item.id ? { ...record, done } : record
                                ));
                              }} />
                            {item.done ? "Concluído" : "Pendente"}
                          </label>
                          <button className="more" title="Excluir compromisso"
                            aria-label={`Excluir compromisso ${item.title}`}
                            onClick={() => setAppointments(current => current.filter(record => record.id !== item.id))}>
                            <X size={16} />
                          </button>
                        </li>
                    ))}
                  </ul>
                </section>
              </div>
              <div className="dashboard-support">
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
                              j === i ? logTask({ ...x, done: !x.done }, x.done ? "Tarefa reaberta" : "Tarefa concluída") : x,
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
                      <button className="text-button" onClick={() => navigate("Tarefas")}>Abrir lista de tarefas</button>
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
                    {selected && page === "Alunos" ? selected.name : page === "Relatórios" ? reportKind : page === "Trabalho de parceiros" ? "Relatório de Trabalho Parceiro" : page === "Recados para parceiros" ? "Painel Geral de Recados dos Parceiros" : page}
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
                        Arquivos: "Organize suas pastas e materiais.",
                        Recados: "Escreva mensagens para alunos e grupos.",
                        Tarefas: "Organize seus checklists pessoais.",
                        "Financeiro pessoal": "Controle entradas e saídas pessoais.",
                        Parceiros: "Gerencie cadastros e permissões de demonstração.",
                        "Recados para parceiros": "Organize os avisos destinados aos seus parceiros.",
                        "Trabalho de parceiros": "Acompanhe as aulas vinculadas a cada parceiro.",
                        Benefícios: "Consulte os benefícios da plataforma.",
                        Configurações: "Personalize as informações do seu estúdio.",
                      }[page]
                    }
                  </p>
                </div>
                <div className="management-actions">
                  {page === "Alunos" && (
                    <button className="secondary" onClick={() => setModal("group")}><Plus size={17} /> Novo grupo</button>
                  )}
                  {["Alunos", "Agenda", "Financeiro", "Leads", "Atividades"].includes(page) && (
                    <button className="primary" onClick={() => {
                      const actions: Record<string, string> = { Alunos: "student", Agenda: "event", Financeiro: "payment", Leads: "lead", Atividades: "activity" };
                      if (page === "Alunos") { setStep(0); setBirthDate(""); }
                      if (page === "Agenda") openEvent(lessonDate(week * 7));
                      else setModal(actions[page]);
                    }}>
                      <Plus size={17} />
                      {{ Alunos: "Novo aluno", Agenda: "Novo agendamento", Financeiro: "Novo lançamento", Leads: "Novo lead", Atividades: "Nova atividade" }[page]}
                    </button>
                  )}
                </div>
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
                      {tab !== "Grupos" && <ViewSwitch value={studentLayout} onChange={setStudentLayout} label="Visualização de alunos" />}
                      <div className="search-field">
                        <Search size={17} />
                        <input
                          placeholder={tab === "Grupos" ? "Buscar grupo..." : "Buscar por nome, e-mail ou curso"}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    {tab === "Grupos" ? (
                      <div className="student-grid">
                        {groups.filter((group) => matches(group.name, query)).map((group) => (
                          <article className="card student-card" key={group.id}>
                            <span className="group-avatar"><Users size={30} /></span>
                            <h3>{group.name}</h3>
                            <p>{group.members.length} alunos</p>
                            <p>{students.filter((student) => group.members.includes(student.id)).map((student) => student.name).join(", ")}</p>
                          </article>
                        ))}
                      </div>
                    ) : !visibleStudents.length ? (
                      <p className="management-empty">Nenhum aluno encontrado.</p>
                    ) : studentLayout === "Lista" ? (
                      <div className="student-directory-list">{visibleStudents.map(studentRow)}</div>
                    ) : (
                      <div className="student-directory-board" aria-label="Kanban de alunos por curso">
                        {studentCourses.map((course) => {
                          const courseStudents = visibleStudents.filter((student) => student.course === course);
                          return <section className="task-lane" key={course} aria-label={course}>
                            <div className="task-lane-heading"><h2>{course} <span>{courseStudents.length}</span></h2></div>
                            {courseStudents.map(studentRow)}
                          </section>;
                        })}
                      </div>
                    )}
                  </>
                ))}
              {page === "Agenda" && (
                <section className="card calendar">
                  <div className="toolbar">
                    <div className="calendar-controls">
                      <button aria-label="Período anterior" onClick={() => moveCalendar(-1)}>
                        <ChevronLeft size={18} />
                      </button>
                      <h3>{view === "Semana" ? calendarFormat.formatRange(weekStart, weekEnd) :
                        new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(weekStart)}</h3>
                      <button aria-label="Próximo período" onClick={() => moveCalendar(1)}>
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
                                        day: week * 7 + i,
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
                                week === 0 && i === 0 ? "day-head current" : "day-head"
                              }
                            >
                              {d}
                              <b>{Number(lessonDate(week * 7 + i).slice(-2))}</b>
                            </div>
                            {lessons
                              .filter((l) => (l.day ?? 0) === week * 7 + i)
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
                                    setActiveLessonId(l.id);
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
                      {Array.from({ length: monthStart.getDay() }, (_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({ length: monthLength }, (_, i) => {
                        const date = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                        const records = lessons.filter((item) => lessonDate(item.day) === date);
                        return <div className="month-date" key={date}>
                          <button className="text-button" aria-label={`Agendar aula em ${date}`} onClick={() => openEvent(date)}>{i + 1}</button>
                          {records.map((item) => <button className="month-lesson" key={item.id} onClick={() => {
                            setActiveLessonId(item.id);
                            setModal("lesson");
                          }}>{item.time} · {item.student}</button>)}
                        </div>;
                      })}
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
                            <th>SITUAÇÃO DO PRAZO</th>
                            <th>AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visiblePayments.map((p) => (
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
                                <td>{paymentStatus(p)}</td>
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
                <>
                <section className="card management">
                  <h2>Resumo do funil</h2>
                  <div className="management-totals">
                    <p>Em andamento <strong>{leadCounts.slice(0, 5).reduce((sum, count) => sum + count, 0)}</strong></p>
                    <p>Fechados <strong>{leadCounts[5]}</strong></p>
                    <p>Perdidos <strong>{leadCounts[6]}</strong></p>
                  </div>
                  {leadCounts[0] > 0 && <p>{leadCounts[0]} contato(s) na etapa inicial. Combine o próximo passo com esses interessados.</p>}
                </section>
                <div className="toolbar lead-view-toolbar">
                  <ViewSwitch value={leadLayout} onChange={setLeadLayout} label="Visualização de leads" />
                </div>
                {leadLayout === "Lista" ? (
                  <section className="card management-table lead-list">
                    <table>
                      <thead><tr><th scope="col">Contato</th><th scope="col">Etapa do funil</th><th scope="col">Ações</th></tr></thead>
                      <tbody>{leadRows.map((lead) => <tr key={lead.id}>
                        <td><div className="table-person"><Avatar name={lead.name} /><div><b>{lead.name}</b><small>{lead.subtitle}</small></div></div></td>
                        <td><select aria-label={`Etapa de ${lead.name}`} value={lead.stage} onChange={(event) => {
                          const stage = Number(event.target.value);
                          setLeadStages((current) => ({ ...current, [lead.id]: stage }));
                        }}>{leadStageNames.map((stage, index) => <option key={stage} value={index}>{stage}</option>)}</select></td>
                        <td><button className="text-button" onClick={() => convertLead(lead.name, lead.email)}>Converter em aluno <ArrowRight size={13} /></button></td>
                      </tr>)}</tbody>
                    </table>
                  </section>
                ) : (
                <div className="kanban">
                  {leadStageNames.map((stage, i) => (
                    <div
                      className="kanban-column"
                      key={stage}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const id = e.dataTransfer.getData("lead");
                        if (!leadRows.some((lead) => lead.id === id)) return;
                        setLeadStages((current) => ({ ...current, [id]: i }));
                        notify("Lead movido para " + stage);
                      }}
                    >
                      <h3>
                        <span className={"kanban-dot c" + i} />
                        {stage}
                        <small>{leadCounts[i]}</small>
                      </h3>
                      {extraLeads
                        .filter(
                          (l) =>
                            newLeadStage(l.email) === i,
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
                      {demoLeads.map((leadName, n) => {
                        const id = "lead-" + n;
                        return (
                          demoLeadStage(n) === i && (
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
                                  convertLead(leadName, "");
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
                </>
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
                  {extraActivities.map((a, i) => (tab === "Todos" || tab === assignmentStatus(a)) && (
                    <div className="activity-row" key={i}>
                      <span className="activity-icon">
                        <BookOpen size={23} />
                      </span>
                      <div>
                        <h3>{a.title}</h3>
                        <p>{a.description}</p>
                        {a.studentId && <small>{students.find((student) => student.id === a.studentId)?.name}</small>}
                        {a.answer && <p className="management-message">Resposta: {a.answer}</p>}
                      </div>
                      <span className="status purple">{assignmentStatus(a)}</span>
                      {assignmentStatus(a) === "Respondido" && (
                        <div className="management-actions">
                          {(["Avaliado", "Refazer"] as const).map((status) => <button className="secondary" key={status}
                            onClick={() => setExtraActivities((current) => current.map((item) => item.id === a.id ? { ...item, status } : item))}>{status === "Avaliado" ? "Marcar como avaliada" : "Pedir para refazer"}</button>)}
                        </div>
                      )}
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
              {page === "Relatórios" && <Reports lessons={lessons} students={students} groups={groups} payments={payments} kind={reportKind} onKindChange={setReportKind} />}
              {page === "Arquivos" && <Files />}
              {page === "Recados" && <Bulletins students={students} groups={groups} />}
              {page === "Tarefas" && <Tasks tasks={tasks} setTasks={setTasks} />}
              {page === "Financeiro pessoal" && <PersonalFinance />}
              {page === "Parceiros" && <Partners records={partners} setRecords={setPartners} />}
              {page === "Recados para parceiros" && <Bulletins partners={partners} />}
              {page === "Trabalho de parceiros" && <PartnerWorkReport partners={partners} lessons={lessons} />}
              {page === "Configurações" && <SettingsPanel profile={profile} setProfile={setProfile} />}
              {page === "Central de ajuda" && <Support />}
              {page === "Benefícios" && (
                <section className="card management">
                  <h2>Benefícios para professores</h2>
                  <p>Promoções e vantagens de parceiros aparecem aqui quando disponíveis.</p>
                  <article className="benefit-preview">
                    <Gift size={24} aria-hidden="true" />
                    <div>
                      <span className="benefit-example">Exemplo do catálogo</span>
                      <h3>Flui · Recursos para aulas de inglês</h3>
                      <p>Atividades de prática para leitura, escuta, escrita e conversação. Ofertas ativas aparecem aqui quando estiverem disponíveis.</p>
                    </div>
                  </article>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <button
        className="floating-ai"
        ref={helpTrigger}
        aria-expanded={helpOpen}
        aria-controls="help-chat"
        onClick={() => helpOpen ? closeHelp() : setHelpOpen(true)}
        title="Abrir chat de ajuda iorIA"
      >
        <MessageCircle size={20} /><span>Ajuda</span>
      </button>
      <HelpChat open={helpOpen} onClose={closeHelp} onSupport={() => {
        setHelpOpen(false);
        navigate("Central de ajuda");
      }} />
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
            role="dialog" aria-modal="true"
            aria-labelledby={modal === "birthdays" || modal === "appointment" ? "daily-dialog-title" : undefined}
            className={"modal " + (modal === "ai" ? "ai-modal" : "")}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close" aria-label="Fechar" onClick={() => setModal("")}>
              <X size={20} />
            </button>
            {modal === "guide" ? (
              <>
                <Owl />
                <h2>Primeiros passos</h2>
                <p>Etapa {guideStep + 1} de {guide.length}</p>
                <h3>{guide[guideStep].label}</h3>
                <p>{guide[guideStep].description}</p>
                <div className="management-actions">
                  {guideStep > 0 && <button className="secondary" onClick={() => setGuideStep(guideStep - 1)}>Anterior</button>}
                  <button className="primary" onClick={() => {
                    const step = guide[guideStep];
                    setGuideStep(Math.min(guideStep + 1, guide.length - 1));
                    navigate(step.page);
                    if (step.modal === "student") { setStep(0); setBirthDate(""); }
                    if (step.modal === "event") openEvent(lessonDate());
                    else setModal(step.modal);
                  }}>Abrir etapa</button>
                  {guideStep + 1 < guide.length && <button className="secondary" onClick={() => setGuideStep(guideStep + 1)}>Próxima etapa</button>}
                </div>
              </>
            ) : modal === "group" ? (
              <>
                <h2>Novo grupo de alunos</h2>
                <GroupForm groups={groups} students={students} onCreate={(group) => {
                  setGroups((current) => [...current, group]);
                  setTab("Grupos");
                  setQuery("");
                  setModal("");
                }} />
              </>
            ) : modal === "birthdays" ? (
              <>
                <h2 id="daily-dialog-title">Aniversariantes do mês</h2>
                <p className="birthday-month">{birthdayMonthName} · A lista usa as datas informadas no cadastro.</p>
                {birthdays.length === 0 ? <p>Nenhum aniversário cadastrado neste mês.</p> : (
                  <ul className="daily-items">
                    {birthdays.map((birthday) => (
                      <li key={birthday.id}><b>{birthday.name}</b><span>{birthday.day}/{birthdayMonth}</span></li>
                    ))}
                  </ul>
                )}
                <h3>Exemplos de novembro</h3>
                <ul className="daily-items">
                  {demoBirthdays.map((birthday) => (
                    <li key={birthday.name}><b>{birthday.name}</b><span>{birthday.day}/11 · Exemplo fictício</span></li>
                  ))}
                </ul>
              </>
            ) : modal === "appointment" ? (
              <>
                <h2 id="daily-dialog-title">Novo compromisso pessoal</h2>
                <p>{16 + day} de novembro de 2026</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  const title = String(form.get("title")).trim();
                  if (!title) return;
                  const item = {
                    id: crypto.randomUUID(), day, title,
                    time: String(form.get("time")), done: false,
                  };
                  setAppointments(current => [...current, item]);
                  setModal("");
                }}>
                  <label>Compromisso<input name="title" required maxLength={100} /></label>
                  <label>Horário<input type="time" name="time" required /></label>
                  <button className="primary full">Salvar compromisso</button>
                </form>
              </>
            ) : modal === "ai" ? (
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
                          ? `${lessons.filter((l) => (l.day ?? 0) === 0 && l.status === "Pendente").length} aulas serão marcadas como realizadas. Deseja confirmar?`
                          : `Você tem ${lessons.length} aulas na agenda e ${tasks.filter((t) => !t.done).length} tarefas pendentes. Para esta simulação, você pode concluir as aulas de hoje.`}
                    </p>
                    {ai.toLowerCase().includes("concluir") && (
                      <button
                        className="primary"
                        onClick={() => {
                          setLessons(
                            current => current.map((l) => (l.day ?? 0) === 0 && l.status === "Pendente" ? { ...l, status: "Realizada" } : l),
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
                <button className="text-button" onClick={() => { setModal(""); navigate("Central de ajuda"); }}>
                  Abrir Central de ajuda
                </button>
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
                        Data de nascimento (opcional)
                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
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
                    if (String(f.get("end")) <= String(f.get("time"))) {
                      notify("O horário de término deve ser posterior ao início.");
                      return;
                    }
                    const date = String(f.get("date"));
                    const repeat = Number(f.get("repeat"));
                    const entries: Lesson[] = Array.from({ length: repeat }, (_, index) => ({
                      id: Date.now() + index,
                      student: String(f.get("student")),
                      subject: String(f.get("subject")),
                      time: String(f.get("time")),
                      end: String(f.get("end")),
                      day: lessonDay(date) + index * 7,
                      online: f.get("format") === "Online",
                      status: "Pendente",
                      color: "violet",
                      partnerId: String(f.get("partner") || "") || undefined,
                    }));
                    setLessons((current) => [...current, ...entries]);
                    setModal("");
                    notify(entries.length === 1 ? "Agendamento criado." : `${entries.length} aulas agendadas semanalmente.`);
                  }}
                >
                  <label>
                    Aluno ou grupo
                    <select name="student">
                      <optgroup label="Alunos">
                        {students.map((student) => <option key={student.id}>{student.name}</option>)}
                      </optgroup>
                      <optgroup label="Grupos">
                        {groups.map((group) => <option key={group.id}>{group.name}</option>)}
                      </optgroup>
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
                      <input type="date" name="date" required defaultValue={eventDate || lessonDate(eventDay)} />
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
                    <label>
                      Término
                      <input name="end" type="time" required defaultValue="17:30" />
                    </label>
                  </div>
                  <label>
                    Formato
                    <select name="format">
                      <option>Online</option>
                      <option>Presencial</option>
                    </select>
                  </label>
                  <label>
                    Recorrência
                    <select name="repeat">
                      <option value="1">Aula única</option>
                      <option value="4">Semanal · 4 aulas</option>
                      <option value="8">Semanal · 8 aulas</option>
                    </select>
                  </label>
                  {partners.some((partner) => !partner.archived) && <label>Parceiro responsável
                    <select name="partner">
                      <option value="">Sem parceiro</option>
                      {partners.filter((partner) => !partner.archived).map((partner) => <option value={partner.id} key={partner.id}>{partner.name}</option>)}
                    </select>
                  </label>}
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
                    if (!text.trim()) return;
                    setTasks((current) => [...current, logTask({ text: text.trim(), done: false }, "Tarefa criada")]);
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
            ) : modal === "lesson" && activeLesson ? (
              <>
                <h2>Detalhes da aula</h2>
                <div className="student-detail-head">
                  <Avatar name={activeLesson.student} />
                  <div>
                    <h3>{activeLesson.student}</h3>
                    <p>{activeLesson.subject}</p>
                    <p>{lessonDate(activeLesson.day).split("-").reverse().join("/")} · {activeLesson.time}–{activeLesson.end} · {activeLesson.status}</p>
                  </div>
                </div>
                <label>
                  Anotações da aula
                  <textarea
                    placeholder="Como foi a aula?"
                    defaultValue={localStorage.getItem(activeLessonNoteKey) ??
                      localStorage.getItem("lesson-note-" + students.find((student) => student.name === activeLesson.student)?.id) ?? ""}
                    onBlur={(e) => localStorage.setItem(activeLessonNoteKey, e.target.value)}
                  />
                </label>
                {partners.length > 0 && <label>Parceiro responsável
                  <select value={activeLesson.partnerId ?? ""} onChange={(event) => {
                    const partnerId = event.target.value || undefined;
                    setLessons((current) => current.map((lesson) => lesson.id === activeLesson.id ? { ...lesson, partnerId } : lesson));
                  }}>
                    <option value="">Sem parceiro</option>
                    {partners.filter((partner) => !partner.archived || partner.id === activeLesson.partnerId).map((partner) =>
                      <option value={partner.id} key={partner.id}>{partner.name}{partner.archived ? " (arquivado)" : ""}</option>
                    )}
                  </select>
                </label>}
                {activeLesson.status === "Pendente" && <button className="primary full" onClick={() => {
                  complete(activeLesson.id);
                  setModal("");
                }}>Marcar como realizada <Check size={16} /></button>}
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
                  {searchPages.filter((item) => matches(item.label, query)).map((item) => (
                    <button key={item.label} onClick={() => {
                      navigate(item.page, { report: item.report });
                      setModal("");
                    }}>
                      {item.label}<ArrowRight size={16} />
                    </button>
                  ))}
                  {students
                    .filter(
                      (s) =>
                        query &&
                        matches(`${s.name} ${s.email} ${s.course}`, query),
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
            ) : modal === "profile" ? (
              <>
                <h2>Seu espaço, do seu jeito.</h2>
                <div className="student-detail-head">
                  <img className="settings-avatar" src="/images/carol.jpg" alt="" />
                  <div><h3>{profile.name}</h3><p>{profile.subject}</p></div>
                </div>
                <button className="secondary" onClick={() => { setModal(""); navigate("Configurações"); }}>Editar perfil</button>
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
                          id: crypto.randomUUID(),
                          title: String(f.get("title")).trim(),
                          description: String(f.get("description")).trim(),
                          studentId: Number(f.get("student")) || undefined,
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
                  {modal === "activity" && <label>Destinatário da atividade
                    <select name="student">
                      <option value="">Sem destinatário</option>
                      {students.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}
                    </select>
                  </label>}
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
function ViewSwitch({ value, onChange, label }: {
  value: "Lista" | "Kanban";
  onChange: (value: "Lista" | "Kanban") => void;
  label: string;
}) {
  return <div className="view-switch" role="group" aria-label={label}>
    <button type="button" aria-pressed={value === "Lista"} onClick={() => onChange("Lista")}><List size={16} /> Lista</button>
    <button type="button" aria-pressed={value === "Kanban"} onClick={() => onChange("Kanban")}><Columns3 size={16} /> Kanban</button>
  </div>;
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
