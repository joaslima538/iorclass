import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Check,
  ChevronDown, ClipboardList, GraduationCap, ListTodo, Monitor,
  Music2, Quote, Smartphone, UserPlus, Users, Wallet,
} from "lucide-react";
import { Brand, go } from "./public-navigation";
import "./landing.css";

const screens = [
  { file: "painel", title: "Painel do professor", alt: "Painel da iorCLASS com resumo financeiro, próximas aulas e tarefas" },
  { file: "agenda", title: "Agenda de aulas", alt: "Agenda da iorCLASS com aulas e compromissos da semana" },
  { file: "financeiro", title: "Gestão financeira", alt: "Tela financeira da iorCLASS com lançamentos e status de pagamento" },
];

const highlights = [
  { icon: Smartphone, title: "App do aluno", text: "Aulas, atividades, materiais e situação dos pagamentos." },
  { icon: CalendarDays, title: "Calendário", text: "Horários e compromissos em uma agenda semanal ou mensal." },
  { icon: BarChart3, title: "Relatórios", text: "Acompanhe aulas, alunos e a evolução das suas finanças." },
  { icon: Wallet, title: "Gestão financeira", text: "Registre entradas e saídas e veja o que falta receber." },
];

const features = [
  { icon: Users, title: "Gestão de alunos", text: "Encontre fichas, dados e anotações dos seus alunos em um só lugar." },
  { icon: GraduationCap, title: "Aulas em grupo", text: "Organize turmas e mantenha os participantes reunidos no mesmo cadastro." },
  { icon: CalendarDays, title: "Agenda de aulas", text: "Crie aulas, acompanhe o andamento e arraste eventos para reagendar." },
  { icon: ClipboardList, title: "Atividades e avaliações", text: "Crie exercícios, consulte respostas e registre avaliações na demo." },
  { icon: Wallet, title: "Controle financeiro", text: "Registre lançamentos, confirme pagamentos de exemplo e exporte em CSV." },
  { icon: ListTodo, title: "Tarefas", text: "Acompanhe as pendências do dia no painel do professor." },
  { icon: UserPlus, title: "Gestão de interessados", text: "Acompanhe novos contatos e converta uma oportunidade em cadastro de aluno." },
  { icon: BarChart3, title: "Relatórios", text: "Consulte relatórios de aulas e gráficos financeiros com dados da demonstração." },
];

const plans = [
  { name: "Semestral", price: "415", cadence: "a cada 6 meses", color: "semester" },
  { name: "Anual", price: "717", cadence: "por ano", color: "year", featured: true },
  { name: "Mensal", price: "99", cadence: "por mês", color: "month" },
];

const questions = [
  ["Como faço para acessar a iorCLASS?", "Selecione “Login demo” para abrir o painel do professor ou “Sou aluno” para explorar a área do aluno. O acesso é imediato."],
  ["Preciso de uma conta ou cartão para testar?", "A demo é gratuita, usa dados fictícios e funciona sem conta ou cartão. As telas de login e cadastro demonstram como seria esse fluxo."],
  ["Quanto custa a iorCLASS?", "Os preços da seção Planos são valores de referência. O protótipo não vende assinaturas nem realiza cobranças."],
  ["Onde ficam os dados da demonstração?", "As alterações ficam no navegador em que você usou a demo. Elas não são sincronizadas e são removidas quando você limpa os dados do site. Use dados fictícios para testar."],
  ["Consigo usar no celular?", "Sim. Abra a iorCLASS no navegador do seu celular, tanto no Android quanto no iPhone, para acessar o painel do professor ou o app do aluno."],
];

