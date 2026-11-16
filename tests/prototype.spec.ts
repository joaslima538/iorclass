import { test, expect } from "@playwright/test";
test.use({
  launchOptions: {
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  },
});
test("teacher workflow and persistence", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173");
  await expect(
    page.getByRole("heading", { name: "Bom dia, Carol" }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/iorclass-desktop.png", fullPage: true });
  await page.getByTitle("Marcar como realizada").first().click();
  await expect(page.locator(".lesson-action .green")).toHaveCount(3);
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Alunos", exact: true })
    .click();
  await page.getByRole("button", { name: "Novo aluno", exact: true }).click();
  await page.getByLabel("Nome completo").fill("Aluno Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("teste@example.com");
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("button", { name: "Cadastrar aluno", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Aluno Teste", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Alunos", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Aluno Teste", exact: true }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Financeiro", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Aluno Teste Mensalidade · Novembro" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar pagamento" })
    .last()
    .click();
  await expect(
    page.locator("tbody tr").last().getByText("Pago", { exact: true }),
  ).toBeVisible();
  for (const section of ["Agenda", "Leads", "Atividades", "Relatórios"]) {
    await page
      .locator(".sidebar")
      .getByRole("button", { name: new RegExp("^" + section) })
      .click();
    await expect(
      page.getByRole("heading", { name: section, exact: true }),
    ).toBeVisible();
  }
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Início", exact: true })
    .click();
  await page.getByTitle("Abrir assistente iorIA").click();
  await page
    .getByRole("button", { name: "Concluir as aulas de hoje", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar alterações" }).click();
  await expect(page.locator(".lesson-action .green")).toHaveCount(5);
  expect(errors).toEqual([]);
});
test("mobile navigation and layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:5173");
  await expect(page.locator(".mobile-nav")).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "/tmp/iorclass-mobile.png", fullPage: true });
  await page
    .locator(".mobile-nav")
    .getByRole("button", { name: "Alunos", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Alunos", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
test("create lead and activity, and reschedule a lesson", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Leads", exact: true })
    .click();
  await page.getByRole("button", { name: "Novo lead", exact: true }).click();
  await page.getByLabel("Nome do contato").fill("Novo Contato");
  await page.getByLabel("E-mail").fill("lead@example.com");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Novo Contato", exact: true }),
  ).toBeVisible();
  await page.locator("#lead-0").dragTo(page.locator(".kanban-column").nth(1), {sourcePosition:{x:15,y:15},targetPosition:{x:100,y:45}});
  await expect(page.locator(".kanban-column").nth(1).getByRole("heading",{name:"Fernanda Souza"})).toBeVisible();
  await page.reload();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Leads", exact: true })
    .click();
  await expect(
    page
      .locator(".kanban-column")
      .nth(1)
      .getByRole("heading", { name: "Fernanda Souza" }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /^Atividades/ })
    .click();
  await page
    .getByRole("button", { name: "Nova atividade", exact: true })
    .click();
  await page.getByLabel("Título da atividade").fill("Prática de teste");
  await page.getByLabel("Descrição").fill("Praticar por dez minutos");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Prática de teste" }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Agenda", exact: true })
    .click();
  await page
    .locator(".calendar-event")
    .first()
    .dragTo(page.locator(".day-column").nth(1), {sourcePosition:{x:12,y:12},targetPosition:{x:60,y:160}});
  await expect(
    page.locator(".day-column").nth(1).getByText("Mariana Costa"),
  ).toBeVisible();
});
