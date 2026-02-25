const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const searchInput = document.getElementById('search');

// Dummy data to start with
const dummyTransactions = [
  { id: 1, text: 'Servo Motor', amount: -250 },
  { id: 2, text: 'Q1 Budget Allocation', amount: 3000 },
  { id: 3, text: 'Lens Assembly', amount: -150 }
];

let transactions = [...dummyTransactions];

// ── Mission Registry ──────────────────────────────
const MISSIONS = {
  m1: { pts: 10, status: 'pending' },
  m2: { pts: 10, status: 'pending' },
  m3: { pts: 10, status: 'pending' }
};

// Add transaction to DOM list
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.dataset.id = transaction.id;
  item.innerHTML = `
    <span class="transaction-name">${transaction.text}</span>
    <span class="transaction-amount">${sign}$${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount.toString());

  const total = amounts.reduce((acc, item) => (acc + item), 0).toFixed(2);

  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc + item), 0)
    .toFixed(2);

  const expense = (amounts
    .filter(item => item < 0)
    .reduce((acc, item) => (acc + item), 0) * -1)
    .toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `$${income}`;
  money_minus.innerText = `$${expense}`;
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
}

function filterTransactions(e) {
  const term = e.target.value.toLowerCase();
  transactions = transactions.filter(t => t.text.toLowerCase().includes(term));
  init();
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
  } else {
    const transaction = {
      id: Math.floor(Math.random() * 100000000),
      text: text.value,
      amount: amount.value
    };

    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();

    text.value = '';
    amount.value = '';
  }
}

// ── Mission Check Functions ───────────────────────

function checkM1() {
  // Compute what the correct total SHOULD be using Number() coercion
  const expectedTotal = transactions.reduce((acc, t) => acc + Number(t.amount), 0);

  // Compute what updateValues() would actually render by sniffing the DOM output
  // We call updateValues() inside a try/catch so a crash = definite fail
  try {
    updateValues();
  } catch (e) {
    return 'failed'; // BUG causes a crash — definitely not fixed yet
  }

  const displayedTotal = parseFloat(balance.innerText.replace('$', ''));

  // If numbers match (within floating point tolerance), the bug is fixed
  return Math.abs(displayedTotal - expectedTotal) < 0.01 ? 'passed' : 'failed';
}

function checkM2() {
  // Add a temp transaction and render it
  const testId = 888888888;
  const testTx = { id: testId, text: '__del_test__', amount: 1 };
  transactions.push(testTx);
  addTransactionDOM(testTx);

  // Call the (potentially buggy) removeTransaction
  removeTransaction(testId);

  // Check both data and DOM
  const stillInArray = transactions.some(t => t.id === testId);
  const stillInDOM = !!document.querySelector(`[data-id="${testId}"]`);

  // Full cleanup regardless of bug state
  transactions = transactions.filter(t => t.id !== testId);
  const orphan = document.querySelector(`[data-id="${testId}"]`);
  if (orphan) orphan.remove();
  // Safe update: only update if M1 is already fixed (to avoid crash loop)
  try { updateValues(); } catch (e) { /* ignore if M1 bug still present */ }

  // Pass: not in array AND not in DOM
  return (!stillInArray && !stillInDOM) ? 'passed' : 'failed';
}

function checkM3() {
  return (typeof window.downloadCSV === 'function') ? 'passed' : 'failed';
}

// ── Mission UI ────────────────────────────────────

function updateMissionUI() {
  let totalPts = 0;
  ['m1', 'm2', 'm3'].forEach(key => {
    const chip = document.getElementById(`${key}-status`);
    const { status, pts } = MISSIONS[key];
    chip.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    chip.className = `status-chip status-chip--${status}`;
    if (status === 'passed') totalPts += pts;
  });
  document.getElementById('score-badge').textContent = `${totalPts} / 30 pts`;
}

function saveMissions() {
  localStorage.setItem('op_patchwork_missions', JSON.stringify(MISSIONS));
}

function loadMissions() {
  const saved = localStorage.getItem('op_patchwork_missions');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(MISSIONS, parsed);
  }
}

// ── Event Listeners ───────────────────────────────

document.getElementById('run-checks-btn').addEventListener('click', () => {
  MISSIONS.m1.status = checkM1();
  MISSIONS.m2.status = checkM2();
  MISSIONS.m3.status = checkM3();
  updateMissionUI();
  saveMissions();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  MISSIONS.m1.status = 'pending';
  MISSIONS.m2.status = 'pending';
  MISSIONS.m3.status = 'pending';
  localStorage.removeItem('op_patchwork_missions');
  updateMissionUI();
});

document.getElementById('csv-export-btn').addEventListener('click', () => {
  if (typeof window.downloadCSV === 'function') {
    window.downloadCSV();
  } else {
    alert('CSV export not implemented yet. This is Mission 3!');
  }
});

searchInput.addEventListener('input', filterTransactions);
form.addEventListener('submit', addTransaction);

// Init app
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

loadMissions();
updateMissionUI();
init();
