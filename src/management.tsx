import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronRight, Download, FolderPlus, Paperclip, Plus, Printer, Upload, X } from "lucide-react";
import { bulletinsKey, formatMoney, logTask, useLocal } from "./local";
import type { Group, Partner, Task, TeacherProfile } from "./local";
import type { Dispatch, ReactNode, SetStateAction } from "react";

type Person = { id: number; name: string; email: string; course: string; birthDate?: string };
type LessonRecord = { id: number; student: string; time: string; subject: string; status: string; day?: number; end?: string; partnerId?: string };
type Payment = { id: number; name: string; value: number; paid: boolean; due: string };
type Entry = { id: string; title: string; date: string; value: number; kind: string; settled: boolean };
const ledgerKey = "ior-personal-ledger";
const uid = () => crypto.randomUUID();
const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const dateLabel = (date: string) => date.split("-").reverse().join("/");
const demoMonday = Date.UTC(2026, 10, 16);
const daysInMilliseconds = 86_400_000;
export const lessonDate = (day = 0) => new Date(demoMonday + day * daysInMilliseconds).toISOString().slice(0, 10);
export const lessonDay = (date: string) => (Date.parse(date) - demoMonday) / daysInMilliseconds;
const paymentDate = (due: string) => `2026-11-${due.split(" ")[0].padStart(2, "0")}`;
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
export const matches = (text: string, query: string) => normalize(text).includes(normalize(query.trim()));

function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return <p className="management-empty">Nenhum registro encontrado.</p>;
  return <div className="management-table"><table>
    <thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell}</td>)}</tr>)}</tbody>
  </table></div>;
}

type BulletinAudience = { students: Person[]; groups: Group[]; partners?: never }
  | { partners: Partner[]; students?: never; groups?: never };

export function Bulletins({ students, groups, partners }: BulletinAudience) {
  const people = partners ?? students ?? [];
  const selectable = partners ? partners.filter((partner) => !partner.archived) : people;
  const [records, setRecords] = useLocal<{ id: string; text: string; recipients: (number | string)[] }[]>(
    partners ? "ior-partner-bulletins" : bulletinsKey, [],
  );
  const [error, setError] = useState("");
  return <section className="card management">
    <h2>Escrever recado</h2>
    <p>{partners ? "Selecione os parceiros destinatários. Os recados ficam registrados neste painel de demonstração."
      : "Escolha alunos e grupos. O recado aparece na área dos alunos selecionados neste navegador."}</p>
    <form onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const text = field(form, "message");
      const recipients = [...new Set([
        ...selectable.filter((person) => form.getAll("recipients").includes(String(person.id))).map((person) => person.id),
        ...(groups ?? []).filter((group) => form.getAll("groups").includes(group.id)).flatMap((group) => group.members),
      ])];
      if (!text || !recipients.length) {
        setError("Escreva um recado e escolha ao menos um destinatário.");
        return;
      }
      setRecords((current) => [{ id: uid(), text, recipients }, ...current]);
      setError("");
      event.currentTarget.reset();
    }}>
      <label>Recado<textarea name="message" required maxLength={2000} /></label>
      <fieldset className="management-choices"><legend>{partners ? "Parceiros" : "Alunos"}</legend>
        {selectable.length ? selectable.map((person) => <label key={person.id}><input type="checkbox" name="recipients" value={person.id} />{person.name}</label>) : <p>Cadastre um parceiro ativo para publicar um recado.</p>}
      </fieldset>
      {groups && <fieldset className="management-choices"><legend>Grupos</legend>
        {groups.map((group) => <label key={group.id}><input type="checkbox" name="groups" value={group.id} />{group.name}</label>)}
      </fieldset>}
      {error && <p role="alert">{error}</p>}
      <button className="primary" disabled={!selectable.length}>Publicar recado</button>
    </form>
    <h2>Recados publicados</h2>
    <Table headers={["Recado", "Destinatários", "Ação"]} rows={records.map((record) => [
      <span className="management-message">{record.text}</span>,
      people.filter((person) => record.recipients.includes(person.id)).map((person) => person.name).join(", ") || "Destinatário arquivado",
      <button className="text-button" onClick={() => setRecords((current) => current.filter((item) => item.id !== record.id))}>Remover recado</button>,
    ])} />
  </section>;
}

