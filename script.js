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

let transactions = dummyTransactions;

// Add transaction to DOM list
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
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
// BUG 1: String concatenation instead of math addition
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
// BUG 2: Deletes data but forgets to re-render the UI
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  // Missing init() or updateDOM() call here!
}

// BUG 3: Search filter doesn't actually filter the displayed list
// It filters the 'transactions' array instead of creating a temp copy, ruining the state
function filterTransactions(e) {
  const term = e.target.value.toLowerCase();
  transactions = transactions.filter(t => t.text.toLowerCase().includes(term));
  init(); // This will permanently delete transactions that don't match!
}

// BUG 4: Form submission adds data but uses 'amount.value' which is a string
// This will exacerbate the Bug 1 math issue
function addTransaction(e) {
  e.preventDefault();
  
  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
  } else {
    const transaction = {
      id: Math.floor(Math.random() * 100000000),
      text: text.value,
      amount: amount.value // String bug!
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

init();
