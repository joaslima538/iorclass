import { test, expect } from "@playwright/test";

test.use({ launchOptions: { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] } });
const url = "http://127.0.0.1:5173/";

test("groups are selectable in the agenda and send targeted student bulletins", async ({ page }) => {
  await page.goto(url + "#professor");
  const nav = page.locator(".sidebar");
  await page.getByRole("button", { name: "Primeiros passos" }).click();
  await expect(page.getByText("Etapa 1 de 3")).toBeVisible();
  await page.getByRole("button", { name: "Próxima etapa" }).click();
  await expect(page.getByText("Organize a agenda")).toBeVisible();
  await page.getByRole("button", { name: "Fechar" }).click();
  await nav.getByRole("button", { name: "Alunos", exact: true }).click();
  await page.getByRole("button", { name: "Novo grupo" }).click();
  await page.getByLabel("Nome do grupo").fill("Turma de sábado");
  await page.getByRole("checkbox", { name: "Mariana Costa" }).check();
  await page.getByRole("button", { name: "Salvar grupo" }).click();
  await expect(page.getByRole("heading", { name: "Turma de sábado" })).toBeVisible();
  await nav.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Novo agendamento" }).click();
  await page.getByLabel("Aluno ou grupo").selectOption("Turma de sábado");
  await page.getByLabel("Título da aula").fill("Ensaio coletivo");
  await page.getByRole("button", { name: "Criar agendamento" }).click();
  await expect(page.locator(".calendar-event").getByText("Turma de sábado")).toBeVisible();
  await nav.getByRole("group", { name: "Submenu de Alunos" }).getByRole("button", { name: "Painel Geral de Recados" }).click();
  await page.getByLabel("Recado", { exact: true }).fill("Traga a partitura.");
  await page.getByRole("checkbox", { name: "Turma de sábado" }).check();
  await page.getByRole("button", { name: "Publicar recado" }).click();
  await page.getByLabel("Recado", { exact: true }).fill("Aviso privado para João.");
  await page.getByRole("checkbox", { name: "João Pedro" }).check();
  await page.getByRole("button", { name: "Publicar recado" }).click();

  await nav.getByRole("button", { name: "App do aluno" }).click();
  await page.getByRole("button", { name: "Recados", exact: true }).click();
  await expect(page.getByText("Traga a partitura.")).toBeVisible();
  await expect(page.getByText("Aviso privado para João.")).toHaveCount(0);
  await page.getByRole("button", { name: "Minhas aulas" }).click();
  await expect(page.getByText("Ensaio coletivo")).toBeVisible();
});

test("local library, personal ledger, filtered reports and partner restore", async ({ page }) => {
  await page.goto(url + "#professor");
  const open = (name: string) => page.locator(".sidebar").getByRole("button", { name, exact: true }).click();
  await open("Arquivos");
  await page.getByLabel("Nome da pasta").fill("Partituras");
  await page.getByRole("button", { name: "Criar pasta" }).click();
  await page.getByLabel("Arquivo", { exact: true }).setInputFiles({ name: "partitura.txt", mimeType: "text/plain", buffer: Buffer.from("Música") });
  await page.getByLabel("Pasta de destino").selectOption({ label: "Partituras" });
  await page.getByRole("button", { name: "Salvar arquivo" }).click();
  await expect(page.getByRole("cell", { name: "partitura.txt" })).toBeVisible();
  await page.reload();
  await open("Arquivos");
  await expect(page.getByLabel("Pasta de partitura.txt").locator("option:checked")).toHaveText("Partituras");

  await open("Financeiro");
  await open("Financeiro Pessoal");
  await page.getByLabel("Descrição").fill("Internet");
  await page.getByLabel("Tipo", { exact: true }).selectOption("Saída");
  await page.getByLabel("Data", { exact: true }).fill("2026-11-16");
  await page.getByLabel("Valor (R$)").fill("80");
  await page.getByRole("button", { name: "Salvar lançamento" }).click();
  await page.getByRole("button", { name: "Confirmar lançamento" }).click();
  await expect(page.getByRole("row", { name: /Internet/ })).toContainText("Realizado");
  await open("Relatórios");
  await page.getByLabel("Tipo de relatório").selectOption("Relatório de Fluxo de Caixa");
  await page.getByLabel("Origem do fluxo").selectOption("Pessoal");
  await page.getByLabel("Buscar nos registros").fill("Internet");
  await expect(page.getByRole("row", { name: /Internet/ })).toHaveCount(1);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV filtrado" }).click();
  expect((await downloaded).suggestedFilename()).toBe("iorclass-relatorio-de-fluxo-de-caixa.csv");

  await open("Parceiros");
  await page.getByLabel("Nome do parceiro").fill("Parceiro Demo");
  await page.getByLabel("E-mail do parceiro").fill("demo@example.com");
  await page.getByRole("checkbox", { name: "Agenda · editar" }).check();
  await page.getByRole("button", { name: "Salvar parceiro" }).click();
  await page.getByRole("button", { name: "Arquivar parceiro" }).click();
  await page.getByRole("checkbox", { name: "Parceiros arquivados" }).check();
  await expect(page.getByRole("row", { name: /Parceiro Demo/ })).toContainText("Agenda · editar");
  await page.getByRole("button", { name: "Restaurar parceiro" }).click();
  await page.getByRole("checkbox", { name: "Parceiros arquivados" }).uncheck();
  await expect(page.getByRole("row", { name: /Parceiro Demo/ })).toBeVisible();
});

