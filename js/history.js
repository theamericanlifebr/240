import { openTaskModal } from './tasks.js';

let calendarStart = getCurrentPeriodStart(new Date());
let calendarTitle;
let calendarList;
let aspectsMap = {};
let titleTouchX = 0;
let noteModal;
let noteListDiv;
let noteText;
let noteSave;
let noteClose;
let currentNoteKey = null;

export function initHistory(aspects) {
  aspectsMap = aspects;
  calendarTitle = document.getElementById('calendar-title');
  calendarList = document.getElementById('history-calendar-list');
  noteModal = document.getElementById('note-modal');
  noteListDiv = document.getElementById('note-list');
  noteText = document.getElementById('note-text');
  noteSave = document.getElementById('note-save');
  noteClose = document.getElementById('note-close');
  if (calendarTitle) {
    calendarTitle.addEventListener('touchstart', e => {
      titleTouchX = e.touches[0].clientX;
    });
    calendarTitle.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - titleTouchX;
      if (dx < -50) changePeriod(1);
      else if (dx > 50) changePeriod(-1);
    });
    calendarTitle.addEventListener('mousedown', e => {
      titleTouchX = e.clientX;
    });
    calendarTitle.addEventListener('mouseup', e => {
      const dx = e.clientX - titleTouchX;
      if (dx < -50) changePeriod(1);
      else if (dx > 50) changePeriod(-1);
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') changePeriod(-1);
    else if (e.key === 'ArrowRight') changePeriod(1);
  });
  noteSave.addEventListener('click', saveNote);
  noteClose.addEventListener('click', () => { noteModal.classList.add('hidden'); noteModal.classList.remove('show'); currentNoteKey = null; });
  buildCalendar();
  setInterval(buildCalendar, 60000);
  window.buildCalendar = buildCalendar;
}

export function buildCalendar() {
  if (!calendarList || !calendarTitle) return;
  const now = new Date();
  const start = calendarStart;
  const periodInfo = getPeriodInfo(start.getHours());
  calendarTitle.textContent = formatDate(start);
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const notes = JSON.parse(localStorage.getItem('notes') || '{}');
  const periodEnd = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const periodTasks = tasks
    .map((t, idx) => ({ ...t, idx }))
    .filter(t => {
      if (!t.startTime) return false;
      const tStart = new Date(t.startTime).getTime();
      const tEnd = tStart + (t.duration || 15) * 60000;
      return tStart < periodEnd.getTime() && tEnd > start.getTime();
    });
  calendarList.innerHTML = '';
  for (let minutes = 0; minutes < 6 * 60; minutes += 15) {
    const blockTime = new Date(start.getTime() + minutes * 60000);
    const label = `${String(blockTime.getHours()).padStart(2, '0')}:${String(blockTime.getMinutes()).padStart(2, '0')}`;
    const boxtime = document.createElement('div');
    boxtime.className = `boxtime ${periodInfo.className}`;
    const timeDiv = document.createElement('div');
    timeDiv.className = 'boxtime-time';
    timeDiv.textContent = label;
    boxtime.appendChild(timeDiv);
    const icons = document.createElement('div');
    icons.className = 'boxtime-icons';
    const blockStart = blockTime.getTime();
    const blockEnd = blockStart + 15 * 60000;
    if (blockEnd <= now.getTime()) boxtime.classList.add('past');
    const matching = periodTasks.filter(t => {
      const tStart = new Date(t.startTime).getTime();
      const tEnd = tStart + (t.duration || 15) * 60000;
      return tStart < blockEnd && tEnd > blockStart;
    });
    matching.slice(0, 4).forEach(t => {
      const img = document.createElement('img');
      img.src = aspectsMap[t.aspect]?.image || '';
      img.alt = t.aspect;
      img.width = 30;
      img.height = 30;
      const idx = t.idx;
      img.addEventListener('click', () => openTaskModal(idx));
      icons.appendChild(img);
    });
    boxtime.appendChild(icons);
    if (notes[blockStart] && notes[blockStart].length) {
      const noteSpan = document.createElement('span');
      noteSpan.textContent = '🗨️';
      noteSpan.className = 'note-indicator';
      noteSpan.addEventListener('click', e => { e.stopPropagation(); openNote(blockStart); });
      boxtime.appendChild(noteSpan);
    }
    let lastTap = 0;
    boxtime.addEventListener('dblclick', () => openTaskModal(null, { startTime: blockTime.toISOString() }));
    boxtime.addEventListener('touchend', e => {
      const nowTap = Date.now();
      if (nowTap - lastTap < 300) openTaskModal(null, { startTime: blockTime.toISOString() });
      lastTap = nowTap;
    });
    let pressTimer;
    const startPress = () => { pressTimer = setTimeout(() => openNote(blockStart), 1000); };
    const cancelPress = () => clearTimeout(pressTimer);
    boxtime.addEventListener('mousedown', startPress);
    boxtime.addEventListener('touchstart', startPress);
    boxtime.addEventListener('mouseup', cancelPress);
    boxtime.addEventListener('mouseleave', cancelPress);
    boxtime.addEventListener('touchend', cancelPress);
    calendarList.appendChild(boxtime);
  }
}

function changePeriod(delta) {
  calendarStart = new Date(calendarStart.getTime() + delta * 6 * 60 * 60 * 1000);
  buildCalendar();
}

function openNote(key) {
  const notes = JSON.parse(localStorage.getItem('notes') || '{}');
  currentNoteKey = key;
  noteListDiv.innerHTML = '';
  (notes[key] || []).forEach((n, idx) => {
    const card = document.createElement('div');
    card.className = 'comment-card';

    const status = document.createElement('div');
    status.className = 'comment-status';

    const body = document.createElement('div');
    body.className = 'comment-body';
    const text = document.createElement('p');
    text.className = 'comment-text';
    text.textContent = n;
    const time = document.createElement('p');
    time.className = 'comment-time';
    time.textContent = `Comentário ${idx + 1}`;
    body.appendChild(text);
    body.appendChild(time);

    card.appendChild(status);
    card.appendChild(body);
    noteListDiv.appendChild(card);
  });
  noteText.value = '';
  noteModal.classList.add('show');
  noteModal.classList.remove('hidden');
}

function saveNote() {
  if (!currentNoteKey) return;
  const txt = noteText.value.trim();
  if (!txt) return;
  const notes = JSON.parse(localStorage.getItem('notes') || '{}');
  if (!Array.isArray(notes[currentNoteKey])) notes[currentNoteKey] = [];
  notes[currentNoteKey].push(txt.slice(0,2000));
  localStorage.setItem('notes', JSON.stringify(notes));
  noteModal.classList.add('hidden');
  noteModal.classList.remove('show');
  currentNoteKey = null;
  buildCalendar();
}

function getCurrentPeriodStart(now) {
  const hour = now.getHours();
  const startHour = hour < 6 ? 0 : hour < 12 ? 6 : hour < 18 ? 12 : 18;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, 0, 0, 0);
}

function getPeriodInfo(hour) {
  if (hour < 6) return { className: 'dawn' };
  if (hour < 12) return { className: 'morning' };
  if (hour < 18) return { className: 'afternoon' };
  return { className: 'night' };
}

function formatDate(date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDate(date, today)) return 'Hoje';
  if (isSameDate(date, tomorrow)) return 'Amanhã';
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