export function PersonalFinance() {
  const [entries, setEntries] = useLocal<Entry[]>(ledgerKey, []);
  const [filter, setFilter] = useState("");
  const visible = entries.filter((entry) => !filter || entry.kind === filter);
  const sum = (kind: string, settled = false) => entries.filter((item) => item.kind === kind && (!settled || item.settled)).reduce((total, item) => total + item.value, 0);
  return <section className="card management">
    <div className="management-totals">
      <p>Entradas realizadas <strong>{formatMoney(sum("Entrada", true))}</strong></p>
      <p>Saídas realizadas <strong>{formatMoney(sum("Saída", true))}</strong></p>
      <p>Saldo realizado <strong>{formatMoney(sum("Entrada", true) - sum("Saída", true))}</strong></p>
    </div>
    <h2>Novo lançamento pessoal</h2>
    <form className="management-fields" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const title = field(form, "title");
      if (!title) return;
      const entry = { id: uid(), title, date: field(form, "date"), value: Number(form.get("value")), kind: field(form, "kind"), settled: form.has("settled") };
      setEntries((current) => [entry, ...current]);
      event.currentTarget.reset();
    }}>
      <label>Descrição<input name="title" required /></label>
      <label>Tipo<select aria-label="Tipo" name="kind"><option>Entrada</option><option>Saída</option></select></label>
      <label>Data<input name="date" type="date" required /></label>
      <label>Valor (R$)<input name="value" type="number" min="0.01" step="0.01" required /></label>
      <label className="management-check"><input type="checkbox" name="settled" /> Já realizado</label>
      <button className="primary">Salvar lançamento</button>
    </form>
    <label>Filtrar lançamentos<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">Todos</option><option>Entrada</option><option>Saída</option></select></label>
    <Table headers={["Descrição", "Data", "Tipo", "Valor", "Status", "Ação"]} rows={visible.map((item) => [
      item.title, dateLabel(item.date), item.kind, formatMoney(item.value), item.settled ? "Realizado" : "Previsto",
      !item.settled && <button className="text-button" onClick={() => setEntries((current) => current.map((entry) => entry.id === item.id ? { ...entry, settled: true } : entry))}>Confirmar lançamento</button>,
    ])} />
  </section>;
}

type StoredFile = { id: string; name: string; data: Blob };
type LibraryFile = StoredFile & { folder: string; size: number; date: string; tags: string };
type TaskAttachment = StoredFile & { taskAttachment: true };

function libraryTransaction<T>(mode: IDBTransactionMode, request: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("ior-library", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("files", { keyPath: "id" });
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const database = open.result;
      const transaction = database.transaction("files", mode);
      const result = request(transaction.objectStore("files"));
      transaction.oncomplete = () => { database.close(); resolve(result.result); };
      transaction.onabort = () => { database.close(); reject(transaction.error); };
    };
  });
}

export function Files() {
  const [editor, setEditor] = useState<"folder" | "file" | null>(null);
  const [folders, setFolders] = useLocal<{ id: string; name: string; tags: string; date: string }[]>("ior-folders", []);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(true);
  const read = () => libraryTransaction<(LibraryFile | TaskAttachment)[]>("readonly", (store) => store.getAll())
    .then((records) => setFiles(records.filter((file): file is LibraryFile => !("taskAttachment" in file))));
  useEffect(() => {
    read().catch(() => setNotice("Não foi possível abrir os arquivos do navegador.")).finally(() => setBusy(false));
  }, []);
  async function save(operation: () => Promise<unknown>) {
    setBusy(true);
    setNotice("");
    try {
      await operation();
      await read();
    } catch {
      setNotice("Não foi possível salvar o arquivo neste navegador.");
    } finally {
      setBusy(false);
    }
  }
  return <section className="card management files-library">
    <div className="workspace-toolbar">
      <div><h2>Biblioteca de arquivos</h2><p className="workspace-muted">{files.length} {files.length === 1 ? "arquivo" : "arquivos"} · {folders.length} {folders.length === 1 ? "pasta" : "pastas"}</p></div>
      <div className="management-actions">
        <button className="secondary" disabled={busy} aria-expanded={editor === "folder"} onClick={() => { setNotice(""); setEditor(editor === "folder" ? null : "folder"); }}><FolderPlus size={16} /> Nova pasta</button>
        <button className="primary" disabled={busy} aria-expanded={editor === "file"} onClick={() => { setNotice(""); setEditor(editor === "file" ? null : "file"); }}><Upload size={16} /> Adicionar arquivo</button>
      </div>
    </div>
    {editor === "folder" && <form className="management-fields compact-editor" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const name = field(form, "folder");
      if (!name || folders.some((item) => normalize(item.name) === normalize(name))) {
        setNotice("Informe um nome de pasta que ainda não exista.");
        return;
      }
      setFolders((current) => [...current, { id: uid(), name, tags: field(form, "tags"), date: new Date().toISOString().slice(0, 10) }]);
      setNotice("");
      setEditor(null);
    }}>
      <label>Nome da pasta<input autoFocus name="folder" required /></label>
      <label>Etiquetas da pasta<input name="tags" /></label>
      <div className="management-actions">
        <button className="primary">Criar pasta</button>
        <button className="text-button" type="button" onClick={() => setEditor(null)}>Cancelar</button>
      </div>
    </form>}
    {editor === "file" && <form className="management-fields compact-editor" onSubmit={(event) => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const file = form.get("file");
      if (!(file instanceof File) || !file.name) return;
      const record = { id: uid(), name: file.name, size: file.size, data: file, folder: field(form, "folder"), tags: field(form, "tags"), date: new Date().toISOString().slice(0, 10) };
      void save(async () => {
        await libraryTransaction("readwrite", (store) => store.put(record));
        setEditor(null);
      });
    }}>
      <label>Arquivo<input type="file" name="file" required /></label>
      <label>Pasta de destino<select name="folder" defaultValue={folder}><option value="">Sem pasta</option>{folders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Etiquetas do arquivo<input name="tags" /></label>
      <div className="management-actions">
        <button className="primary" disabled={busy}>Salvar arquivo</button>
        <button className="text-button" type="button" disabled={busy} onClick={() => setEditor(null)}>Cancelar</button>
      </div>
    </form>}
    {notice && <p role="status">{notice}</p>}
    <label>Buscar por nome, etiqueta, data ou tamanho<input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <div className="management-actions">
      <button className="secondary" aria-pressed={!folder} onClick={() => setFolder("")}>Todas as pastas</button>
      {folders.filter((item) => matches(`${item.name} ${item.tags} ${dateLabel(item.date)}`, query)).map((item) =>
        <button className="secondary" key={item.id} aria-pressed={folder === item.id} onClick={() => setFolder(item.id)}>{item.name}</button>)}
    </div>
    <Table headers={["Arquivo", "Tamanho", "Adicionado em", "Pasta", "Ações"]} rows={files.filter((file) => {
      const folderName = folders.find((item) => item.id === file.folder)?.name ?? "";
      return (!folder || file.folder === folder) && matches(`${file.name} ${folderName} ${file.tags} ${dateLabel(file.date)} ${file.size} ${Math.ceil(file.size / 1024)} KB`, query);
    }).map((file) => [
      file.name, `${Math.ceil(file.size / 1024)} KB`, dateLabel(file.date),
      <select aria-label={`Pasta de ${file.name}`} disabled={busy} value={file.folder} onChange={(event) => {
        const destination = event.target.value;
        void save(() => libraryTransaction("readwrite", (store) => store.put({ ...file, folder: destination })));
      }}><option value="">Sem pasta</option>{folders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>,
      <div className="management-actions"><button className="text-button" onClick={() => download(file.data, file.name)}>Baixar</button>
        <button className="text-button" disabled={busy} onClick={() => void save(() => libraryTransaction("readwrite", (store) => store.delete(file.id)))}>Excluir</button></div>,
    ])} />
  </section>;
}