function ProductCarousel() {
  const [active, setActive] = useState(0);
  const previous = (active + screens.length - 1) % screens.length;
  const next = (active + 1) % screens.length;
  const current = screens[active];

  return (
    <section className="lp-carousel" aria-label="Telas da demonstração">
      <div className="lp-carousel-stage">
        <img className="lp-slide lp-slide-left" src={`/images/landing/${screens[previous].file}.jpg`} width="1280" height="800" alt="" />
        <img className="lp-slide lp-slide-right" src={`/images/landing/${screens[next].file}.jpg`} width="1280" height="800" alt="" />
        <img className="lp-slide lp-slide-current" src={`/images/landing/${current.file}.jpg`} width="1280" height="800" alt={current.alt} />
        <div className="lp-carousel-arrows">
          <button type="button" onClick={() => setActive(previous)} aria-label="Tela anterior"><ArrowLeft size={21} /></button>
          <button type="button" onClick={() => setActive(next)} aria-label="Próxima tela"><ArrowRight size={21} /></button>
        </div>
      </div>
      <div className="lp-carousel-caption">
        <span aria-live="polite">{current.title}</span>
        <div className="lp-carousel-dots" aria-label="Escolher tela">
          {screens.map(({ title }, index) => (
            <button key={title} type="button" aria-label={title} aria-pressed={index === active} onClick={() => setActive(index)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  useEffect(() => {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <div className="public-site lp" id="inicio">
      <div className="lp-blue lp-masthead">
        <header className="public-header lp-wrap">
          <Brand />
          <nav aria-label="Acessos à iorCLASS">
            <a className="lp-button lp-green" href="#cadastro">Me cadastrar</a>
            <button className="lp-button lp-purple" onClick={() => go("login")}>Entrar</button>
            <a className="lp-button lp-white" href="#aluno">Sou aluno</a>
          </nav>
        </header>
        <section className="lp-hero lp-wrap" aria-labelledby="lp-title">
          <h1 id="lp-title">Gestão para <em>professores particulares.</em> Aulas, alunos e finanças em um só lugar.</h1>
          <p>Da agenda ao controle de pagamentos, acompanhe sua rotina de ensino com mais praticidade.</p>
          <ProductCarousel />
          <div className="lp-hero-action">
            <button className="lp-button lp-green" onClick={() => go("professor")}>Login demo <ArrowRight size={20} /></button>
            <small>Explore com dados fictícios, sem cadastro ou cartão.</small>
          </div>
        </section>
      </div>

      <main className="lp-main">
        <div className="lp-tinted">
          <section className="lp-wrap lp-section" aria-labelledby="lp-overview">
            <h2 id="lp-overview">Tudo em um único lugar</h2>
            <div className="lp-grid lp-highlights">
              {highlights.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <span className="lp-icon"><Icon aria-hidden="true" size={27} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="lp-wrap lp-testimonial" aria-labelledby="lp-voices">
            <h2 id="lp-voices">O que dizem os professores</h2>
            <figure>
              <Quote size={27} aria-hidden="true" />
              <blockquote>Sério, to amando. Vou conseguir unificar as milhares de planilhas que eu tenho hehe</blockquote>
              <figcaption>Profe @thalitaazulayelt</figcaption>
            </figure>
          </section>

          <section className="lp-wrap lp-section lp-split lp-organization">
            <div>
              <h2>Sua rotina sem depender de planilhas</h2>
              <p>Quando a agenda está em um lugar e os pagamentos em outro, até conferir a próxima aula toma tempo. Na iorCLASS, você encontra horários, fichas de alunos e lançamentos no mesmo painel.</p>
              <p>Veja o que está marcado, o que já foi feito e quanto falta receber. Se precisar dos lançamentos fora da ferramenta, exporte em CSV.</p>
              <a className="lp-text-link" href="#professor">Explorar o painel <ArrowUpRight size={18} /></a>
            </div>
            <img className="lp-screen" src="/images/landing/agenda.jpg" width="1280" height="800" alt="Agenda semanal da demonstração da iorCLASS" loading="lazy" />
          </section>
        </div>

        <section className="lp-wrap lp-section" aria-labelledby="lp-audience">
          <h2 id="lp-audience">Para quem a iorCLASS foi feita?</h2>
          <div className="lp-two-cards">
            <article>
              <span className="lp-icon"><Music2 size={24} /></span>
              <h3>Para quem dá aulas particulares</h3>
              <p>Professores de música, idiomas, reforço escolar e outras áreas. Para aulas individuais ou em grupo, presenciais ou online.</p>
            </article>
            <article>
              <span className="lp-icon"><Monitor size={24} /></span>
              <h3>Para quem trabalha por conta própria</h3>
              <p>Professores que cuidam da própria agenda, acompanham o progresso dos alunos e precisam ter os pagamentos à mão.</p>
            </article>
          </div>
        </section>

        <div className="lp-tinted">
          <section id="recursos" className="lp-wrap lp-section" aria-labelledby="lp-features">
            <h2 id="lp-features">Veja o que tem na iorCLASS</h2>
            <div className="lp-grid lp-features">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <span className="lp-icon"><Icon aria-hidden="true" size={24} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section id="planos" className="lp-wrap lp-section" aria-labelledby="lp-plans">
          <h2 id="lp-plans">Planos da iorCLASS</h2>
          <p className="lp-section-intro">Valores de referência. Você pode explorar a demo gratuitamente.</p>
          <div className="lp-plans">
            {plans.map(({ name, price, cadence, color, featured }) => (
              <article key={name} className={`lp-plan lp-plan-${color}`}>
                <div className="lp-plan-top">
                  <h3>{name}</h3>
                  {featured && <span className="lp-plan-badge">Melhor preço por mês</span>}
                  <strong>R$ {price},00</strong>
                  <span>{cadence}</span>
                </div>
                <div className="lp-plan-body">
                  <ul>
                    <li><Check size={17} /> Agenda e gestão de alunos</li>
                    <li><Check size={17} /> Financeiro e relatórios</li>
                    <li><Check size={17} /> Atividades e app do aluno</li>
                  </ul>
                  <a className={`lp-button ${featured ? "lp-green" : "lp-outline"}`} href="#cadastro">Ver cadastro demo <ArrowUpRight size={17} /></a>
                </div>
              </article>
            ))}
          </div>
          <p className="lp-plan-note">A demonstração não realiza contratações nem cobranças.</p>
        </section>

        <div className="lp-tinted">
          <section className="lp-wrap lp-section lp-split lp-mobile">
            <div className="lp-phone">
              <img src="/images/landing/aluno.jpg" width="390" height="720" alt="Tela inicial do app do aluno no celular" loading="lazy" />
            </div>
            <div>
              <span className="lp-icon"><Smartphone size={26} /></span>
              <h2>Leve a iorCLASS no celular</h2>
              <p>Abra a demo no navegador do Android ou iPhone. No espaço do aluno, você pode consultar aulas e pagamentos de exemplo, fazer anotações e responder a uma atividade.</p>
              <a className="lp-button lp-purple" href="#aluno">Conhecer o app do aluno <ArrowUpRight size={17} /></a>
            </div>
          </section>
          <section className="lp-wrap lp-founder" aria-labelledby="lp-about">
            <h2 id="lp-about">Quem idealizou a iorCLASS?</h2>
            <article>
              <span className="lp-icon"><Music2 size={27} /></span>
              <h3>Carol Hends</h3>
              <p>Professora autônoma de canto e técnica vocal e bacharela em Música, Carol Hends é a idealizadora da iorCLASS.</p>
            </article>
          </section>
        </div>

        <section id="perguntas" className="lp-wrap lp-section lp-faq">
          <h2>Dúvidas frequentes</h2>
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<ChevronDown size={20} aria-hidden="true" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>

        <section className="lp-blue lp-section lp-closing">
          <div className="lp-wrap">
            <h2>Experimente organizar sua próxima aula</h2>
            <p>Abra a demo e veja como agenda, alunos e finanças funcionam juntos.</p>
            <a className="lp-button lp-green" href="#professor">Testar a demo <ArrowRight size={20} /></a>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <Brand />
          <nav aria-label="Links do rodapé">
            <a href="#recursos">Recursos</a>
            <a href="#planos">Planos</a>
            <a href="#perguntas">Dúvidas frequentes</a>
            <a href="#login">Entrar</a>
            <a href="#aluno">App do aluno</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
