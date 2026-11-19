import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const asset = (path) => readFileSync(new URL(path, import.meta.url)).toString("base64");
const fonts = [600, 800].map((weight) => {
  const data = asset(`../node_modules/@fontsource/barlow/files/barlow-latin-${weight}-normal.woff2`);
  return `@font-face { font-family: Barlow; font-weight: ${weight}; src: url(data:font/woff2;base64,${data}); }`;
});
const dashboard = asset("../public/images/landing/painel.jpg");

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`
    <!doctype html>
    <html lang="pt-BR">
      <meta charset="utf-8">
      <style>
        ${fonts.join("\n")}
        * { box-sizing: border-box; }
        body {
          margin: 0;
          width: 1200px;
          height: 630px;
          overflow: hidden;
          background: radial-gradient(circle, #ffffff24 1px, transparent 1.7px) 0 0 / 24px 24px,
            radial-gradient(ellipse at 86% 8%, #149fff, transparent 55%),
            linear-gradient(120deg, #0648b7, #006fd7 70%, #087ed2);
          color: #fff;
          font: 600 30px Barlow, sans-serif;
        }
        .copy { position: relative; z-index: 1; padding: 68px 0 0 72px; }
        .brand { display: flex; gap: 13px; align-items: center; font-size: 45px; letter-spacing: 4px; }
        h1 { margin: 38px 0 21px; font-size: 74px; line-height: .99; letter-spacing: -1.5px; font-weight: 800; }
        h1 span { color: #ffdc3b; }
        p { margin: 0; color: #f3f7ff; line-height: 1.3; }
        .url { display: inline-block; margin-top: 30px; padding: 9px 17px; border: 1px solid #ffffff66; border-radius: 10px; font-size: 22px; background: #084ab0; }
        .screen {
          position: absolute;
          top: 158px;
          left: 611px;
          width: 648px;
          border: 5px solid #e6ecff;
          border-radius: 22px;
          box-shadow: 0 25px 70px #051d6366;
          transform: rotate(-7deg);
        }
      </style>
      <div class="copy">
        <div class="brand">
          <svg width="61" height="61" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M5 7l10 4a19 19 0 0110 0l10-4-2 17c-2 9-10 13-13 14C12 35 6 30 6 23Z" fill="#101c50"/>
            <circle cx="14" cy="21" r="7" fill="white"/>
            <circle cx="26" cy="21" r="7" fill="white"/>
            <circle cx="15" cy="21" r="3" fill="#101c50"/>
            <circle cx="25" cy="21" r="3" fill="#101c50"/>
            <path d="m18 28 2 3 2-3" fill="#FBC407"/>
          </svg>
          iorCLASS
        </div>
        <h1>Gestão para<br><span>professores<br>particulares</span></h1>
        <p>Aulas, alunos e finanças<br>em um só lugar.</p>
        <span class="url">iorclass.onrender.com</span>
      </div>
      <img class="screen" src="data:image/jpeg;base64,${dashboard}" alt="Painel da iorCLASS">
    </html>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.querySelector(".screen").decode();
  });
  await page.screenshot({
    path: new URL("../public/images/iorclass-social-v2.jpg", import.meta.url).pathname,
    type: "jpeg",
    quality: 88,
  });
} finally {
  await browser.close();
}