function download(data: Blob, name: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(data);
  link.download = name;
  link.click();
  const url = link.href;
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => {
    const safe = /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const content = [headers, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
  download(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }), filename);
}

const taskStages = ["A fazer", "Em andamento", "Concluídas"] as const;
const taskStage = (item: Task) => item.done ? 2 : item.inProgress ? 1 : 0;

export function Tasks({ tasks, setTasks }: { tasks: Task[]; setTasks: Dispatch<SetStateAction<Task[]>> }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [composer, setComposer] = useState<number | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const detail = useRef<HTMLElement>(null);
  const task = selected == null ? undefined : tasks[selected];
  useEffect(() => {
    if (selected !== null) {
      detail.current?.scrollIntoView({ block: "nearest" });
      detail.current?.focus({ preventScroll: true });
    }
  }, [selected]);
  function update(index: number, change: (task: Task) => Task) {
    setTasks((current) => current.map((item, i) => i === index ? change(item) : item));
  }
  function move(index: number, stage: number) {
    update(index, (item) => taskStage(item) === stage ? item : logTask({
      ...item, done: stage === 2, inProgress: stage === 1,
    }, `Movida para ${taskStages[stage]}`));
  }
  return <section className="tasks-workspace">
    <div className="card workspace-toolbar task-toolbar">
      <div>
        <h2>Quadro de tarefas</h2>
        <p className="workspace-muted">{tasks.filter((item) => !item.done).length} abertas · {tasks.filter((item) => item.done).length} concluídas</p>
      </div>
      <button className="primary" aria-expanded={composer !== null} onClick={() => setComposer(composer === null ? 0 : null)}><Plus size={17} /> Nova tarefa</button>
    </div>
    {composer !== null && <section className="card management task-composer" key={composer}>
      <h2>Nova tarefa</h2>
      <form onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const text = field(form, "task");
        if (!text) return;
        const stage = Number(form.get("stage"));
        const checklist = field(form, "checklist").split("\n").map((item) => item.trim()).filter(Boolean).map((item) => ({ text: item, done: false }));
        setTasks((current) => [...current, logTask({
          text, done: stage === 2, inProgress: stage === 1,
          description: field(form, "description"), dueDate: field(form, "dueDate"), checklist,
        }, "Tarefa criada")]);
        setComposer(null);
      }}>
        <label>Título da nova tarefa<input name="task" autoFocus required maxLength={120} placeholder="Ex.: Preparar a aula de sexta" /></label>
        <div className="management-fields">
          <label>Etapa inicial<select name="stage" defaultValue={composer}>{taskStages.map((stage, index) => <option value={index} key={stage}>{stage}</option>)}</select></label>
          <label>Prazo (opcional)<input type="date" name="dueDate" /></label>
        </div>
        <details className="task-extra">
          <summary>Adicionar descrição ou checklist</summary>
          <label>Descrição da tarefa<textarea name="description" maxLength={1000} /></label>
          <label>Itens do checklist<textarea name="checklist" placeholder="Um item por linha" maxLength={1000} /></label>
        </details>
        <div className="management-actions">
          <button className="primary">Criar tarefa</button><button className="secondary" type="button" onClick={() => setComposer(null)}>Cancelar</button>
        </div>
      </form>
    </section>}
    <div className="task-board">
      {taskStages.map((stage, stageIndex) => {
        const cards = tasks.map((item, index) => ({ item, index })).filter(({ item }) => taskStage(item) === stageIndex);
        return <section className="task-lane" key={stage} aria-label={stage} onDragOver={(event) => {
          if (event.dataTransfer.types.includes("application/ior-task")) event.preventDefault();
        }} onDrop={(event) => {
          const index = event.dataTransfer.getData("application/ior-task");
          if (index) {
            event.preventDefault();
            move(Number(index), stageIndex);
          }
        }}>
          <div className="task-lane-heading">
            <h2>{stage} <span>{cards.length}</span></h2>
            <button type="button" className="icon-button" aria-label={`Adicionar tarefa em ${stage}`} onClick={() => setComposer(stageIndex)}><Plus size={17} /></button>
          </div>
          {!cards.length && <p className="workspace-muted task-empty">Nenhuma tarefa nesta etapa.</p>}
          {cards.map(({ item, index }) => <article key={index} className="card task-board-card" draggable onDragStart={(event) => {
            event.dataTransfer.setData("application/ior-task", String(index));
          }}>
            <div className="task-card-title">
              <input type="checkbox" aria-label={item.done ? `Reabrir ${item.text}` : `Concluir ${item.text}`} checked={item.done}
                onChange={() => move(index, item.done ? 0 : 2)} />
              <button type="button" onClick={() => { setSelected(index); setAttachmentError(""); }}>{item.text}<ChevronRight size={16} /></button>
            </div>
            {item.description && <p>{item.description}</p>}
            <div className="task-card-meta">
              {item.dueDate && <span><CalendarDays size={14} />{dateLabel(item.dueDate)}</span>}
              {!!item.checklist?.length && <span><Check size={14} />{item.checklist.filter((entry) => entry.done).length}/{item.checklist.length}</span>}
              {!!item.attachments?.length && <span><Paperclip size={14} />{item.attachments.length}</span>}
            </div>
            <select aria-label={`Etapa de ${item.text}`} value={stageIndex} onChange={(event) => move(index, Number(event.target.value))}>
              {taskStages.map((option, i) => <option key={option} value={i}>{option}</option>)}
            </select>
          </article>)}
        </section>;
      })}
    </div>
    {task && selected != null && <section className="card management task-details" key={selected} ref={detail} tabIndex={-1} aria-label="Detalhes da tarefa">
      <div className="workspace-toolbar"><h2>Detalhes da tarefa</h2><button className="icon-button" aria-label="Fechar detalhes" onClick={() => setSelected(null)}><X size={18} /></button></div>
      <form className="management-fields" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const text = field(form, "title");
        const description = field(form, "description");
        const dueDate = field(form, "dueDate");
        if (text && (text !== task.text || description !== (task.description ?? "") || dueDate !== (task.dueDate ?? ""))) {
          update(selected, (item) => logTask({ ...item, text, description, dueDate }, "Tarefa editada"));
        }
      }}>
        <label>Título da tarefa<input name="title" defaultValue={task.text} required maxLength={120} /></label>
        <label>Prazo da tarefa<input name="dueDate" type="date" defaultValue={task.dueDate} /></label>
        <label>Descrição da tarefa<textarea name="description" defaultValue={task.description} maxLength={1000} /></label>
        <button className="secondary">Salvar edição</button>
      </form>
      <h3>Checklist</h3>
      {task.checklist?.map((item, index) => <label className="management-check" key={index}>
        <input type="checkbox" checked={item.done} onChange={() => update(selected, (record) => logTask({
          ...record, checklist: record.checklist?.map((entry, i) => i === index ? { ...entry, done: !entry.done } : entry),
        }, item.done ? "Item reaberto" : "Item concluído"))} />{item.text}
      </label>)}
      <form className="management-fields" onSubmit={(event) => {
        event.preventDefault();
        const text = field(new FormData(event.currentTarget), "item");
        if (!text) return;
        update(selected, (record) => logTask({ ...record, checklist: [...(record.checklist ?? []), { text, done: false }] }, "Item adicionado"));
        event.currentTarget.reset();
      }}><label>Novo item<input name="item" required /></label><button className="secondary">Adicionar ao checklist</button></form>
      <h3>Anexos</h3>
      {task.attachments?.map((item) => <button className="text-button" key={item.id} onClick={async () => {
        try {
          const file = await libraryTransaction<TaskAttachment | undefined>("readonly", (store) => store.get(item.id));
          if (!file) throw new Error("Missing attachment");
          download(file.data, file.name);
        } catch {
          setAttachmentError("Não foi possível abrir o anexo.");
        }
      }}>{item.name}</button>)}
      <form className="management-fields" onSubmit={async (event) => {
        event.preventDefault();
        const element = event.currentTarget;
        const file = new FormData(element).get("attachment");
        if (!(file instanceof File) || !file.name) return;
        const id = uid();
        setAttachmentError("");
        try {
          await libraryTransaction("readwrite", (store) => store.add({ id, name: file.name, data: file, taskAttachment: true }));
          update(selected, (record) => logTask({ ...record, attachments: [...(record.attachments ?? []), { id, name: file.name }] }, "Arquivo anexado"));
          element.reset();
        } catch {
          setAttachmentError("Não foi possível salvar o anexo no navegador.");
        }
      }}>
        <label>Anexo da tarefa<input type="file" name="attachment" required /></label><button className="secondary">Anexar arquivo</button>
      </form>
      {attachmentError && <p role="alert">{attachmentError}</p>}
      <h3>Histórico</h3>
      {task.history?.length ? <ul>{task.history.map((item, index) => <li key={index}>{new Date(item.date).toLocaleString("pt-BR")} · {item.action}</li>)}</ul> : <p>Sem alterações registradas.</p>}
    </section>}
  </section>;
}

