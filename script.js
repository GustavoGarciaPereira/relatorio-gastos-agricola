let gastos = JSON.parse(localStorage.getItem('gastos') || '[]');

document.getElementById('inp-data').value = new Date().toISOString().split('T')[0];
document.getElementById('today-date').textContent = new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});

const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function save() { localStorage.setItem('gastos', JSON.stringify(gastos)); }
function parseBRL(str) { return parseFloat(str.replace(/\./g,'').replace(',','.')) || 0; }
function formatBRL(n) { return n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'}); }

function addItem() {
  const data = document.getElementById('inp-data').value;
  const hist = document.getElementById('inp-hist').value.trim();
  const valor = parseBRL(document.getElementById('inp-valor').value);
  if (!data || !hist || !valor) { alert('Preencha todos os campos!'); return; }
  gastos.push({ id: Date.now(), data, hist, valor });
  gastos.sort((a,b) => a.data.localeCompare(b.data));
  save();
  document.getElementById('inp-hist').value = '';
  document.getElementById('inp-valor').value = '';
  document.getElementById('inp-hist').focus();
  populateYears(); populateMonths(); render();
}

function removeItem(id) {
  if (!confirm('Remover este lançamento?')) return;
  gastos = gastos.filter(g => g.id !== id);
  save(); populateYears(); populateMonths(); render();
}

function getFiltered() {
  const month = document.getElementById('filter-month').value;
  const year = document.getElementById('filter-year').value;
  return gastos.filter(g => {
    const [y, m] = g.data.split('-');
    if (year && y !== year) return false;
    if (month && m !== month) return false;
    return true;
  });
}

function getPeriodoLabel() {
  const month = document.getElementById('filter-month').value;
  const year = document.getElementById('filter-year').value;
  if (month && year) return `${MESES[+month]} de ${year}`;
  if (year) return `Ano de ${year}`;
  if (month) return MESES[+month];
  return 'Todos os registros';
}

function populateYears() {
  const years = [...new Set(gastos.map(g => g.data.split('-')[0]))].sort().reverse();
  const sel = document.getElementById('filter-year');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todos os anos</option>';
  years.forEach(y => sel.innerHTML += `<option value="${y}" ${y===cur?'selected':''}>${y}</option>`);
}

function populateMonths() {
  const year = document.getElementById('filter-year').value;
  const months = [...new Set(gastos.filter(g => !year || g.data.startsWith(year)).map(g => g.data.split('-')[1]))].sort();
  const sel = document.getElementById('filter-month');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todos os meses</option>';
  months.forEach(m => sel.innerHTML += `<option value="${m}" ${m===cur?'selected':''}>${MESES[+m]}</option>`);
}

function clearFilters() {
  document.getElementById('filter-month').value = '';
  document.getElementById('filter-year').value = '';
  populateMonths(); render();
}

function render() {
  const filtered = getFiltered();
  const tbody = document.getElementById('tbody');
  const tfoot = document.getElementById('tfoot');
  const total = filtered.reduce((s,g) => s+g.valor, 0);
  const avg = filtered.length ? total/filtered.length : 0;

  document.getElementById('stat-total').textContent = formatBRL(total);
  document.getElementById('stat-count').textContent = filtered.length;
  document.getElementById('stat-avg').textContent = formatBRL(avg);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty"><span>📋</span>Nenhum lançamento encontrado</td></tr>`;
    tfoot.innerHTML = ''; return;
  }

  tbody.innerHTML = filtered.map(g => `
    <tr>
      <td class="td-date">${g.data.split('-').reverse().join('/')}</td>
      <td>${g.hist}</td>
      <td class="td-valor">${formatBRL(g.valor)}</td>
      <td class="td-actions"><button class="btn btn-danger" onclick="removeItem(${g.id})">✕</button></td>
    </tr>`).join('');

  tfoot.innerHTML = `
    <tr class="total-row">
      <td colspan="2" style="font-family:'DM Mono',monospace;font-size:0.78rem;letter-spacing:1px;">TOTAL (${filtered.length} lançamentos)</td>
      <td class="td-valor">${formatBRL(total)}</td>
      <td></td>
    </tr>`;
}

