import { test, expect } from "@playwright/test";
test.use({
  launchOptions: {
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  },
});
test("public site, registration, demo login and logout", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173/");
  await expect(
    page.getByRole("heading", { name: /Gestão para/ }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/iorclass-landing.png", fullPage: true });
  await page.getByRole("button", { name: "Login demo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bom dia, Carol" }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Sair e ver site" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Gestão para/ }),
  ).toBeVisible();
  await page
    .locator(".public-header")
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Login Professor" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cadastre-se grátis" }).click();
  await expect(
    page.getByRole("heading", { name: "Criar uma conta" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Login demo · Professor" }).click();
  await expect(
    page.getByRole("heading", { name: "Bom dia, Carol" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("sidebar items stay reachable in short desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 680 });
  await page.goto("http://127.0.0.1:5173/#professor");
  const sidebar = page.locator(".sidebar");
  await sidebar
    .getByRole("button", { name: "Sair e ver site" })
    .scrollIntoViewIfNeeded();
  const bounds = await sidebar
    .getByRole("button", { name: "Sair e ver site" })
    .boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(680);
  await sidebar.getByRole("button", { name: "App do aluno" }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, Mariana ✦" }),
  ).toBeVisible();
});
test("student app navigation, notes and assignment persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173/#login");
  await page.getByRole("button", { name: "Sou aluno" }).click();
  await page.getByRole("button", { name: "Login demo · Aluno" }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, Mariana ✦" }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/iorclass-student.png", fullPage: true });
  await page.getByRole("button", { name: "Minhas aulas", exact: true }).click();
  await page
    .getByPlaceholder("O que você aprendeu hoje?")
    .fill("Revisar respiração");
  await page.getByRole("button", { name: "Salvar anotações" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Minhas aulas", exact: true }).click();
  await expect(page.getByPlaceholder("O que você aprendeu hoje?")).toHaveValue(
    "Revisar respiração",
  );
  await page.getByRole("button", { name: "Atividades", exact: true }).click();
  await page
    .getByLabel("Como foi a prática? Conte sua experiência.")
    .fill("Pratiquei por dez minutos.");
  await page.getByRole("button", { name: "Enviar resposta" }).click();
  await expect(page.getByText("Respondido", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pagamentos", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mensalidade · Novembro" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Materiais", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Guia de aquecimento vocal" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Visão do professor" }).click();
  await expect(
    page.getByRole("heading", { name: "Bom dia, Carol" }),
  ).toBeVisible();
  await page.locator(".top-avatar").click();
  await page.getByRole("button", { name: "Visualizar app do aluno" }).click();
  await expect(
    page.getByRole("heading", { name: "Olá, Mariana ✦" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("public and student pages fit mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["inicio", "login", "cadastro", "aluno"]) {
    await page.goto("http://127.0.0.1:5173/#" + route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  }
  await page.screenshot({
    path: "/tmp/iorclass-student-mobile.png",
    fullPage: true,
  });
});

test('login and registration fit the first screen at common viewport sizes',async({page})=>{
 for(const viewport of [{width:1366,height:680},{width:1280,height:720},{width:1440,height:900},{width:390,height:844},{width:375,height:667}]){
  await page.setViewportSize(viewport);
  for(const route of ['login','cadastro']){
   await page.goto('http://127.0.0.1:5173/#'+route);
   const demo=page.getByRole('button',{name:'Login demo · Professor'});
   await expect(demo).toBeVisible();
   const bottom=await page.locator('.auth-disclaimer').boundingBox();
   expect(bottom!.y+bottom!.height,`${route} footer at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(viewport.height);
   expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height);
  }
 }
 await page.setViewportSize({width:1366,height:680});await page.goto('http://127.0.0.1:5173/#cadastro');await page.screenshot({path:'/tmp/iorclass-compact-auth.png',fullPage:true});
});

test('reference identity, teacher indicators and mobile menu remain usable', async ({page}) => {
  await page.goto('http://127.0.0.1:5173/#professor');
  await expect(page.locator('.plan-strip')).toContainText('FREE');
  await expect(page.locator('.overview-stats .stat')).toHaveCount(4);
  await page.locator('.sidebar').getByRole('button',{name:'Agenda',exact:true}).click();
  await expect(page.locator('.overview-stats')).toBeVisible();
  await expect(page.locator('.topbar')).toHaveCSS('background-color','rgb(52, 75, 250)');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-menu').click();
  await expect(page.locator('.teacher-profile')).toBeVisible();
  const exit=page.locator('.sidebar').getByRole('button',{name:'Sair e ver site'});
  await exit.scrollIntoViewIfNeeded();
  await exit.click();
  await expect(page.getByRole('heading',{name:/Gestão para/})).toBeVisible();
});

test('daily reading text stays legible on desktop and mobile', async ({page}) => {
 for(const viewport of [{width:1366,height:768},{width:390,height:844}]) {
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:5173/#professor');
  for(const selector of ['.lesson-info > b','.lesson-info > span','.date-tabs button','.task','.stat-top','.page-heading p']) {
   const size=await page.locator(selector).first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
   expect(size,`${selector} at ${viewport.width}`).toBeGreaterThanOrEqual(selector.includes('date-tabs') ? 12 : 13);
  }
  await expect(page.locator('.floating-ai')).toContainText('Ajuda');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
 }
});
