# iorCLASS

Protótipo de gestão para professores particulares, construído a partir do mapeamento fornecido. React, TypeScript, Vite e Lucide. Interface responsiva em português, com fontes e imagens locais.

## Executar

```sh
npm ci --cache /tmp/iorclass-npm
npm run dev -- --port 5173
```

```sh
npm run build
npx playwright test --workers=1
```

Os testes usam Chromium instalado em `/usr/bin/chromium`. Caso necessário, ajuste o `executablePath` em `tests/prototype.spec.ts`.

## Fluxos disponíveis

- Painel com aulas, tarefas, indicadores e acesso à assistente.
- Cadastro de aluno em cinco etapas, ficha, anotações, busca e grupos demonstrativos.
- Agenda semanal e mensal; criação de aula e arrastar entre dias.
- Financeiro com filtros, confirmação de pagamentos, novos lançamentos e CSV.
- CRM com criação de contatos, movimentação de cartões e conversão em aluno.
- Criação e avaliação de atividades, relatórios e gráficos.
- Assistente com propostas simuladas e confirmação para concluir aulas.
- Prévia do app do aluno no menu do perfil.

Dados fictícios persistidos em localStorage. Para reiniciar, limpe os dados do site. O cadastro gera uma aula e uma cobrança de exemplo; geração recorrente completa, autenticação, backend, armazenamento de arquivos, IA real e integrações financeiras ainda não estão implementados. As telas de plano e arquivos são demonstrações visuais. A agenda utiliza novembro de 2026 como período demonstrativo.

Fotografias demonstrativas provenientes dos temas Creative e Agency do Start Bootstrap (MIT), não retratam usuários reais do produto. Fontes Barlow e Inter distribuídas via Fontsource.

## Publicar no Render

O arquivo `render.yaml` configura o protótipo como **Static Site**, com HTTPS e endereço gratuito `*.onrender.com`.

1. No painel do Render, escolha **New → Blueprint**.
2. Conecte o repositório `joaslima538/iorclass` e selecione a branch `iorclass-render`.
3. Revise o serviço `iorclass` e clique em **Deploy Blueprint**.
4. Ao terminar o deploy, abra o endereço informado pelo Render. O nome exato depende da disponibilidade na plataforma.

Alternativa: **New → Static Site**, com build `npm ci --include=dev && npm run build` e diretório de publicação `dist`. Não é necessário Start Command nem variáveis secretas.

Para domínio próprio: abra **Settings → Custom Domains → Add Custom Domain** no serviço, informe o domínio e crie no provedor DNS os registros indicados pelo Render. Aguarde a verificação e a emissão automática do certificado HTTPS.

O protótipo publicado continua usando dados fictícios e localStorage: cada navegador tem dados próprios. Nenhum dado é compartilhado entre dispositivos e nenhuma cobrança real é realizada.

## Navegação da demonstração

- `/#inicio` (ou raiz): landing page, recursos e planos.
- `/#login` e `/#cadastro`: telas públicas com login demo para professor e aluno, sem autenticação ou cadastro real.
- `/#professor`: painel do professor. O menu lateral tem rolagem independente, acesso ao app do aluno e botão **Sair e ver site**.
- `/#aluno`: área navegável do aluno com aulas, anotações locais, resposta de atividade, situação de pagamentos e guia de prática. O botão **Visão do professor** retorna ao painel.

Execute `npx playwright test --workers=1` para validar também navegação pública, saída, área do aluno e menu em janelas de pouca altura.

## Compartilhamento social

O HTML contém Open Graph e Twitter Card com URL pública `https://iorclass.onrender.com/` e capa PNG local de 1200 × 630. Ao trocar o domínio, atualize canonical, `og:url` e URLs de imagem em `index.html`. A capa pode ser regenerada com `node scripts/generate-social-cover.mjs` (Chromium local e dependências de desenvolvimento necessários). O WhatsApp pode manter a prévia anterior em cache após o deploy.