// ── PREVIEW MODAL ──
function openPreview() {
  const filtered = getFiltered();
  const total = filtered.reduce((s,g) => s+g.valor, 0);
  const avg = filtered.length ? total/filtered.length : 0;
  const periodo = getPeriodoLabel();
  const geradoEm = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'});

  document.getElementById('modal-periodo-label').textContent = `Período: ${periodo}`;

  const rows = filtered.map(g => `
    <tr>
      <td>${g.data.split('-').reverse().join('/')}</td>
      <td>${g.hist}</td>
      <td>${formatBRL(g.valor)}</td>
    </tr>`).join('');

  document.getElementById('preview-content').innerHTML = `
    <div class="doc-title">Relatório de Gastos</div>
    <div class="doc-sub">Período: ${periodo} &nbsp;·&nbsp; Gerado em: ${geradoEm}</div>
    <div class="doc-stats">
      <div class="doc-stat"><div class="doc-stat-label">Total do período</div><div class="doc-stat-value">${formatBRL(total)}</div></div>
      <div class="doc-stat"><div class="doc-stat-label">Lançamentos</div><div class="doc-stat-value">${filtered.length}</div></div>
      <div class="doc-stat"><div class="doc-stat-label">Média por lançamento</div><div class="doc-stat-value">${formatBRL(avg)}</div></div>
    </div>
    <table>
      <thead><tr><th>Data</th><th>Histórico / Descrição</th><th>Valor</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:20px">Nenhum lançamento</td></tr>'}</tbody>
      <tfoot><tr class="total-tr"><td colspan="2">TOTAL (${filtered.length} lançamentos)</td><td>${formatBRL(total)}</td></tr></tfoot>
    </table>
    <div class="footer">Documento gerado em ${geradoEm}</div>`;

  document.getElementById('modal-overlay').classList.add('open');
}

function closePreview() {
  document.getElementById('modal-overlay').classList.remove('open');
}

document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closePreview();
});

