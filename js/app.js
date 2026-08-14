(function () {
  'use strict';

  /* ============================ UTIL ============================ */
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = (v) => fmt.format(v || 0);

  const today = () => new Date().toISOString().slice(0, 10);
  const monthOf = (d) => (d || '').slice(0, 7);

  const CATS = {
    income: [
      { id: 'salario', ico: '💼', label: 'Salário',     color: '#00B894' },
      { id: 'freela',   ico: '🧑‍💻', label: 'Freelance',   color: '#0984E3' },
      { id: 'invest',   ico: '📈', label: 'Renda Invest', color: '#6C5CE7' },
      { id: 'venda',    ico: '🛍️', label: 'Vendas',      color: '#E17055' },
      { id: 'outro-in', ico: '🪙', label: 'Outros',      color: '#95A5A6' },
    ],
    expense: [
      { id: 'moradia',    ico: '🏠', label: 'Moradia',    color: '#E17055' },
      { id: 'alimento',   ico: '🍔', label: 'Alimentação', color: '#F39C12' },
      { id: 'transporte', ico: '🚗', label: 'Transporte', color: '#0984E3' },
      { id: 'lazer',      ico: '🎮', label: 'Lazer',      color: '#FD79A8' },
      { id: 'saude',      ico: '💊', label: 'Saúde',      color: '#E84393' },
      { id: 'educacao',   ico: '📚', label: 'Educação',   color: '#6C5CE7' },
      { id: 'compras',    ico: '🛒', label: 'Compras',    color: '#00CEC9' },
      { id: 'contas',     ico: '🧾', label: 'Contas',     color: '#636E72' },
      { id: 'outro-out',  ico: '📦', label: 'Outros',     color: '#95A5A6' },
    ],
  };

  const INV_TYPES = [
    { id: 'cdb',      ico: '🏦', label: 'CDB / Renda Fixa',  color: '#0984E3' },
    { id: 'tesouro',  ico: '🇧🇷', label: 'Tesouro Direto',    color: '#00B894' },
    { id: 'fii',      ico: '🏢', label: 'FIIs',              color: '#6C5CE7' },
    { id: 'acao',     ico: '📊', label: 'Ações',             color: '#E17055' },
    { id: 'cripto',   ico: '🪙', label: 'Cripto',            color: '#F39C12' },
    { id: 'poupanca', ico: '🏧', label: 'Poupança',          color: '#00CEC9' },
  ];
  const invType = (id) => INV_TYPES.find((t) => t.id === id) || INV_TYPES[0];

  const catById = (type, id) => (CATS[type] || []).find((c) => c.id === id);

  /* ============================ ESTADO ============================ */
  const KEY = 'pocketmoney_v1';
  let state = { accounts: [], transactions: [], investments: [] };
  let currentView = 'dashboard';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : seed();
    } catch (e) {
      state = seed();
    }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  /* ---- Dados de demonstração ---- */
  function seed() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    const day = (n) => `${y}-${m}-${String(n).padStart(2, '0')}`;
    const prev = new Date(y, d.getMonth() - 1, 1);
    const pym = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    const a = uid();
    const b = uid();
    const c = uid();

    return {
      accounts: [
        { id: a, name: 'Conta Corrente', bank: 'Nubank',    color: '#820AD1', ico: '💜', balance: 4520.50 },
        { id: b, name: 'Conta Corrente', bank: 'Banco do Brasil', color: '#FDB930', ico: '🏛️', balance: 1230.00 },
        { id: c, name: 'Carteira',       bank: 'Dinheiro',  color: '#00B894', ico: '👛', balance: 380.00 },
      ],
      transactions: [
        { id: uid(), type: 'income',  category: 'salario', description: 'Salário mensal', amount: 4200, date: day(5),  accountId: a },
        { id: uid(), type: 'income',  category: 'freela',  description: 'Projeto site',    amount: 850,  date: day(12), accountId: b },
        { id: uid(), type: 'expense', category: 'moradia', description: 'Aluguel',        amount: 1200, date: day(6),  accountId: a },
        { id: uid(), type: 'expense', category: 'alimento', description: 'Mercado',        amount: 480,  date: day(9),  accountId: a },
        { id: uid(), type: 'expense', category: 'transporte', description: 'Combustível',  amount: 180,  date: day(14), accountId: a },
        { id: uid(), type: 'expense', category: 'lazer',    description: 'Cinema + jantar', amount: 210, date: day(16), accountId: c },
        { id: uid(), type: 'income',  category: 'invest',   description: 'Dividendos FII', amount: 95,  date: day(18), accountId: a },
        { id: uid(), type: 'expense', category: 'saude',    description: 'Farmácia',        amount: 62,  date: day(20), accountId: a },
        { id: uid(), type: 'expense', category: 'contas',   description: 'Luz + Internet',  amount: 320, date: day(8),  accountId: a },
        { id: uid(), type: 'expense', category: 'alimento', description: 'Restaurante',     amount: 95,  date: day(22), accountId: c },
        { id: uid(), type: 'income',  category: 'salario',  description: 'Salário (mês anterior)', amount: 4200, date: `${pym}-05`, accountId: a },
        { id: uid(), type: 'expense', category: 'moradia',  description: 'Aluguel (mês anterior)', amount: 1200, date: `${pym}-06`, accountId: a },
        { id: uid(), type: 'expense', category: 'alimento', description: 'Mercado (mês anterior)', amount: 510, date: `${pym}-12`, accountId: a },
      ],
      investments: [
        { id: uid(), type: 'cdb',     name: 'CDB 110% CDI',  invested: 5000, current: 5172.40 },
        { id: uid(), type: 'tesouro', name: 'Tesouro Selic', invested: 3000, current: 3075.10 },
        { id: uid(), type: 'fii',     name: 'HGLG11',        invested: 2000, current: 2290.00 },
        { id: uid(), type: 'acao',    name: 'PETR4',         invested: 1500, current: 1420.00 },
        { id: uid(), type: 'cripto',  name: 'Bitcoin',       invested: 1000, current: 1180.50 },
      ],
    };
  }

  /* ============================ CÁLCULOS ============================ */
  const totalBalance = () => state.accounts.reduce((s, a) => s + a.balance, 0);
  const monthTx = (month) => state.transactions.filter((t) => monthOf(t.date) === month);
  const sum = (arr, type) => arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const totalInv = () => state.investments.reduce((s, i) => s + i.current, 0);
  const totalInvested = () => state.investments.reduce((s, i) => s + i.invested, 0);

  /* ============================ RENDERIZAÇÃO ============================ */
  const content = $('#content');
  const modal = $('#modal');
  const modalBody = $('#modalBody');

  function go(view) {
    currentView = view;
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const map = {
      dashboard: renderDashboard,
      transactions: renderTransactions,
      invest: renderInvest,
      accounts: renderAccounts,
      settings: renderSettings,
    };
    content.innerHTML = `<section class="view">${map[currentView]()}</section>`;
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const now = new Date();
    const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const txs = monthTx(cm);
    const income = sum(txs, 'income');
    const expense = sum(txs, 'expense');

    const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const expCats = {};
    txs.filter((t) => t.type === 'expense').forEach((t) => {
      const c = catById('expense', t.category);
      const k = c ? c.label : 'Outros';
      expCats[k] = (expCats[k] || 0) + t.amount;
    });
    const sortedCats = Object.entries(expCats).sort((a, b) => b[1] - a[1]).slice(0, 4);

    const accIco = (id) => {
      const a = state.accounts.find((x) => x.id === id);
      return a ? a.ico : '🏦';
    };

    return `
      <div class="hero">
        <small>Saldo total em todas as contas</small>
        <div class="total">${money(totalBalance())}</div>
        <div class="meta">
          <div><small>Entradas (mês)</small><b class="in">+ ${money(income)}</b></div>
          <div><small>Saídas (mês)</small><b class="out">- ${money(expense)}</b></div>
        </div>
      </div>

      <div class="chips">
        <button class="chip income" data-action="add-tx-income"><span class="ci">⬇️</span><span class="cl">Entrada</span></button>
        <button class="chip expense" data-action="add-tx-expense"><span class="ci">⬆️</span><span class="cl">Saída</span></button>
        <button class="chip invest" data-action="add-invest"><span class="ci">📈</span><span class="cl">Investir</span></button>
        <button class="chip accounts" data-action="add-account"><span class="ci">🏦</span><span class="cl">Nova conta</span></button>
      </div>

      <div class="card">
        <div class="section-title"><span class="em">📊 Gastos do mês</span></div>
        ${sortedCats.length ? sortedCats.map(([label, val], i) => {
          const pct = expense ? Math.round((val / expense) * 100) : 0;
          const colors = ['#E17055', '#F39C12', '#0984E3', '#6C5CE7'];
          return `<div class="bar-row">
            <span class="lbl">${label}</span>
            <span class="bar-track"><span class="bar-fill" style="width:${pct}%;background:${colors[i % 4]}"></span></span>
            <span class="bar-pct">${pct}%</span>
          </div>`;
        }).join('') : `<div class="empty"><span class="ei">🎉</span><p>Nenhum gasto este mês!</p></div>`}
      </div>

      <div class="card">
        <div class="section-title"><span class="em">🕘 Recentes</span><a href="#" data-nav="transactions">Ver todas</a></div>
        ${recent.length ? recent.map(txItemHTML).join('') : `<div class="empty"><span class="ei">📭</span><p>Sem transações ainda.</p></div>`}
      </div>
    `;

    function txItemHTML(t) {
      const c = catById(t.type, t.category) || {};
      const sign = t.type === 'income' ? '+' : '-';
      return `<div class="tx-item" data-tx="${t.id}">
        <span class="tx-ico" style="background:${c.color || '#95A5A6'}">${c.ico || '💸'}</span>
        <span class="tx-main">
          <span class="tx-title">${esc(t.description) || '—'}</span>
          <span class="tx-sub">${c.label || ''} · ${accIco(t.accountId)} ${fmtDate(t.date)}</span>
        </span>
        <span class="tx-amount ${t.type}">${sign} ${money(t.amount)}</span>
      </div>`;
    }
  }

  /* ---------- Transações ---------- */
  let txFilter = 'all';
  function renderTransactions() {
    const list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date));
    const filtered = list.filter((t) => txFilter === 'all' || t.type === txFilter);
    const accIco = (id) => {
      const a = state.accounts.find((x) => x.id === id);
      return a ? a.ico : '🏦';
    };
    const total = filtered.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

    const row = (t) => {
      const c = catById(t.type, t.category) || {};
      const sign = t.type === 'income' ? '+' : '-';
      return `<div class="tx-item" data-tx="${t.id}">
        <span class="tx-ico" style="background:${c.color || '#95A5A6'}">${c.ico || '💸'}</span>
        <span class="tx-main">
          <span class="tx-title">${esc(t.description) || '—'}</span>
          <span class="tx-sub">${c.label || ''} · ${accIco(t.accountId)} ${fmtDate(t.date)}</span>
        </span>
        <span class="tx-amount ${t.type}">${sign} ${money(t.amount)}</span>
      </div>`;
    };

    return `
      <div class="card">
        <div class="section-title"><span class="em">💰 Transações</span><b style="color:${total >= 0 ? 'var(--green)' : 'var(--red)'}">${money(total)}</b></div>
        <div class="filters">
          <button class="fbtn ${txFilter === 'all' ? 'active' : ''}" data-filter="all">Todas</button>
          <button class="fbtn ${txFilter === 'income' ? 'active' : ''}" data-filter="income">Entradas</button>
          <button class="fbtn ${txFilter === 'expense' ? 'active' : ''}" data-filter="expense">Saídas</button>
        </div>
        ${filtered.length ? filtered.map(row).join('') : `<div class="empty"><span class="ei">📭</span><p>Nenhuma transação aqui.</p></div>`}
      </div>
      <button class="btn" data-action="add-tx-expense">+ Nova transação</button>
    `;
  }

  /* ---------- Investimentos ---------- */
  let invFilter = 'all';
  function renderInvest() {
    const total = totalInv();
    const gain = total - totalInvested();
    const list = state.investments;
    const filtered = list.filter((i) => invFilter === 'all' || i.type === invFilter);

    const row = (i) => {
      const t = invType(i.type);
      const diff = i.current - i.invested;
      const pct = i.invested ? (diff / i.invested) * 100 : 0;
      return `<div class="inv-item" data-inv="${i.id}">
        <span class="inv-ico" style="background:${t.color}">${t.ico}</span>
        <span class="inv-main">
          <span class="inv-name">${esc(i.name)}</span>
          <span class="inv-sub">${t.label}</span>
        </span>
        <span class="inv-amt">
          <b>${money(i.current)}</b>
          <span style="color:${diff >= 0 ? 'var(--green)' : 'var(--red)'}">${diff >= 0 ? '▲' : '▼'} ${pct.toFixed(1)}%</span>
        </span>
      </div>`;
    };

    return `
      <div class="hero">
        <small>Carteira de investimentos</small>
        <div class="total">${money(total)}</div>
        <div class="meta">
          <div><small>Investido</small><b>${money(totalInvested())}</b></div>
          <div><small>Resultado</small><b style="color:${gain >= 0 ? '#D3FFEF' : '#FFE3DA'}">${gain >= 0 ? '+' : ''}${money(gain)}</b></div>
        </div>
      </div>

      <div class="chips">
        <button class="chip invest" data-action="add-invest"><span class="ci">➕</span><span class="cl">Novo ativo</span></button>
        <button class="chip accounts" data-action="invest-hint"><span class="ci">💡</span><span class="cl">Dica</span></button>
      </div>

      <div class="card">
        <div class="section-title"><span class="em">📈 Meus ativos</span></div>
        <div class="filters">
          <button class="fbtn ${invFilter === 'all' ? 'active' : ''}" data-invfilter="all">Todos</button>
          ${INV_TYPES.map((t) => `<button class="fbtn ${invFilter === t.id ? 'active' : ''}" data-invfilter="${t.id}">${t.ico}</button>`).join('')}
        </div>
        ${filtered.length ? filtered.map(row).join('') : `<div class="empty"><span class="ei">🌱</span><p>Nenhum investimento aqui.</p></div>`}
      </div>
    `;
  }

  /* ---------- Contas ---------- */
  function renderAccounts() {
    const rows = state.accounts.map((a) => `
      <div class="acc-item" data-acc="${a.id}">
        <span class="acc-ico" style="background:${a.color}">${a.ico}</span>
        <span class="acc-main">
          <span class="acc-name">${esc(a.name)}</span>
          <span class="acc-bank">${esc(a.bank)}</span>
        </span>
        <span class="acc-bal ${a.balance < 0 ? 'neg' : ''}">${money(a.balance)}</span>
      </div>`).join('');

    return `
      <div class="hero">
        <small>Dinheiro disponível</small>
        <div class="total">${money(totalBalance())}</div>
        <div class="meta"><div><small>Contas</small><b>${state.accounts.length}</b></div></div>
      </div>
      <div class="card">
        <div class="section-title"><span class="em">🏦 Minhas contas</span></div>
        ${state.accounts.length ? rows : `<div class="empty"><span class="ei">🏦</span><p>Nenhuma conta cadastrada.</p></div>`}
        <div class="legend">
          ${state.accounts.map((a) => `<span style="font-size:.72rem;color:var(--muted)"><span class="dot" style="background:${a.color}"></span>${esc(a.bank)}</span>`).join('')}
        </div>
      </div>
      <button class="btn" data-action="add-account">+ Nova conta</button>
    `;
  }

  /* ---------- Ajustes ---------- */
  function renderSettings() {
    const nTx = state.transactions.length;
    return `
      <div class="card">
        <div class="section-title"><span class="em">🪙 Pocket Money</span></div>
        <p style="font-size:.85rem;color:var(--muted);line-height:1.5">
          Seu app de vida financeira em um só lugar: contas, entradas, saídas e investimentos.
          Tudo guardado <b>no seu celular</b> — sem servidores, sem senhas de banco.
        </p>
        <div class="legend" style="margin-top:14px">
          <span style="font-size:.74rem;color:var(--muted)">📁 Dados locais: ${nTx} transações, ${state.accounts.length} contas, ${state.investments.length} investimentos</span>
        </div>
      </div>

      <div class="card">
        <div class="section-title"><span class="em">💾 Backup</span></div>
        <div class="actions">
          <button class="btn ghost" data-action="export">📤 Exportar</button>
          <button class="btn ghost" data-action="import">📥 Importar</button>
        </div>
        <input type="file" id="fileImport" accept="application/json" class="hidden">
      </div>

      <div class="card">
        <div class="section-title"><span class="em">🧹 Zona de risco</span></div>
        <div class="actions">
          <button class="btn ghost" data-action="demo">🎲 Recarregar demo</button>
          <button class="btn danger" data-action="wipe">🗑️ Apagar tudo</button>
        </div>
      </div>

      <div class="card" style="text-align:center">
        <p style="font-size:.74rem;color:var(--muted)">Feito com 💜 · Pocket Money v1.0</p>
      </div>
    `;
  }

  /* ============================ HELPERS HTML ============================ */
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmtDate(d) {
    if (!d) return '';
    const [y, m, dd] = d.split('-');
    return `${dd}/${m}/${y}`;
  }

  /* ============================ MODAIS ============================ */
  function openModal(html) {
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    render();
  }

  /* --- Nova transação --- */
  function formTx(type) {
    const cats = CATS[type];
    return `
      <h2>${type === 'income' ? '⬇️ Nova entrada' : '⬆️ Nova saída'}</h2>
      <div class="seg">
        <button class="${type === 'income' ? 'active' : ''}" data-seg="income">Entrada</button>
        <button class="${type === 'expense' ? 'active' : ''}" data-seg="expense">Saída</button>
      </div>
      <label class="f"><span>Valor</span><input type="number" id="txAmount" step="0.01" min="0" placeholder="0,00" inputmode="decimal"></label>
      <label class="f"><span>Categoria</span></label>
      <div class="cat-grid">
        ${cats.map((c) => `<button class="cat ${c.id === 'outro-in' || c.id === 'contas' ? '' : ''}" data-cat="${c.id}"><span class="ci">${c.ico}</span><span class="cl">${c.label}</span></button>`).join('')}
      </div>
      <label class="f"><span>Descrição</span><input type="text" id="txDesc" placeholder="Ex.: Aluguel, mercado..."></label>
      <label class="f"><span>Data</span><input type="date" id="txDate" value="${today()}"></label>
      <label class="f"><span>Conta</span><select id="txAccount">${state.accounts.map((a) => `<option value="${a.id}">${a.ico} ${esc(a.name)} (${esc(a.bank)})</option>`).join('')}</select></label>
      <button class="btn" id="saveTx" data-type="${type}">Salvar</button>
    `;
  }

  /* --- Nova conta --- */
  function formAccount() {
    const banks = [
      { ico: '💜', label: 'Nubank', color: '#820AD1' },
      { ico: '🏛️', label: 'Banco do Brasil', color: '#FDB930' },
      { ico: '🔵', label: 'Itaú', color: '#EC7000' },
      { ico: '🟥', label: 'Bradesco', color: '#CC092F' },
      { ico: '🟨', label: 'Caixa', color: '#1B6FB4' },
      { ico: '🟢', label: 'Banco Inter', color: '#FF7A00' },
      { ico: '👛', label: 'Carteira / Dinheiro', color: '#00B894' },
      { ico: '🟣', label: 'PicPay', color: '#21C25E' },
    ];
    return `
      <h2>🏦 Nova conta</h2>
      <label class="f"><span>Nome da conta</span><input type="text" id="accName" placeholder="Ex.: Conta Corrente"></label>
      <label class="f"><span>Instituição</span><select id="accBank">${banks.map((b, i) => `<option value="${i}" ${i === 0 ? 'selected' : ''}>${b.ico} ${b.label}</option>`).join('')}</select></label>
      <label class="f"><span>Saldo atual</span><input type="number" id="accBalance" step="0.01" placeholder="0,00" inputmode="decimal"></label>
      <button class="btn" id="saveAcc">Salvar</button>
    `;
  }

  /* --- Novo investimento --- */
  function formInvest() {
    return `
      <h2>📈 Novo investimento</h2>
      <label class="f"><span>Tipo</span><select id="invType">${INV_TYPES.map((t) => `<option value="${t.id}">${t.ico} ${t.label}</option>`).join('')}</select></label>
      <label class="f"><span>Nome</span><input type="text" id="invName" placeholder="Ex.: CDB 110% CDI"></label>
      <label class="f"><span>Valor investido (R$)</span><input type="number" id="invInvested" step="0.01" min="0" placeholder="0,00" inputmode="decimal"></label>
      <label class="f"><span>Valor atual (R$)</span><input type="number" id="invCurrent" step="0.01" min="0" placeholder="0,00" inputmode="decimal"></label>
      <button class="btn" id="saveInv">Salvar</button>
    `;
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.add('hidden'), 2200);
  }

  /* ============================ EVENTOS ============================ */
  function bind() {
    $('#tabbar').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (tab) go(tab.dataset.view);
    });

    content.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav) { e.preventDefault(); go(nav.dataset.nav); return; }

      const filter = e.target.closest('[data-filter]');
      if (filter) { txFilter = filter.dataset.filter; render(); return; }

      const invfilter = e.target.closest('[data-invfilter]');
      if (invfilter) { invFilter = invfilter.dataset.invfilter; render(); return; }

      const action = e.target.closest('[data-action]');
      if (action) { handleAction(action.dataset.action); return; }

      const tx = e.target.closest('[data-tx]');
      if (tx) { editTx(tx.dataset.tx); return; }

      const inv = e.target.closest('[data-inv]');
      if (inv) { editInv(inv.dataset.inv); return; }

      const acc = e.target.closest('[data-acc]');
      if (acc) { editAcc(acc.dataset.acc); return; }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    $('#modalClose').addEventListener('click', closeModal);

    modalBody.addEventListener('click', (e) => {
      const seg = e.target.closest('[data-seg]');
      if (seg) {
        const t = seg.dataset.seg;
        $('#modalBody').innerHTML = formTx(t);
        bindFormTx();
        return;
      }
      if (e.target.id === 'saveTx') saveTx();
      if (e.target.id === 'saveAcc') saveAcc();
      if (e.target.id === 'saveInv') saveInv();
      if (e.target.id === 'confirmWipe') { wipeAll(); closeModal(); }
      if (e.target.id === 'confirmDemo') { demo(); closeModal(); }
      if (e.target.id === 'confirmDelete') {
        const { deleteKind, id } = e.target.dataset;
        deleteItem(deleteKind, id);
        closeModal();
      }
    });

    $('#fileImport').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.transactions || !data.accounts) throw new Error('invalid');
          state = data;
          save();
          toast('✅ Dados importados');
          render();
        } catch (err) {
          toast('⚠️ Arquivo inválido');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  function bindFormTx() {
    // selecionar primeira categoria
    const cats = $$('#modalBody .cat');
    if (cats.length) cats[0].classList.add('selected');
  }

  function handleAction(a) {
    switch (a) {
      case 'add-tx-income': openModal(formTx('income')); bindFormTx(); break;
      case 'add-tx-expense': openModal(formTx('expense')); bindFormTx(); break;
      case 'add-account': openModal(formAccount()); break;
      case 'add-invest': openModal(formInvest()); break;
      case 'invest-hint':
        toast('💡 Diversifique: renda fixa + ações + FIIs');
        break;
      case 'export': exportData(); break;
      case 'import': $('#fileImport').click(); break;
      case 'demo':
        openModal(`<h2>🎲 Recarregar demo?</h2>
          <p style="font-size:.9rem;color:var(--muted);margin-bottom:18px">Isso substitui seus dados atuais pelos dados de exemplo.</p>
          <div class="actions"><button class="btn ghost" id="modalClose2">Cancelar</button><button class="btn" id="confirmDemo">Sim, recarregar</button></div>`);
        $('#modalClose2').addEventListener('click', closeModal);
        break;
      case 'wipe':
        openModal(`<h2>🗑️ Apagar tudo?</h2>
          <p style="font-size:.9rem;color:var(--muted);margin-bottom:18px">Todas as contas, transações e investimentos serão removidos. Essa ação não pode ser desfeita.</p>
          <div class="actions"><button class="btn ghost" id="modalClose3">Cancelar</button><button class="btn danger" id="confirmWipe">Apagar tudo</button></div>`);
        $('#modalClose3').addEventListener('click', closeModal);
        break;
    }
  }

  /* ---- Salvar transação ---- */
  function saveTx() {
    const type = $('#saveTx').dataset.type;
    const amount = parseFloat($('#txAmount').value);
    const desc = $('#txDesc').value.trim();
    const date = $('#txDate').value || today();
    const accountId = $('#txAccount').value;
    const catEl = $('#modalBody .cat.selected');
    const category = catEl ? catEl.dataset.cat : CATS[type][0].id;
    const editingId = $('#saveTx').dataset.editing;

    if (!amount || amount <= 0) { toast('⚠️ Informe um valor'); return; }
    if (!accountId) { toast('⚠️ Escolha uma conta'); return; }

    if (editingId) {
      const t = state.transactions.find((x) => x.id === editingId);
      if (t) Object.assign(t, { type, amount, description: desc, date, accountId, category });
      toast('✅ Transação atualizada');
    } else {
      state.transactions.push({ id: uid(), type, amount, description: desc, date, accountId, category });
      toast('✅ Transação salva');
    }
    save();
    closeModal();
  }

  function editTx(id) {
    const t = state.transactions.find((x) => x.id === id);
    if (!t) return;
    openModal(`
      <h2>✏️ Editar transação</h2>
      <p style="font-size:.9rem;color:var(--muted);margin-bottom:16px">${esc(t.description) || 'Transação'} · ${money(t.amount)}</p>
      <div class="actions">
        <button class="btn ghost" data-delete-kind="transactions" id="confirmDelete" data-id="${id}">🗑️ Excluir</button>
        <button class="btn" id="closeEdit">Fechar</button>
      </div>`);
    $('#closeEdit').addEventListener('click', closeModal);
  }

  function saveAcc() {
    const name = $('#accName').value.trim();
    const bankIdx = parseInt($('#accBank').value, 10);
    const balance = parseFloat($('#accBalance').value) || 0;
    const bank = banks()[bankIdx];
    if (!name) { toast('⚠️ Informe o nome'); return; }
    state.accounts.push({ id: uid(), name, bank: bank.label, color: bank.color, ico: bank.ico, balance });
    save();
    toast('✅ Conta criada');
    closeModal();
  }

  function banks() {
    return [
      { ico: '💜', label: 'Nubank', color: '#820AD1' },
      { ico: '🏛️', label: 'Banco do Brasil', color: '#FDB930' },
      { ico: '🔵', label: 'Itaú', color: '#EC7000' },
      { ico: '🟥', label: 'Bradesco', color: '#CC092F' },
      { ico: '🟨', label: 'Caixa', color: '#1B6FB4' },
      { ico: '🟢', label: 'Banco Inter', color: '#FF7A00' },
      { ico: '👛', label: 'Carteira / Dinheiro', color: '#00B894' },
      { ico: '🟣', label: 'PicPay', color: '#21C25E' },
    ];
  }

  function editAcc(id) {
    const a = state.accounts.find((x) => x.id === id);
    if (!a) return;
    openModal(`
      <h2>✏️ ${a.ico} ${esc(a.name)}</h2>
      <p style="font-size:.9rem;color:var(--muted);margin-bottom:16px">${esc(a.bank)} · Saldo ${money(a.balance)}</p>
      <div class="actions">
        <button class="btn ghost" data-delete-kind="accounts" id="confirmDelete" data-id="${id}">🗑️ Excluir</button>
        <button class="btn" id="closeEdit2">Fechar</button>
      </div>`);
    $('#closeEdit2').addEventListener('click', closeModal);
  }

  function saveInv() {
    const type = $('#invType').value;
    const name = $('#invName').value.trim();
    const invested = parseFloat($('#invInvested').value);
    const current = parseFloat($('#invCurrent').value);
    const editingId = $('#saveInv').dataset.editing;

    if (!name) { toast('⚠️ Informe o nome'); return; }
    if (isNaN(invested) || invested < 0) { toast('⚠️ Valor investido inválido'); return; }

    const currentVal = isNaN(current) ? invested : current;
    if (editingId) {
      const i = state.investments.find((x) => x.id === editingId);
      if (i) Object.assign(i, { type, name, invested, current: currentVal });
      toast('✅ Investimento atualizado');
    } else {
      state.investments.push({ id: uid(), type, name, invested, current: currentVal });
      toast('✅ Investimento salvo');
    }
    save();
    closeModal();
  }

  function editInv(id) {
    const i = state.investments.find((x) => x.id === id);
    if (!i) return;
    const t = invType(i.type);
    openModal(`
      <h2>✏️ ${t.ico} ${esc(i.name)}</h2>
      <p style="font-size:.9rem;color:var(--muted);margin-bottom:16px">${t.label} · ${money(i.current)}</p>
      <div class="actions">
        <button class="btn ghost" data-delete-kind="investments" id="confirmDelete" data-id="${id}">🗑️ Excluir</button>
        <button class="btn" id="closeEdit3">Fechar</button>
      </div>`);
    $('#closeEdit3').addEventListener('click', closeModal);
  }

  function deleteItem(kind, id) {
    state[kind] = state[kind].filter((x) => x.id !== id);
    save();
    toast('🗑️ Excluído');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocket-money-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('✅ Backup exportado');
  }

  function demo() {
    state = seed();
    save();
    toast('🎲 Dados de exemplo carregados');
    render();
  }

  function wipeAll() {
    state = { accounts: [], transactions: [], investments: [] };
    save();
    toast('🗑️ Tudo apagado');
    render();
  }

  /* ============================ PWA INSTALL ============================ */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $('#btnInstall').classList.remove('hidden');
  });
  $('#btnInstall').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $('#btnInstall').classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => {
    $('#btnInstall').classList.add('hidden');
    toast('🎉 App instalado!');
  });

  /* ============================ INICIO ============================ */
  load();
  bind();
  render();
})();