export const reportKinds = ["Relatório de Aulas", "Relatório de Aluno", "Relatório Lista de Alunos", "Extrato de Aulas", "Relatório de Fluxo de Caixa", "Relatório Financeiro"];
export function Reports({ lessons, students, groups, payments, kind, onKindChange }: {
  lessons: LessonRecord[]; students: Person[]; groups: Group[]; payments: Payment[]; kind: string; onKindChange: (kind: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Realizada");
  const [cashScope, setCashScope] = useState("Profissional");
  const [cashType, setCashType] = useState("");
  const [studentId, setStudentId] = useState("");
  const [extractAudience, setExtractAudience] = useState("Aluno");
  const [extractId, setExtractId] = useState("");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const personal = useLocal<Entry[]>(ledgerKey, [])[0];
  const isExtract = kind === reportKinds[3];
  const isStudentReport = kind === reportKinds[1];
  const isStudentList = kind === reportKinds[2];
  const reportStudent = isStudentReport ? students.find((student) => String(student.id) === studentId) : undefined;
  const extractStudent = isExtract && extractAudience === "Aluno" ? students.find((student) => String(student.id) === extractId) : undefined;
  const extractGroup = isExtract && extractAudience === "Grupo" ? groups.find((group) => group.id === extractId) : undefined;
  const extractTargets = extractAudience === "Aluno" ? students : groups;
  const studentLessons = (records: LessonRecord[], student: Person) => {
    const memberships = groups.filter((group) => group.members.includes(student.id)).map((group) => group.name);
    return records.filter((lesson) => lesson.student === student.name || memberships.includes(lesson.student));
  };
  const isCash = kind === reportKinds[4];
  const within = (date: string) => (!from || date >= from) && (!to || date <= to);
  const visibleLessons = lessons.filter((item) => within(lessonDate(item.day)) && (kind !== reportKinds[0] || !status || item.status === status));
  const visibleStudents = students.filter((item) => matches(`${item.name} ${item.email} ${item.course} ${item.birthDate ? dateLabel(item.birthDate) : ""}`, query));
  const ledger = [
    ...((!isCash || cashScope === "Profissional") ? payments : []).map((item) => ({ id: String(item.id), title: item.name, kind: "Entrada", date: paymentDate(item.due), settled: item.paid, value: item.value })),
    ...(isCash && cashScope === "Pessoal" ? personal : []),
  ].filter((item) => within(item.date) && matches(item.title, query) && (!isCash || !cashType || item.kind === cashType));
  const realized = (type: string) => ledger.filter((item) => item.kind === type && item.settled).reduce((sum, item) => sum + item.value, 0);
  const chart = ["Entrada", "Saída"].map((type) => ({ type, value: realized(type) }));
  const recipient = reportStudent ?? extractStudent;
  const periodLessons = recipient ? studentLessons(visibleLessons, recipient)
    : extractGroup ? visibleLessons.filter((lesson) => lesson.student === extractGroup.name)
    : isExtract ? [] : visibleLessons;
  let headers: string[];
  let rows: string[][];
  if (kind === reportKinds[0] || isExtract || reportStudent) {
    headers = ["Data", "Horário", "Aluno ou grupo", "Aula", "Status"];
    if (isExtract && includeNotes) headers.push("Anotações do professor");
    rows = periodLessons.filter((item) => matches(`${item.student} ${item.subject}`, query)).map((item) => {
      const row = [dateLabel(lessonDate(item.day)), item.time, item.student, item.subject, item.status];
      if (isExtract && includeNotes) row.push(localStorage.getItem(`ior-lesson-note-${item.id}`) ??
        localStorage.getItem("lesson-note-" + students.find((student) => student.name === item.student)?.id) ?? "");
      return row;
    });
  } else if (isStudentList) {
    headers = ["Nome", "E-mail", "Curso", "Nascimento"];
    rows = visibleStudents.map((item) => [item.name, item.email, item.course, item.birthDate ? dateLabel(item.birthDate) : "—"]);
  } else if (isStudentReport) {
    headers = ["Nome", "Aulas realizadas no período", "Total de aulas no período"];
    rows = visibleStudents.map((item) => {
      const records = studentLessons(visibleLessons, item);
      return { name: item.name, completed: records.filter((lesson) => lesson.status === "Realizada").length, total: records.length };
    }).sort((a, b) => b.completed - a.completed || a.name.localeCompare(b.name))
      .map((item) => [item.name, String(item.completed), String(item.total)]);
  } else {
    headers = ["Data", "Descrição", "Tipo", "Valor", "Status"];
    rows = ledger.map((item) => [dateLabel(item.date), item.title, item.kind, formatMoney(item.value), item.settled ? "Realizado" : "Previsto"]);
  }
  return <section className="card management report-print">
    <h2 className="print-report-title">{kind}</h2>
    <div className="management-fields report-controls">
      <label>Tipo de relatório<select value={kind} onChange={(event) => onKindChange(event.target.value)}>{reportKinds.map((item) => <option key={item}>{item}</option>)}</select></label>
      {isCash && <label>Origem do fluxo<select value={cashScope} onChange={(event) => setCashScope(event.target.value)}><option>Profissional</option><option>Pessoal</option></select></label>}
      {isCash && <label>Tipo de movimento<select value={cashType} onChange={(event) => setCashType(event.target.value)}>
        <option value="">Entradas e saídas</option><option>Entrada</option><option>Saída</option>
      </select></label>}
      {isStudentReport && <label>Aluno do relatório<select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
        <option value="">Comparar todos os alunos</option>
        {students.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select></label>}
      {isExtract && <>
        <label>Tipo de extrato<select value={extractAudience} onChange={(event) => {
          setExtractAudience(event.target.value);
          setExtractId("");
        }}><option>Aluno</option><option>Grupo</option></select></label>
        <label>Destinatário do extrato<select value={extractId} onChange={(event) => setExtractId(event.target.value)}>
          <option value="">Selecione {extractAudience.toLowerCase()}</option>
          {extractTargets.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select></label>
      </>}
      <label>Buscar nos registros<input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {kind !== reportKinds[2] && <>
        <label>De<input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label>
        <label>Até<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
      </>}
      {kind === reportKinds[0] && <label>Status da aula<select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">Todos</option><option>Realizada</option><option>Pendente</option><option>Cancelada</option>
      </select></label>}
    </div>
    {isStudentReport && !reportStudent && <p>Alunos em ordem de aulas realizadas no período.</p>}
    {reportStudent && <>
      <div><h2>{reportStudent.name}</h2><p>{reportStudent.course} · {reportStudent.email}</p></div>
      <div className="management-totals">
        <p>Total de aulas <strong>{periodLessons.length}</strong></p>
        {["Realizada", "Pendente", "Cancelada"].map((label) =>
          <p key={label}>Aulas {label.toLowerCase()}s <strong>{periodLessons.filter((lesson) => lesson.status === label).length}</strong></p>
        )}
      </div>
    </>}
    {isExtract && <label className="management-check report-controls">
      <input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} /> Incluir anotações do professor
    </label>}
    {isExtract && (recipient || extractGroup) && <h2>{(recipient || extractGroup)?.name}</h2>}
    {isCash && <>
      <p>Entradas e saídas realizadas no escopo {cashScope.toLowerCase()}.</p>
      {chart.map((item) => <label className="management-chart" key={item.type}>
        {item.type}: {formatMoney(item.value)}
        <meter min={0} max={Math.max(1, ...chart.map((bar) => bar.value))} value={item.value} />
      </label>)}
    </>}
    <div className="management-actions report-controls">
      <button className="primary" onClick={() => exportCsv(`iorclass-${normalize(kind).replaceAll(" ", "-")}.csv`, headers, rows)} disabled={!rows.length}><Download size={16} /> Exportar CSV filtrado</button>
      <button className="secondary" onClick={() => window.print()} disabled={!rows.length}><Printer size={16} /> Imprimir / PDF</button>
    </div>
    <p>{rows.length} {rows.length === 1 ? "registro" : "registros"}</p>
    <Table headers={headers} rows={rows} />
  </section>;
}

const partnerSections = [
  { name: "Início", actions: [] },
  { name: "Agenda", actions: ["agendar", "editar", "confirmar realização"] },
  { name: "Alunos", actions: ["cadastrar", "editar", "gerenciar grupos"] },
  { name: "Leads", actions: ["cadastrar", "editar etapas"] },
  { name: "Recados de alunos", actions: ["publicar", "remover"] },
  { name: "Financeiro", actions: ["lançar", "confirmar pagamento", "exportar"] },
  { name: "Financeiro pessoal", actions: ["lançar", "confirmar lançamento"] },
  { name: "Arquivos", actions: ["adicionar", "baixar", "mover", "excluir"] },
  { name: "Atividades", actions: ["criar", "avaliar"] },
  { name: "Tarefas", actions: ["criar", "editar", "concluir"] },
  { name: "Relatórios", actions: ["exportar"] },
  { name: "Parceiros", actions: ["cadastrar", "editar", "arquivar"] },
  { name: "Recados de parceiros", actions: ["publicar", "remover"] },
  { name: "Relatório de trabalho", actions: ["exportar"] },
  { name: "Benefícios", actions: [] },
  { name: "Configurações", actions: ["editar"] },
  { name: "Central de ajuda", actions: ["registrar solicitação"] },
];
const permissionKey = (section: string, action: string) => `${section} · ${action}`;
export function Partners({ records, setRecords }: {
  records: Partner[]; setRecords: Dispatch<SetStateAction<Partner[]>>;
}) {
  const [selected, setSelected] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [archived, setArchived] = useState(false);
  const [notice, setNotice] = useState("");
  const partner = records.find((record) => record.id === selected);
  function edit(id: string) {
    const saved = records.find((item) => item.id === id)?.permissions ?? [];
    const impliedViews = partnerSections.filter(({ name, actions }) =>
      actions.some((action) => saved.includes(permissionKey(name, action))),
    ).map(({ name }) => permissionKey(name, "consultar"));
    setPermissions([...new Set([...saved, ...impliedViews])]);
    setSelected(id);
  }
  function changePermission(section: string, action: string, enabled: boolean) {
    const key = permissionKey(section, action);
    setPermissions((current) => {
      if (enabled) return [...new Set([...current, key, permissionKey(section, "consultar")])];
      return action === "consultar"
        ? current.filter((item) => !item.startsWith(section + " · "))
        : current.filter((item) => item !== key);
    });
  }
  function archive(id: string, value: boolean) {
    setRecords((current) => current.map((item) => item.id === id ? { ...item, archived: value } : item));
    edit("");
  }
  return <section className="card management">
    <h2>{partner ? "Editar parceiro" : "Cadastrar parceiro"}</h2>
    <p>Cadastre um professor da equipe e defina o acesso por tela. As permissões são salvas neste navegador para a demonstração.</p>
    <form key={selected} onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const name = field(form, "name");
      const email = field(form, "email").toLowerCase();
      if (!name) return;
      const duplicate = records.find((item) => item.email === email && item.id !== selected);
      if (duplicate) {
        setNotice(duplicate.archived ? "Esse e-mail está em Parceiros arquivados. Você pode restaurar o cadastro." : "Já existe um parceiro ativo com esse e-mail.");
        return;
      }
      const record = { id: selected || uid(), name, email, permissions, archived: partner?.archived ?? false };
      setRecords((current) => selected ? current.map((item) => item.id === selected ? record : item) : [...current, record]);
      setNotice("Parceiro salvo.");
      edit("");
      event.currentTarget.reset();
    }}>
      <div className="management-fields">
        <label>Nome do parceiro<input name="name" required defaultValue={partner?.name} /></label>
        <label>E-mail do parceiro<input type="email" name="email" required defaultValue={partner?.email} /></label>
      </div>
      <fieldset className="partner-permissions">
        <legend>Permissões por tela</legend>
        <p className="workspace-muted">Ver a tela libera a consulta. Marque separadamente as ações que o professor pode executar.</p>
        {partnerSections.map(({ name, actions }) => {
          const canView = permissions.includes(permissionKey(name, "consultar"));
          return <div className="permission-row" key={name} role="group" aria-label={name}>
            <strong>{name}</strong>
            <label className="management-check"><input type="checkbox" checked={canView}
              aria-label={`Ver tela de ${name}`} onChange={(event) => changePermission(name, "consultar", event.target.checked)} /> Ver tela</label>
            <div className="permission-actions">
              {actions.map((action) => <label className="management-check" key={action}>
                <input type="checkbox" aria-label={permissionKey(name, action)} disabled={!canView}
                  checked={permissions.includes(permissionKey(name, action))}
                  onChange={(event) => changePermission(name, action, event.target.checked)} />{action}
              </label>)}
            </div>
          </div>;
        })}
      </fieldset>
      <div className="management-actions">
        <button className="primary">Salvar parceiro</button>
        {partner && <button type="button" className="text-button" onClick={() => edit("")}>Cancelar edição</button>}
      </div>
    </form>
    {notice && <p role="status">{notice}</p>}
    <label className="management-check"><input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} /> Parceiros arquivados</label>
    <Table headers={["Nome", "E-mail", "Permissões", "Ações"]} rows={records.filter((item) => item.archived === archived).map((item) => [
      item.name, item.email, item.permissions.join(", ") || "Nenhuma",
      <div className="management-actions"><button className="text-button" onClick={() => edit(item.id)}>Editar parceiro</button>
        <button className="text-button" onClick={() => archive(item.id, !item.archived)}>{item.archived ? "Restaurar parceiro" : "Arquivar parceiro"}</button></div>,
    ])} />
  </section>;
}