// ── EXPORT PDF ──
function exportPDF() {
  const filtered = getFiltered();
  const total = filtered.reduce((s,g) => s+g.valor, 0);
  const avg = filtered.length ? total/filtered.length : 0;
  const periodo = getPeriodoLabel();
  const geradoEm = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'});

  const rows = filtered.map(g => `
    <tr>
      <td style="padding:8px 10px;border:1px solid #e5e5e5;">${g.data.split('-').reverse().join('/')}</td>
      <td style="padding:8px 10px;border:1px solid #e5e5e5;">${g.hist}</td>
      <td style="padding:8px 10px;border:1px solid #e5e5e5;text-align:right;font-weight:600;">${formatBRL(g.valor)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{font-family:Arial,sans-serif;padding:40px;color:#111;font-size:13px;}
    h1{font-size:20px;text-align:center;margin-bottom:4px;}
    .sub{text-align:center;color:#666;font-size:12px;margin-bottom:24px;}
    .stats{display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-bottom:20px;}
    .stat{flex:1;padding:12px 16px;border-right:1px solid #ddd;}
    .stat:last-child{border-right:none;}
    .sl{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
    .sv{font-size:15px;font-weight:bold;}
    table{width:100%;border-collapse:collapse;}
    th{background:#f0f0f0;padding:10px;text-align:left;font-size:11px;text-transform:uppercase;border:1px solid #ddd;}
    th:last-child{text-align:right;}
    .tot td{background:#f0f0f0;font-weight:bold;padding:10px;border:1px solid #ddd;border-top:2px solid #999;}
    .tot td:last-child{text-align:right;}
    .foot{margin-top:20px;font-size:11px;color:#aaa;text-align:right;}
  <\/style><\/head><body>
  <h1>Relatório de Gastos<\/h1>
  <div class="sub">Período: ${periodo} &nbsp;·&nbsp; Gerado em: ${geradoEm}<\/div>
  <div class="stats">
    <div class="stat"><div class="sl">Total<\/div><div class="sv">${formatBRL(total)}<\/div><\/div>
    <div class="stat"><div class="sl">Lançamentos<\/div><div class="sv">${filtered.length}<\/div><\/div>
    <div class="stat"><div class="sl">Média<\/div><div class="sv">${formatBRL(avg)}<\/div><\/div>
  <\/div>
  <table>
    <thead><tr><th>Data<\/th><th>Histórico \/ Descrição<\/th><th style="text-align:right">Valor<\/th><\/tr><\/thead>
    <tbody>${rows}<\/tbody>
    <tfoot><tr class="tot"><td colspan="2">TOTAL (${filtered.length} lançamentos)<\/td><td style="text-align:right">${formatBRL(total)}<\/td><\/tr><\/tfoot>
  <\/table>
  <div class="foot">Gerado em ${geradoEm}<\/div>
  <\/body><\/html>`;

  const w = window.open('', '_blank');
  if (!w) { alert('Pop-up bloqueado! Permita pop-ups para este site e tente novamente.'); return; }
  w.document.write(html);
  w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

// ── EXPORT WORD ──
async function exportWord() {
  if (typeof docx === 'undefined') { alert('Biblioteca de exportação não carregou. Verifique sua conexão e recarregue a página.'); return; }
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType } = docx;

  const filtered = getFiltered();
  const total = filtered.reduce((s,g) => s+g.valor, 0);
  const avg = filtered.length ? total/filtered.length : 0;
  const periodo = getPeriodoLabel();
  const geradoEm = new Date().toLocaleDateString('pt-BR');

  const cell = (text, opts={}) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: opts.bold||false, size: opts.size||19, color: opts.color||'000000' })],
      alignment: opts.align || AlignmentType.LEFT
    })],
    shading: opts.bg ? { fill: opts.bg } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 }
  });

  const headerRow = new TableRow({
    children: [
      cell('Data', { bold:true, bg:'EEEEEE', size:20 }),
      cell('Histórico / Descrição', { bold:true, bg:'EEEEEE', size:20 }),
      cell('Valor', { bold:true, bg:'EEEEEE', size:20, align: AlignmentType.RIGHT }),
    ]
  });

  const dataRows = filtered.map(g => new TableRow({
    children: [
      cell(g.data.split('-').reverse().join('/')),
      cell(g.hist),
      cell(formatBRL(g.valor), { align: AlignmentType.RIGHT }),
    ]
  }));

  const totalRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 2,
        children: [new Paragraph({ children: [new TextRun({ text: `TOTAL (${filtered.length} lançamentos)`, bold:true, size:20 })] })],
        shading: { fill: 'EEEEEE' },
        margins: { top:70, bottom:70, left:110, right:110 }
      }),
      cell(formatBRL(total), { bold:true, bg:'EEEEEE', size:20, align: AlignmentType.RIGHT }),
    ]
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Relatório de Gastos', bold:true, size:40 })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
        new Paragraph({ children: [new TextRun({ text: `Período: ${periodo}   ·   Gerado em: ${geradoEm}`, size:20, color:'666666' })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
        new Paragraph({ children: [new TextRun({ text: `Total do período: ${formatBRL(total)}`, bold:true, size:24 })], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: `Lançamentos: ${filtered.length}   ·   Média: ${formatBRL(avg)}`, size:21, color:'444444' })], spacing: { after: 320 } }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows, totalRow] }),
        new Paragraph({ children: [new TextRun({ text: `Documento gerado em ${geradoEm}`, size:18, color:'AAAAAA' })], alignment: AlignmentType.RIGHT, spacing: { before: 400 } }),
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-gastos-${periodo.replace(/\s/g,'-').replace(/\//g,'-')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

// Máscara valor
document.getElementById('inp-valor').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'');
  if (!v) { this.value=''; return; }
  v = (parseInt(v)/100).toFixed(2);
  this.value = parseFloat(v).toLocaleString('pt-BR',{minimumFractionDigits:2});
});

document.getElementById('inp-hist').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('inp-valor').focus(); });
document.getElementById('inp-valor').addEventListener('keydown', e => { if(e.key==='Enter') addItem(); });

populateYears(); populateMonths(); render();
