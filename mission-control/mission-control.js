import { checkM1, checkM2, checkM3 } from './mission-checks.js';

const STORAGE_KEY = 'op_patchwork_missions';
const TEMPLATE_URL = './mission-control/mission-control.template.html';

const TEMPLATE_FALLBACK = `
<div class="mission-panel" data-mission-control>
  <div class="mission-panel__header">
    <div>
      <h2 class="mission-panel__title">Mission Control</h2>
      <p class="mission-panel__subtitle">Fix the bugs using AI</p>
    </div>
    <span class="score-badge" id="score-badge">0 / 30 pts</span>
  </div>
  <div class="mission-list">
    <div class="mission-row">
      <div class="mission-row__top">
        <div class="mission-row__meta">
          <span class="mission-number">M1</span>
          <div>
            <p class="mission-name">The Math Bug</p>
            <p class="mission-desc">Balance totals are calculating incorrectly</p>
          </div>
        </div>
        <span class="status-chip status-chip--pending" id="m1-status">Pending</span>
      </div>
      <p class="mission-pts">10 pts</p>
    </div>
    <div class="mission-row">
      <div class="mission-row__top">
        <div class="mission-row__meta">
          <span class="mission-number">M2</span>
          <div>
            <p class="mission-name">The Ghost Delete</p>
            <p class="mission-desc">Delete removes data but the UI doesn't update</p>
          </div>
        </div>
        <span class="status-chip status-chip--pending" id="m2-status">Pending</span>
      </div>
      <p class="mission-pts">10 pts</p>
    </div>
    <div class="mission-row">
      <div class="mission-row__top">
        <div class="mission-row__meta">
          <span class="mission-number">M3</span>
          <div>
            <p class="mission-name">CSV Export</p>
            <p class="mission-desc">Implement a CSV download for all transactions</p>
          </div>
        </div>
        <span class="status-chip status-chip--pending" id="m3-status">Pending</span>
      </div>
      <p class="mission-pts">10 pts</p>
    </div>
  </div>
  <div class="mission-actions">
    <button class="mission-btn mission-btn--primary" id="run-checks-btn" type="button">Run Checks</button>
    <button class="mission-btn mission-btn--secondary" id="csv-export-btn" type="button">Download CSV</button>
    <button class="mission-btn mission-btn--ghost" id="reset-btn" type="button">Reset Progress</button>
  </div>
</div>
`;

function defaultMissions() {
  return {
    m1: { pts: 10, status: 'pending' },
    m2: { pts: 10, status: 'pending' },
    m3: { pts: 10, status: 'pending' }
  };
}

async function loadTemplateMarkup() {
  try {
    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) {
      throw new Error(`Template request failed: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    return TEMPLATE_FALLBACK;
  }
}

function loadMissions() {
  const missions = defaultMissions();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return missions;
  }

  try {
    const parsed = JSON.parse(saved);
    Object.assign(missions, parsed);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }

  return missions;
}

function saveMissions(missions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
}

function updateMissionUI(rootEl, missions) {
  let totalPts = 0;
  ['m1', 'm2', 'm3'].forEach((key) => {
    const chip = rootEl.querySelector(`#${key}-status`);
    const { status, pts } = missions[key];
    chip.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    chip.className = `status-chip status-chip--${status}`;
    if (status === 'passed') {
      totalPts += pts;
    }
  });

  const scoreBadge = rootEl.querySelector('#score-badge');
  scoreBadge.textContent = `${totalPts} / 30 pts`;
}

function bindActions(rootEl, missions, appApi) {
  const runChecksBtn = rootEl.querySelector('#run-checks-btn');
  const resetBtn = rootEl.querySelector('#reset-btn');
  const csvExportBtn = rootEl.querySelector('#csv-export-btn');

  runChecksBtn.addEventListener('click', () => {
    missions.m1.status = checkM1(appApi);
    missions.m2.status = checkM2(appApi);
    missions.m3.status = checkM3(appApi);
    updateMissionUI(rootEl, missions);
    saveMissions(missions);
  });

  resetBtn.addEventListener('click', () => {
    missions.m1.status = 'pending';
    missions.m2.status = 'pending';
    missions.m3.status = 'pending';
    localStorage.removeItem(STORAGE_KEY);
    updateMissionUI(rootEl, missions);
  });

  csvExportBtn.addEventListener('click', () => {
    const downloadCSV = appApi.getDownloadCSV();
    if (typeof downloadCSV === 'function') {
      downloadCSV();
    } else {
      alert('CSV export not implemented yet. This is Mission 3!');
    }
  });
}

export async function initMissionControl({ rootEl, appApi }) {
  if (!rootEl || !appApi) {
    return;
  }

  rootEl.innerHTML = await loadTemplateMarkup();

  const missions = loadMissions();
  updateMissionUI(rootEl, missions);
  bindActions(rootEl, missions, appApi);
}

window.addEventListener('DOMContentLoaded', async () => {
  const rootEl = document.getElementById('mission-control-root');
  const appApi = window.ExpenseTrackerApp;

  if (!rootEl || !appApi) {
    return;
  }

  await initMissionControl({ rootEl, appApi });
});