export function PartnerWorkReport({ partners, lessons }: { partners: Partner[]; lessons: LessonRecord[] }) {
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const partner = partners.find((item) => item.id === partnerId);
  const records = lessons.filter((lesson) => {
    const date = lessonDate(lesson.day);
    return partner && lesson.partnerId === partner.id && (!from || date >= from) && (!to || date <= to);
  }).sort((a, b) => lessonDate(a.day).localeCompare(lessonDate(b.day)) || a.time.localeCompare(b.time));
  const count = (status: string) => records.filter((lesson) => lesson.status === status).length;
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const minutes = records.reduce((total, item) => {
    if (item.status !== "Realizada" || !item.end) return total;
    return total + Math.max(0, toMinutes(item.end) - toMinutes(item.time));
  }, 0);
  const headers = ["Data", "Horário", "Aluno ou grupo", "Aula", "Status"];
  const rows = records.map((item) => [dateLabel(lessonDate(item.day)), item.time, item.student, item.subject, item.status]);
  return <section className="card management report-print">
    <h2 className="print-report-title">Relatório de Trabalho Parceiro</h2>
    <div className="management-fields report-controls">
      <label>Parceiro do relatório<select value={partnerId} onChange={(event) => setPartnerId(event.target.value)}>
        {!partners.length && <option value="">Nenhum parceiro cadastrado</option>}
        {partners.map((item) => <option value={item.id} key={item.id}>{item.name}{item.archived ? " (arquivado)" : ""}</option>)}
      </select></label>
      <label>De<input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label>
      <label>Até<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
    </div>
    {partner ? <>
      <div><h2>{partner.name}</h2><p>{partner.email}</p></div>
      <div className="management-totals">
        <p>Total de aulas <strong>{records.length}</strong></p>
        <p>Aulas realizadas <strong>{count("Realizada")}</strong></p>
        <p>Aulas pendentes <strong>{count("Pendente")}</strong></p>
        <p>Aulas canceladas <strong>{count("Cancelada")}</strong></p>
        <p>Tempo realizado <strong>{Math.floor(minutes / 60)} h {minutes % 60} min</strong></p>
      </div>
      <h3>Aulas no período</h3>
      <div className="management-actions report-controls">
        <button className="primary" disabled={!rows.length} onClick={() => exportCsv("iorclass-trabalho-parceiro.csv", headers, rows)}><Download size={16} /> Exportar CSV filtrado</button>
        <button className="secondary" disabled={!rows.length} onClick={() => window.print()}><Printer size={16} /> Imprimir / PDF</button>
      </div>
      <Table headers={headers} rows={rows} />
    </> : <p className="management-empty">Cadastre um parceiro e selecione-o como responsável em um agendamento para acompanhar suas aulas.</p>}
  </section>;
}

