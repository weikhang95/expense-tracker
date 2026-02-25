const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');

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
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
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

// Init app
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

init();