test("task checklist, attachment and history persist on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url + "#professor");
  const openTasks = async () => {
    await page.locator(".mobile-menu").click();
    await page.locator(".sidebar").getByRole("button", { name: "Tarefas", exact: true }).click();
  };
  await openTasks();
  await page.getByLabel("Nova tarefa").fill("Preparar concerto");
  await page.getByRole("button", { name: "Criar tarefa" }).click();
  await page.getByRole("button", { name: "Preparar concerto" }).click();
  await page.getByLabel("Novo item").fill("Reservar sala");
  await page.getByRole("button", { name: "Adicionar ao checklist" }).click();
  await page.getByRole("checkbox", { name: "Reservar sala" }).check();
  await page.getByLabel("Anexo da tarefa").setInputFiles({ name: "plano.txt", mimeType: "text/plain", buffer: Buffer.from("Plano") });
  await page.getByRole("button", { name: "Anexar arquivo" }).click();
  await expect(page.getByText("Arquivo anexado")).toBeVisible();
  await page.reload();
  await openTasks();
  await page.getByRole("button", { name: "Preparar concerto" }).click();
  await expect(page.getByRole("checkbox", { name: "Reservar sala" })).toBeChecked();
  await expect(page.getByText("Tarefa criada")).toBeVisible();
  await expect(page.getByRole("button", { name: "plano.txt" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("recurring lessons and reviewed activities connect the teacher and student views", async ({ page }) => {
  await page.goto(url + "#professor");
  const nav = page.locator(".sidebar");
  await nav.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Novo agendamento" }).click();
  await page.getByLabel("Título da aula").fill("Série de canto");
  await page.getByLabel("Recorrência").selectOption("4");
  await page.getByRole("button", { name: "Criar agendamento" }).click();
  await expect(page.locator(".calendar-event").filter({ hasText: "Série de canto" })).toHaveCount(1);
  await page.getByRole("button", { name: "Próximo período" }).click();
  await page.locator(".calendar-event").filter({ hasText: "Série de canto" }).click();
  await expect(page.getByText(/23\/11\/2026.*Pendente/)).toBeVisible();
  await page.getByRole("button", { name: "Marcar como realizada" }).click();
  await page.getByRole("button", { name: "Mês", exact: true }).click();
  await expect(page.locator(".month-lesson").filter({ hasText: "Mariana Costa" })).toHaveCount(4);

  await nav.getByRole("button", { name: /^Atividades/ }).click();
  await page.getByRole("button", { name: "Nova atividade" }).click();
  await page.getByLabel("Título da atividade").fill("Estudo de ritmo");
  await page.getByLabel("Descrição").fill("Faça duas repetições.");
  await page.getByLabel("Destinatário da atividade").selectOption({ label: "Mariana Costa" });
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await nav.getByRole("button", { name: "App do aluno" }).click();
  await page.getByRole("button", { name: "Atividades", exact: true }).click();
  await page.getByLabel("Resposta para Estudo de ritmo").fill("Consegui completar as duas repetições.");
  await page.getByRole("button", { name: "Salvar resposta da atividade" }).click();
  await page.getByRole("button", { name: "Visão do professor" }).click();
  await nav.getByRole("button", { name: /^Atividades/ }).click();
  const review = page.locator(".activity-row").filter({ hasText: "Estudo de ritmo" });
  await expect(review).toContainText("Consegui completar as duas repetições.");
  await review.getByRole("button", { name: "Marcar como avaliada" }).click();
  await expect(review).toContainText("Avaliado");
});

test("reference submenus open their destinations and highlight the selected report", async ({ page }) => {
  await page.goto(url + "#professor");
  const nav = page.locator(".sidebar");
  const reportMenu = page.getByRole("group", { name: "Submenu de Relatórios" });
  await nav.getByRole("button", { name: "Relatórios", exact: true }).click();
  for (const name of ["Relatório de Aulas", "Relatório de Aluno", "Relatório Lista de Alunos", "Extrato de Aulas", "Relatório de Fluxo de Caixa", "Relatório Financeiro"]) {
    const destination = reportMenu.getByRole("button", { name, exact: true });
    await destination.click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(destination).toHaveAttribute("aria-current", "page");
  }
  await reportMenu.getByRole("button", { name: "Relatório de Aluno", exact: true }).click();
  await page.getByLabel("Aluno do relatório").selectOption({ label: "Mariana Costa" });
  await expect(page.getByRole("heading", { name: "Mariana Costa", exact: true })).toBeVisible();
  await expect(page.getByRole("row", { name: /Mariana Costa.*Respiração e apoio/ })).toBeVisible();
  await reportMenu.getByRole("button", { name: "Extrato de Aulas", exact: true }).click();
  await page.getByLabel("Destinatário do extrato").selectOption({ label: "Mariana Costa" });
  await page.getByLabel("Incluir anotações do professor").check();
  await expect(page.getByRole("columnheader", { name: "Anotações do professor" })).toBeVisible();
  await page.getByLabel("Tipo de extrato").selectOption("Grupo");
  await expect(page.getByLabel("Destinatário do extrato").locator("option", { hasText: "Vozes em harmonia" })).toHaveCount(1);
  await nav.getByRole("button", { name: "Arquivos" }).click();
  await expect(page.getByRole("heading", { name: "Biblioteca de arquivos" })).toHaveCSS("color", "rgb(37, 53, 79)");
  await nav.getByRole("button", { name: "Meus Benefícios" }).click();
  await expect(page.getByText("Exemplo do catálogo")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".mobile-menu").click();
  await nav.getByRole("button", { name: "Financeiro", exact: true }).click();
  const financeMenu = page.getByRole("group", { name: "Submenu de Financeiro" });
  await financeMenu.getByRole("button", { name: "Financeiro Pessoal" }).click();
  await expect(page.getByRole("heading", { name: "Financeiro pessoal", exact: true })).toBeVisible();
  await expect(nav).toBeHidden();
});

test("partner messages and work report use saved partners and assigned lessons", async ({ page }) => {
  await page.goto(url + "#professor");
  const nav = page.locator(".sidebar");
  const partnerMenu = page.getByRole("group", { name: "Submenu de Parceiros" });
  await nav.getByRole("button", { name: "Parceiros", exact: true }).click();
  await partnerMenu.getByRole("button", { name: "Listar Parceiros" }).click();
  await page.getByLabel("Nome do parceiro").fill("Estúdio parceiro");
  await page.getByLabel("E-mail do parceiro").fill("estudio@example.com");
  await page.getByRole("button", { name: "Salvar parceiro" }).click();

  await partnerMenu.getByRole("button", { name: "Painel Geral de Recados" }).click();
  await page.getByLabel("Recado", { exact: true }).fill("Prepare os materiais da turma.");
  await page.getByRole("checkbox", { name: "Estúdio parceiro" }).check();
  await page.getByRole("button", { name: "Publicar recado" }).click();
  await expect(page.getByRole("row", { name: /Prepare os materiais da turma.*Estúdio parceiro/ })).toBeVisible();
  await nav.getByRole("button", { name: "Alunos", exact: true }).click();
  await page.getByRole("group", { name: "Submenu de Alunos" }).getByRole("button", { name: "Painel Geral de Recados" }).click();
  await expect(page.getByText("Prepare os materiais da turma.")).toHaveCount(0);

  await nav.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByRole("button", { name: "Novo agendamento" }).click();
  await page.getByLabel("Título da aula").fill("Aula com parceiro");
  await page.getByLabel("Parceiro responsável").selectOption({ label: "Estúdio parceiro" });
  await page.getByRole("button", { name: "Criar agendamento" }).click();
  await page.locator(".calendar-event").filter({ hasText: "Aula com parceiro" }).click();
  await page.getByRole("button", { name: "Marcar como realizada" }).click();

  await partnerMenu.getByRole("button", { name: "Relatório de Trabalho Parceiro" }).click();
  await expect(page.getByRole("heading", { name: "Relatório de Trabalho Parceiro", exact: true })).toBeVisible();
  await expect(page.getByRole("row", { name: /Aula com parceiro/ })).toContainText("Realizada");
  await expect(page.getByText("1 h 0 min")).toBeVisible();
  await page.getByLabel("De", { exact: true }).fill("2026-11-17");
  await expect(page.getByRole("row", { name: /Aula com parceiro/ })).toHaveCount(0);
});