export function SettingsPanel({ profile, setProfile }: { profile: TeacherProfile; setProfile: (value: TeacherProfile) => void }) {
  const [saved, setSaved] = useState(false);
  return <section className="card management">
    <h2>Perfil do professor</h2>
    <form className="management-fields" onChange={() => setSaved(false)} onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const name = field(form, "name");
      const studio = field(form, "studio");
      const subject = field(form, "subject");
      if (!name || !studio || !subject) return;
      setProfile({ name, studio, subject, bio: field(form, "bio"), color: field(form, "color") });
      setSaved(true);
    }}>
      <label>Nome do professor<input name="name" defaultValue={profile.name} required /></label>
      <label>Nome do estúdio<input name="studio" defaultValue={profile.studio} required /></label>
      <label>O que você ensina<input name="subject" defaultValue={profile.subject} required /></label>
      <label>Sobre suas aulas<textarea name="bio" defaultValue={profile.bio} maxLength={500} /></label>
      <label>Cor de destaque no app do aluno<input name="color" type="color" defaultValue={profile.color} /></label>
      <button className="primary">Salvar perfil</button>
    </form>
    {saved && <p role="status">Perfil salvo neste navegador.</p>}
  </section>;
}

const helpAnswers: Record<string, string> = {
  "Como cadastro um aluno?": "Em Alunos, abra Novo aluno e siga as cinco etapas. O protótipo gera uma aula e uma cobrança de exemplo.",
  "Onde vejo os recados?": "Em Recados, escreva a mensagem e selecione alunos ou grupos. A Mariana vê no app do aluno os recados que receberam o ID dela.",
  "Como confirmo uma aula?": "Em Aulas de Hoje, use o botão de confirmação ao lado de uma aula pendente.",
  "Como exporto um relatório?": "Em Relatórios, selecione o tipo, aplique os filtros e escolha CSV ou Imprimir / PDF.",
};

