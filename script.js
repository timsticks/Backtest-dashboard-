
const tradeForm = document.getElementById('tradeForm');
const tradeTable = document.querySelector('#tradeTable tbody');
const summary = document.getElementById('summary');
const chartsCanvas = document.getElementById('charts').getContext('2d');

let trades = JSON.parse(localStorage.getItem('trades') || '[]');

function updateTable() {
  tradeTable.innerHTML = '';
  trades.forEach(t => {
    const rr = Math.abs((t.tp - t.entry) / (t.entry - t.sl)).toFixed(2);
    const slSize = Math.abs(t.entry - t.sl).toFixed(2);
    tradeTable.innerHTML += `<tr>
      <td>${t.date}</td><td>${t.pair}</td><td>${t.result}</td><td>${rr}</td><td>${slSize}</td>
    </tr>`;
  });
}

function updateSummary() {
  const wins = trades.filter(t => t.result === 'win').length;
  const losses = trades.length - wins;
  const winRate = trades.length ? (wins / trades.length * 100).toFixed(1) : 0;
  const avgRR = trades.length ? (
    trades.reduce((acc, t) => acc + Math.abs((t.tp - t.entry) / (t.entry - t.sl)), 0) / trades.length
  ).toFixed(2) : 0;
  const avgSL = trades.length ? (
    trades.reduce((acc, t) => acc + Math.abs(t.entry - t.sl), 0) / trades.length
  ).toFixed(2) : 0;
  summary.innerHTML = `
    <p>Total Trades: ${trades.length}</p>
    <p>Win Rate: ${winRate}%</p>
    <p>Average RR: ${avgRR}</p>
    <p>Average SL Size: ${avgSL}</p>
  `;
}

function drawCharts() {
  new Chart(chartsCanvas, {
    type: 'bar',
    data: {
      labels: ['Wins', 'Losses'],
      datasets: [{
        label: '# of Trades',
        data: [
          trades.filter(t => t.result === 'win').length,
          trades.filter(t => t.result === 'loss').length
        ],
        backgroundColor: ['green', 'red']
      }]
    }
  });
}

tradeForm.onsubmit = e => {
  e.preventDefault();
  const trade = {
    date: date.value,
    pair: pair.value,
    h4: h4.value,
    h1: h1.value,
    zone: zone.value,
    entry: parseFloat(entry.value),
    sl: parseFloat(sl.value),
    tp: parseFloat(tp.value),
    result: result.value,
    notes: notes.value
  };
  trades.push(trade);
  localStorage.setItem('trades', JSON.stringify(trades));
  updateTable(); updateSummary(); drawCharts();
  tradeForm.reset();
};

document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(trades)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'backtest.json';
  a.click(); URL.revokeObjectURL(url);
};

document.getElementById('importBtn').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    trades = JSON.parse(e.target.result);
    localStorage.setItem('trades', JSON.stringify(trades));
    updateTable(); updateSummary(); drawCharts();
  };
  reader.readAsText(file);
};

document.getElementById('filterBtn').onclick = () => {
  const start = new Date(document.getElementById('startDate').value);
  const end = new Date(document.getElementById('endDate').value);
  if (!start || !end) return;

  const filtered = trades.filter(t => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const blob = new Blob([JSON.stringify(filtered)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'filtered_backtest.json';
  a.click(); URL.revokeObjectURL(url);
};

updateTable(); updateSummary(); drawCharts();
