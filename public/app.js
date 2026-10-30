

const aparelhos = [];
const form = document.querySelector('#form-aparelho');
const lista = document.querySelector('#lista-aparelhos');
const saida = document.querySelector('#resultado');
const erroEl = document.querySelector('#erro');
const contador = document.querySelector('#contador');
const listaVazia = document.querySelector('#lista-vazia');

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const n2 = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function desenharLista() {
  lista.replaceChildren();
  aparelhos.forEach((a, indice) => {
    const li = document.createElement('li');
    const texto = document.createElement('span');
    texto.textContent = `${a.nome} · ${a.potenciaW} W · ${a.horasDia} h/dia · ${a.diasMes} dias`;

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = 'Remover';
    remover.addEventListener('click', () => {
      aparelhos.splice(indice, 1);
      desenharLista();
    });

    li.append(texto, remover);
    lista.append(li);
  });

  contador.textContent = aparelhos.length;
  listaVazia.hidden = aparelhos.length > 0;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  aparelhos.push({
    nome: document.querySelector('#nome').value.trim(),
    potenciaW: Number(document.querySelector('#potencia').value),
    horasDia: Number(document.querySelector('#horas').value),
    diasMes: Number(document.querySelector('#dias').value),
  });
  form.reset();
  document.querySelector('#dias').value = 30;
  desenharLista();
  toast(`"${aparelhos[aparelhos.length - 1].nome}" adicionado à lista`, 'success');
});

function celula(tag, texto) {
  const el = document.createElement(tag);
  el.textContent = texto;
  return el;
}

function desenharResultado(r) {
  saida.replaceChildren();

  const destaque = document.createElement('div');
  destaque.className = 'destaque';

  const kpi = document.createElement('div');
  kpi.className = 'kpi';

  const mk = (label, valor) => {
    const d = document.createElement('div');
    const s = document.createElement('small'); s.textContent = label;
    const v = document.createElement('strong'); v.textContent = valor;
    d.append(s, v);
    return d;
  };

  kpi.append(
    mk('Consumo', `${n2(r.consumoKwhMes)} kWh/mês`),
    mk('Conta estimada', brl(r.totalMes)),
    mk('Painéis necessários', String(r.paineisNecessarios))
  );

  destaque.append(
    kpi,
    celula('p', `Energia ${brl(r.custoEnergia)} + bandeira ${brl(r.adicionalBandeira)}`),
    celula('strong', `Aparelho mais caro: ${r.aparelhoMaisCaro.nome} (${brl(r.aparelhoMaisCaro.custo)})`)
  );

  const tabela = document.createElement('table');
  const thead = document.createElement('thead');
  const cab = document.createElement('tr');
  ['Aparelho', 'kWh/mês', 'Custo', '%'].forEach((t) => cab.append(celula('th', t)));
  thead.append(cab);
  tabela.append(thead);

  const tbody = document.createElement('tbody');
  r.detalhes.forEach((d) => {
    const tr = document.createElement('tr');
    tr.append(
      celula('td', d.nome),
      celula('td', n2(d.kwhMes)),
      celula('td', brl(d.custo)),
      celula('td', `${n2(d.percentual)}%`)
    );
    tbody.append(tr);
  });
  tabela.append(tbody);

  saida.append(destaque, tabela);
  saida.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelector('#btn-simular').addEventListener('click', async () => {
  erroEl.hidden = true;
  erroEl.textContent = '';

  if (aparelhos.length === 0) {
    erroEl.textContent = 'Adicione pelo menos um aparelho antes de simular.';
    erroEl.hidden = false;
    toast('Adicione pelo menos um aparelho antes de simular.', 'error');
    return;
  }

  const btn = document.querySelector('#btn-simular');
  btn.disabled = true;
  btn.style.opacity = '.7';

  try {
    const resposta = await fetch('/api/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aparelhos }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      erroEl.textContent = dados.erro;
      erroEl.hidden = false;
      toast(dados.erro, 'error');
      return;
    }
    desenharResultado(dados);
    toast('Simulação concluída!', 'success');
  } catch (e) {
    erroEl.textContent = 'Não foi possível falar com o servidor. Ele está rodando?';
    erroEl.hidden = false;
    toast('Servidor não respondeu. Verifique se o `npm start` está rodando.', 'error');
  } finally {
    btn.disabled = false;
    btn.style.opacity = '';
  }
});


function toast(msg, tipo = '') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast ${tipo}`.trim();
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    setTimeout(() => el.remove(), 320);
  }, 3200);
}

(function initTheme() {
  const saved = localStorage.getItem('coopera-theme');
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('coopera-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('coopera-theme', 'dark');
    }
  });
})();

(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((i) => io.observe(i));
})();


(function initCounters() {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;

  const animate = (el) => {
    const alvo = Number(el.dataset.counter);
    const sufixo = el.dataset.suffix || '';
    const duracao = 1400;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const valor = Math.round(alvo * eased);
      el.textContent = valor.toLocaleString('pt-BR') + sufixo;
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  els.forEach((e) => io.observe(e));
})();

(function initFlags() {
  const dados = {
    verde:     { titulo: 'Bandeira Verde',     desc: 'Condições favoráveis de geração. Sem acréscimo na conta.', valor: 'R$ 0,000' },
    amarela:   { titulo: 'Bandeira Amarela',   desc: 'Condições um pouco menos favoráveis. Pequeno acréscimo por 100 kWh.', valor: 'R$ 1,885' },
    vermelha1: { titulo: 'Bandeira Vermelha 1', desc: 'Condições desfavoráveis. Acréscimo moderado por 100 kWh.', valor: 'R$ 4,463' },
    vermelha2: { titulo: 'Bandeira Vermelha 2', desc: 'Condições críticas de geração. Maior acréscimo por 100 kWh.', valor: 'R$ 7,877' },
  };

  const tabs = document.querySelectorAll('.flag-tab');
  const title = document.getElementById('flag-title');
  const desc = document.getElementById('flag-desc');
  const value = document.getElementById('flag-value');
  const panel = document.getElementById('flag-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const d = dados[tab.dataset.flag];
      title.textContent = d.titulo;
      desc.textContent = d.desc;
      value.textContent = d.valor;

      panel.style.animation = 'none';
      void panel.offsetWidth;
      panel.style.animation = '';
    });
  });
})();

document.getElementById('ano').textContent = new Date().getFullYear();

(function initParallax() {
  const orbs = document.querySelectorAll('.hero .orb');
  if (!orbs.length) return;
  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const y = window.scrollY;
      orbs.forEach((orb, i) => {
        orb.style.transform = `translateY(${y * (0.05 + i * 0.03)}px)`;
      });
      raf = null;
    });
  }, { passive: true });
})();