export function Support() {
  const [answer, setAnswer] = useState("");
  const [tickets, setTickets] = useLocal<{ id: string; subject: string; text: string }[]>("ior-support-tickets", []);
  return <section className="card management">
    <h2>Perguntas frequentes</h2>
    <div className="management-actions">{Object.entries(helpAnswers).map(([question, response]) =>
      <button className="secondary" key={question} onClick={() => setAnswer(response)}>{question}</button>)}</div>
    {answer && <p className="demo-notice" aria-live="polite">{answer}</p>}
    <h2>Registrar solicitação</h2><p>Registro de suporte demonstrativo, salvo neste navegador.</p>
    <form className="management-fields" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const subject = field(form, "subject");
      const text = field(form, "text");
      if (!subject || !text) return;
      setTickets((current) => [{ id: uid(), subject, text }, ...current]);
      event.currentTarget.reset();
    }}>
      <label>Assunto<input name="subject" required /></label>
      <label>Mensagem<textarea name="text" required maxLength={2000} /></label>
      <button className="primary">Salvar solicitação</button>
    </form>
    <h2>Solicitações registradas</h2>
    <Table headers={["Assunto", "Mensagem"]} rows={tickets.map((item) => [item.subject, item.text])} />
  </section>;
}

export function GroupForm({ students, groups, onCreate }: { students: Person[]; groups: Group[]; onCreate: (group: Group) => void }) {
  const [error, setError] = useState("");
  return <form onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = field(form, "name");
    const members = form.getAll("members").map(Number);
    if (!name || !members.length || groups.some((item) => normalize(item.name) === normalize(name))) {
      setError("Informe um nome de grupo único e selecione pelo menos um aluno.");
      return;
    }
    onCreate({ id: uid(), name, members });
  }}>
    <label>Nome do grupo<input name="name" required /></label>
    <fieldset className="management-choices"><legend>Alunos do grupo</legend>
      {students.map((student) => <label key={student.id}><input type="checkbox" name="members" value={student.id} />{student.name}</label>)}
    </fieldset>
    {error && <p role="alert">{error}</p>}
    <button className="primary full">Salvar grupo</button>
  </form>;
}
