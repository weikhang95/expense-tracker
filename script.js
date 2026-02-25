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

searchInput.addEventListener('input', filterTransactions);
form.addEventListener('submit', addTransaction);

// Init app
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

window.ExpenseTrackerApp = {
  getTransactions() {
    return [...transactions];
  },
  addTransaction(transaction) {
    transactions.push(transaction);
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
      income: parseFloat(money_plus.innerText.replace('$', '')),
      expense: parseFloat(money_minus.innerText.replace('$', ''))
    };
  },
  getListElement() {
    return list;
  },
  getBalanceElement() {
    return balance;
  },
  getDownloadCSV() {
    return typeof window.downloadCSV === 'function' ? window.downloadCSV : null;
  }
};

init();
