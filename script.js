const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
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

let allTransactions = [...dummyTransactions];
let visibleTransactions = [...dummyTransactions];

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

function updateValues() {
  const amounts = allTransactions.map((transaction) => Number(transaction.amount));

  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);

  const expense = (amounts
    .filter((item) => item < 0)
    .reduce((acc, item) => acc + item, 0) * -1)
    .toFixed(2);

  balance.innerText = `$${total}`;
  moneyPlus.innerText = `$${income}`;
  moneyMinus.innerText = `$${expense}`;
}

function escapeCsvField(value) {
  const stringValue = String(value);
  if (/["\n,]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function buildTransactionsCsv(transactions) {
  const header = ['id', 'description', 'amount', 'type'];
  const rows = transactions.map((transaction) => {
    const numericAmount = Number(transaction.amount);
    const row = [
      transaction.id,
      transaction.text,
      numericAmount.toFixed(2),
      numericAmount >= 0 ? 'income' : 'expense'
    ];
    return row.map(escapeCsvField).join(',');
  });

  return [header.join(','), ...rows].join('\r\n');
}

function downloadCSV() {
  const csvData = buildTransactionsCsv(allTransactions);
  const csvWithBom = `\uFEFF${csvData}`;

  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getSearchTerm() {
  return searchInput.value.trim().toLowerCase();
}

function syncVisibleTransactions() {
  const term = getSearchTerm();

  if (!term) {
    visibleTransactions = [...allTransactions];
    return;
  }

  visibleTransactions = allTransactions.filter((transaction) =>
    transaction.text.toLowerCase().includes(term)
  );
}

function renderList() {
  list.innerHTML = '';
  visibleTransactions.forEach(addTransactionDOM);
}

// Remove transaction by ID
function removeTransaction(id) {
  allTransactions = allTransactions.filter((transaction) => transaction.id !== id);
  init();
}

function filterTransactions() {
  syncVisibleTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }

  const parsedAmount = Number(amount.value);
  if (!Number.isFinite(parsedAmount)) {
    alert('Please enter a valid numeric amount');
    return;
  }

  const transaction = {
    id: Math.floor(Math.random() * 100000000),
    text: text.value.trim(),
    amount: parsedAmount
  };

  allTransactions.push(transaction);
  init();

  text.value = '';
  amount.value = '';
}

searchInput.addEventListener('input', filterTransactions);
form.addEventListener('submit', addTransaction);

// Init app
function init() {
  syncVisibleTransactions();
  renderList();
  updateValues();
}

window.downloadCSV = downloadCSV;

window.ExpenseTrackerApp = {
  getTransactions() {
    return allTransactions.map((transaction) => ({ ...transaction }));
  },
  addTransaction(transaction) {
    allTransactions.push({ ...transaction });
    syncVisibleTransactions();
    updateValues();
  },
  renderTransaction(transaction) {
    addTransactionDOM(transaction);
  },
  removeTransaction,
  render: init,
  updateValues,
  getDisplayedTotals() {
    return {
      balance: parseFloat(balance.innerText.replace('$', '')),
      income: parseFloat(moneyPlus.innerText.replace('$', '')),
      expense: parseFloat(moneyMinus.innerText.replace('$', ''))
    };
  },
  getListElement() {
    return list;
  },
  getDownloadCSV() {
    return typeof window.downloadCSV === 'function' ? window.downloadCSV : null;
  },
  setSearchTerm(value) {
    searchInput.value = value;
    filterTransactions();
  },
  getSearchTerm() {
    return searchInput.value;
  },
  getRenderedTransactionCount() {
    return list.children.length;
  }
};

init();
