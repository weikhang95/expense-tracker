export function checkM1(appApi) {
  const transactions = appApi.getTransactions();
  const expectedTotal = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);

  try {
    appApi.updateValues();
  } catch (error) {
    return 'failed';
  }

  const displayedTotal = appApi.getDisplayedTotals().balance;
  return Math.abs(displayedTotal - expectedTotal) < 0.01 ? 'passed' : 'failed';
}

export function checkM2(appApi) {
  const testId = 888888888;
  const testTx = { id: testId, text: '__del_test__', amount: 1 };

  appApi.addTransaction(testTx);
  appApi.renderTransaction(testTx);
  appApi.removeTransaction(testId);

  const stillInArray = appApi.getTransactions().some((tx) => tx.id === testId);
  const stillInDOM = !!appApi.getListElement().querySelector(`[data-id="${testId}"]`);

  appApi.removeTransaction(testId);
  const orphan = appApi.getListElement().querySelector(`[data-id="${testId}"]`);
  if (orphan) {
    orphan.remove();
  }

  try {
    appApi.updateValues();
  } catch (error) {
    // Keep behavior stable even if totals logic is still broken.
  }

  return !stillInArray && !stillInDOM ? 'passed' : 'failed';
}

export function checkM3(appApi) {
  return typeof appApi.getDownloadCSV() === 'function' ? 'passed' : 'failed';
}

export function checkM4(appApi) {
  const originalTransactions = appApi.getTransactions();
  const originalIds = new Set(originalTransactions.map((tx) => tx.id));
  const originalCount = originalTransactions.length;

  if (originalCount === 0) {
    return 'failed';
  }

  const searchTerm = originalTransactions[0].text.toLowerCase();
  appApi.setSearchTerm(searchTerm);
  const filteredCount = appApi.getRenderedTransactionCount();

  appApi.setSearchTerm('');
  const restoredCount = appApi.getRenderedTransactionCount();
  const restoredTransactions = appApi.getTransactions();

  const idsIntact = restoredTransactions.every((tx) => originalIds.has(tx.id))
    && restoredTransactions.length === originalIds.size;
  const countRestored = restoredCount === originalCount;
  const dataUnchanged = restoredTransactions.length === originalCount;

  // Ensures the flow really exercised filtering and restoration behavior.
  const filterExecuted = filteredCount >= 1;

  return (idsIntact && countRestored && dataUnchanged && filterExecuted) ? 'passed' : 'failed';
}
