// ── Charts Module ──────────────────────────────────
// Renders live Chart.js charts and exposes an update function
// that script.js calls whenever transaction data changes.

(function () {
    'use strict';

    const COLORS = {
        income: '#16A34A',
        expense: '#DC2626',
        incomeBg: 'rgba(22, 163, 74, 0.15)',
        expenseBg: 'rgba(220, 38, 38, 0.15)',
        muted: '#71717A',
        border: '#E4E4E7',
        surface: '#FFFFFF',
        palette: [
            '#2563EB', '#7C3AED', '#DB2777', '#EA580C',
            '#D97706', '#059669', '#0891B2', '#4F46E5'
        ]
    };

    let donutChart = null;
    let barChart = null;

    // ── Donut: Expense Breakdown ──────────────────────
    function buildDonutChart(ctx, expenses) {
        const labels = expenses.map(e => e.text);
        const values = expenses.map(e => Math.abs(e.amount));
        const colors = values.map((_, i) => COLORS.palette[i % COLORS.palette.length]);

        const config = {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: COLORS.surface,
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '62%',
                plugins: {
                    title: {
                        display: true,
                        text: 'Expense Breakdown',
                        font: { size: 14, weight: '600', family: "'Inter', sans-serif" },
                        color: '#18181B',
                        padding: { bottom: 12 }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 14,
                            usePointStyle: true,
                            pointStyleWidth: 10,
                            font: { size: 12, family: "'Inter', sans-serif" },
                            color: COLORS.muted
                        }
                    },
                    tooltip: {
                        backgroundColor: '#18181B',
                        titleFont: { family: "'Inter', sans-serif" },
                        bodyFont: { family: "'Inter', sans-serif" },
                        cornerRadius: 8,
                        padding: 10,
                        callbacks: {
                            label: function (ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                                return ` ${ctx.label}: $${ctx.parsed.toFixed(2)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        };

        if (expenses.length === 0) {
            config.data.labels = ['No expenses yet'];
            config.data.datasets[0].data = [1];
            config.data.datasets[0].backgroundColor = [COLORS.border];
        }

        return new Chart(ctx, config);
    }

    // ── Bar: Income vs Expenses ───────────────────────
    function buildBarChart(ctx, income, expense) {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [income, expense],
                    backgroundColor: [COLORS.incomeBg, COLORS.expenseBg],
                    borderColor: [COLORS.income, COLORS.expense],
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.55
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Income vs Expenses',
                        font: { size: 14, weight: '600', family: "'Inter', sans-serif" },
                        color: '#18181B',
                        padding: { bottom: 12 }
                    },
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#18181B',
                        titleFont: { family: "'Inter', sans-serif" },
                        bodyFont: { family: "'Inter', sans-serif" },
                        cornerRadius: 8,
                        padding: 10,
                        callbacks: {
                            label: function (ctx) {
                                return ` $${ctx.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: COLORS.border, drawBorder: false },
                        ticks: {
                            font: { size: 11, family: "'Inter', sans-serif" },
                            color: COLORS.muted,
                            callback: function (value) { return '$' + value; }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 12, weight: '500', family: "'Inter', sans-serif" },
                            color: '#18181B'
                        }
                    }
                }
            }
        });
    }

    // ── Update / Rebuild Charts ───────────────────────
    function updateCharts(transactions) {
        const expenses = transactions.filter(t => t.amount < 0);
        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Donut chart
        const donutCtx = document.getElementById('expense-donut-chart');
        if (donutCtx) {
            if (donutChart) donutChart.destroy();
            donutChart = buildDonutChart(donutCtx, expenses);
        }

        // Bar chart
        const barCtx = document.getElementById('income-expense-bar-chart');
        if (barCtx) {
            if (barChart) barChart.destroy();
            barChart = buildBarChart(barCtx, income, totalExpense);
        }
    }

    // Expose globally so script.js can call it
    window.updateCharts = updateCharts;
})();
