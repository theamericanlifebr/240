let aspectKeys = [];
let tasksData = [];
let editingTaskIndex = null;
let aspectsMap = {};
let pendingTask = null;
let conflictingIndices = [];
let currentTaskStep = 1;

const addTaskBtn = document.getElementById('add-task-btn');
const suggestTaskBtn = document.getElementById('suggest-task-btn');
const taskModal = document.getElementById('task-modal');
const taskTitleInput = document.getElementById('task-title');
const taskDateOption = document.getElementById('task-date-option');
const taskDateInput = document.getElementById('task-date');
const taskCustomWeekDiv = document.getElementById('task-custom-week');
const taskCustomInputs = document.querySelectorAll('#task-custom-week input');
const taskTimeInput = document.getElementById('task-time');
const taskAspectInput = document.getElementById('task-aspect');
const taskNoTimeInput = document.getElementById('task-no-time');
const saveTaskBtn = document.getElementById('save-task');
const cancelTaskBtn = document.getElementById('cancel-task');
const deleteTaskBtn = document.getElementById('delete-task');
const step1Div = document.getElementById('task-step-1');
const step2Div = document.getElementById('task-step-2');
const step3Div = document.getElementById('task-step-3');
const conflictModal = document.getElementById('conflict-modal');
const conflictList = document.getElementById('conflict-list');
const replaceAllBtn = document.getElementById('replace-all');
const cancelConflictBtn = document.getElementById('cancel-conflict');

const prevDayBtn = document.getElementById('tasks-prev-day');
const nextDayBtn = document.getElementById('tasks-next-day');
const currentDateSpan = document.getElementById('tasks-current-date');
let currentTasksDate = new Date();

function showTaskStep(step) {
  currentTaskStep = step;
  step1Div.classList.add('hidden');
  step2Div.classList.add('hidden');
  step3Div.classList.add('hidden');
  if (step === 1) {
    step1Div.classList.remove('hidden');
  } else if (step === 2) {
    step2Div.classList.remove('hidden');
  } else if (step === 3) {
    step3Div.classList.remove('hidden');
  }
}

function nextTaskStep() {
  if (currentTaskStep < 3) showTaskStep(currentTaskStep + 1);
}

function prevTaskStep() {
  if (currentTaskStep > 1) showTaskStep(currentTaskStep - 1);
}

function formatDuration(mins) {
  const m = mins || 0;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h) {
    const hTxt = `${h} hora${h > 1 ? 's' : ''}`;
    const mTxt = mm ? ` e ${mm} minuto${mm > 1 ? 's' : ''}` : '';
    return hTxt + mTxt;
  }
  return `${mm} minuto${mm !== 1 ? 's' : ''}`;
}
export function initTasks(keys, data, aspects) {
  aspectKeys = keys;
  tasksData = data;
  aspectsMap = aspects;
  addTaskBtn.addEventListener('click', () => openTaskModal());
  suggestTaskBtn.addEventListener('click', suggestTask);
  saveTaskBtn.addEventListener('click', saveTask);
  cancelTaskBtn.addEventListener('click', closeTaskModal);
  deleteTaskBtn.addEventListener('click', deleteTask);
  taskNoTimeInput.addEventListener('change', () => {
    taskTimeInput.disabled = taskNoTimeInput.value !== '';
  });
  taskDateOption.addEventListener('change', () => {
    const val = taskDateOption.value;
    if (val === 'choose') {
      taskDateInput.classList.remove('hidden');
      taskCustomWeekDiv.classList.add('hidden');
    } else if (val === 'custom') {
      taskCustomWeekDiv.classList.remove('hidden');
      taskDateInput.classList.add('hidden');
    } else {
      taskDateInput.classList.add('hidden');
      taskCustomWeekDiv.classList.add('hidden');
    }
  });
  replaceAllBtn.addEventListener('click', replaceAllConflicts);
  cancelConflictBtn.addEventListener('click', () => {
    conflictModal.classList.add('hidden');
    conflictModal.classList.remove('show');
    pendingTask = null;
    conflictingIndices = [];
  });
  prevDayBtn.addEventListener('click', () => { changeTasksDate(-1); });
  nextDayBtn.addEventListener('click', () => { changeTasksDate(1); });
  updateTasksDateLabel();
  if (window.innerWidth <= 600) {
    let startX = 0;
    taskModal.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });
    taskModal.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -50) nextTaskStep();
      else if (dx > 50) prevTaskStep();
    });
    const icon = document.querySelector('#tasks .icone-central');
    if (icon) {
      let lastTap = 0;
      icon.addEventListener('touchend', () => {
        const now = Date.now();
        if (now - lastTap < 300) suggestTask();
        lastTap = now;
      });
    }
  } else {
    document.addEventListener('keydown', e => {
      if (taskModal.classList.contains('hidden')) return;
      if (e.key === 'ArrowRight') nextTaskStep();
      if (e.key === 'ArrowLeft') prevTaskStep();
    });
  }
  buildTasks();
  setInterval(() => {
    buildTasks();
    if (window.buildCalendar) window.buildCalendar();
  }, 1000);
}

function buildTasks() {
  const pending = document.getElementById('pending-list');
  const inProgress = document.getElementById('in-progress-list');
  const completed = document.getElementById('completed-list');
  const overdue = document.getElementById('overdue-list');
  const substituted = document.getElementById('substituted-list');
  pending.innerHTML = '';
  inProgress.innerHTML = '';
  completed.innerHTML = '';
  overdue.innerHTML = '';
  substituted.innerHTML = '';
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const now = Date.now();
  const selectedStr = currentTasksDate.toDateString();
  const todayStr = new Date().toDateString();
  tasks.forEach((t, index) => {
    const taskDateStr = t.startTime ? new Date(t.startTime).toDateString() : null;
    if (t.startTime) {
      if (taskDateStr !== selectedStr) return;
    } else if (!['', 'morning', 'afternoon', 'night', 'today'].includes(t.noTime) || selectedStr !== todayStr) {
      return;
    }
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.index = index;

    const icon = document.createElement('img');
    icon.className = 'task-aspect-icon';
    icon.alt = t.aspect;
    icon.src = aspectsMap[t.aspect]?.image || '';

    const textDiv = document.createElement('div');
    textDiv.className = 'task-text';

    const h3 = document.createElement('h3');
    h3.textContent = t.title;
    textDiv.appendChild(h3);

    const span = document.createElement('span');
    span.textContent = formatDuration(t.duration);
    textDiv.appendChild(span);

    div.appendChild(icon);
    div.appendChild(textDiv);
    div.addEventListener('dblclick', () => {
      tasks[index].completed = true;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      buildTasks();
    });
    let pressTimer;
    const start = () => {
      pressTimer = setTimeout(() => openTaskModal(index), 500);
    };
    const cancel = () => clearTimeout(pressTimer);
    div.addEventListener('mousedown', start);
    div.addEventListener('touchstart', start);
    div.addEventListener('mouseup', cancel);
    div.addEventListener('mouseleave', cancel);
    div.addEventListener('touchend', cancel);
    const time = t.startTime ? new Date(t.startTime).getTime() : null;
    const endTime = time ? time + (t.duration || 0) * 60000 : null;
    if (!t.completed && time && time > now) {
      const timer = document.createElement('div');
      timer.className = 'task-timer';
      const diffMs = time - now;
      let txt;
      if (diffMs >= 3600000) {
        const hh = Math.floor(diffMs / 3600000);
        const mm = Math.floor((diffMs % 3600000) / 60000);
        txt = `${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}h`;
      } else {
        const mm = Math.floor(diffMs / 60000);
        const ss = Math.floor((diffMs % 60000) / 1000);
        txt = `${mm.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}m`;
      }
      timer.textContent = txt;
      div.appendChild(timer);
    }
    if (t.substituted) {
      div.classList.add('overdue');
      substituted.appendChild(div);
    } else if (t.completed) {
      div.classList.add('completed');
      completed.appendChild(div);
    } else if (time && endTime && now >= time && now < endTime) {
      div.classList.add('in-progress');
      inProgress.appendChild(div);
    } else if (time && endTime && now >= endTime) {
      div.classList.add('overdue');
      overdue.appendChild(div);
    } else {
      div.classList.add('pending');
      pending.appendChild(div);
    }
  });
  if (!pending.children.length && !inProgress.children.length && !completed.children.length && !overdue.children.length && !substituted.children.length) {
    pending.textContent = 'Sem tarefas para hoje';
  }
}

function changeTasksDate(delta) {
  currentTasksDate.setDate(currentTasksDate.getDate() + delta);
  updateTasksDateLabel();
  buildTasks();
}

function updateTasksDateLabel() {
  currentDateSpan.textContent = currentTasksDate.toLocaleDateString('pt-BR');
}

export function openTaskModal(index = null, prefill = null) {
  editingTaskIndex = index;
  taskAspectInput.innerHTML = '';
  aspectKeys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    taskAspectInput.appendChild(opt);
  });
  const now = new Date();
  taskDateOption.value = 'today';
  taskDateInput.classList.add('hidden');
  taskCustomWeekDiv.classList.add('hidden');
  taskTimeInput.value = now.toTimeString().slice(0,5);
  taskNoTimeInput.value = '';
  taskCustomInputs.forEach(i => (i.checked = false));
  if (index !== null) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const t = tasks[index];
    taskTitleInput.value = t.title;
    if (t.startTime) {
      const d = new Date(t.startTime);
      taskDateOption.value = 'choose';
      taskDateInput.classList.remove('hidden');
      taskDateInput.value = d.toISOString().slice(0,10);
      taskTimeInput.value = d.toTimeString().slice(0,5);
    } else {
      taskDateOption.value = 'today';
      taskDateInput.classList.add('hidden');
      taskTimeInput.value = '';
    }
    taskAspectInput.value = t.aspect;
    taskNoTimeInput.value = t.noTime || '';
    document.querySelector('#task-modal h2').textContent = 'Editar tarefa';
    deleteTaskBtn.classList.remove('hidden');
  } else {
    document.querySelector('#task-modal h2').textContent = 'Nova tarefa';
    deleteTaskBtn.classList.add('hidden');
    if (prefill) {
      taskTitleInput.value = prefill.title;
      taskAspectInput.value = prefill.aspect;
      if (prefill.startTime) {
        const d = new Date(prefill.startTime);
        taskDateOption.value = 'choose';
        taskDateInput.classList.remove('hidden');
        taskDateInput.value = d.toISOString().slice(0,10);
        taskTimeInput.value = d.toTimeString().slice(0,5);
      }
    } else {
      taskTitleInput.value = '';
      taskAspectInput.value = aspectKeys[0] || '';
    }
  }
  showTaskStep(1);
  taskModal.classList.add('show');
  taskModal.classList.remove('hidden');
}

function suggestTask() {
  if (!Array.isArray(tasksData) || !tasksData.length) return;
  const idea = tasksData[Math.floor(Math.random() * tasksData.length)];
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const now = new Date(Date.now() + 3600000).toISOString();
  tasks.push({
    title: idea.title.slice(0, 27),
    description: (idea.description || '').slice(0, 60),
    startTime: now,
    aspect: idea.aspect,
    type: idea.type || 'Hábito',
    duration: 15,
    completed: false
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  buildTasks();
  if (window.buildCalendar) window.buildCalendar();
}

function closeTaskModal() {
  taskModal.classList.remove('show');
  taskModal.classList.add('hidden');
  editingTaskIndex = null;
}

function showConflicts(conflicts) {
  conflictList.innerHTML = '';
  conflicts.forEach(c => {
    const div = document.createElement('div');
    div.className = 'task-item';
    const h3 = document.createElement('h3');
    h3.textContent = c.title;
    div.appendChild(h3);
    conflictList.appendChild(div);
  });
  conflictModal.classList.remove('hidden');
  conflictModal.classList.add('show');
}

function findConflicts(start, duration, tasks, ignoreIndex = null) {
  const startMs = start.getTime();
  const endMs = startMs + duration * 60000;
  return tasks
    .map((t, idx) => ({ ...t, idx }))
    .filter(t => {
      if (ignoreIndex !== null && t.idx === ignoreIndex) return false;
      if (!t.startTime) return false;
      const tStart = new Date(t.startTime).getTime();
      const tEnd = tStart + (t.duration || 15) * 60000;
      return startMs < tEnd && endMs > tStart;
    });
}

function saveTask() {
  const title = taskTitleInput.value.trim();
  if (!title) return;
  const aspect = taskAspectInput.value;
  const noTime = taskNoTimeInput.value;
  const time = taskTimeInput.value;
  const dateOption = taskDateOption.value;
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  if (!noTime) {
    if (!time) return;
    let baseDate = new Date();
    if (dateOption === 'tomorrow') baseDate.setDate(baseDate.getDate() + 1);
    else if (dateOption === 'weekday2') baseDate.setDate(baseDate.getDate() + 2);
    else if (dateOption === 'weekday3') baseDate.setDate(baseDate.getDate() + 3);
    else if (dateOption === 'weekday4') baseDate.setDate(baseDate.getDate() + 4);
    else if (dateOption === 'choose') {
      if (!taskDateInput.value) return;
      baseDate = new Date(taskDateInput.value);
    }
    const datetime = new Date(baseDate);
    const [hh, mm] = time.split(':');
    datetime.setHours(hh, mm, 0, 0);
    const baseTask = {
      title: title.slice(0, 27),
      aspect,
      type: 'Tarefa',
      duration: 0,
      completed: false
    };
    if (dateOption === 'custom' && editingTaskIndex === null) {
      const selectedDays = Array.from(taskCustomInputs)
        .filter(i => i.checked)
        .map(i => parseInt(i.value));
      const days = selectedDays.length ? selectedDays : [datetime.getDay()];
      for (const day of days) {
        const d = new Date(datetime);
        const diff = (day - d.getDay() + 7) % 7;
        d.setDate(d.getDate() + diff);
        const conflicts = findConflicts(d, 0, tasks);
        if (conflicts.length) {
          pendingTask = { ...baseTask, startTime: d.toISOString(), editIndex: null };
          conflictingIndices = conflicts.map(c => c.idx);
          showConflicts(conflicts);
          closeTaskModal();
          return;
        }
        const isPast = d <= new Date();
        tasks.push({ ...baseTask, startTime: d.toISOString(), completed: isPast ? true : baseTask.completed });
      }
    } else {
      if (editingTaskIndex !== null) {
        const conflicts = findConflicts(datetime, 0, tasks, editingTaskIndex);
        if (conflicts.length) {
          pendingTask = { ...baseTask, startTime: datetime.toISOString(), editIndex: editingTaskIndex };
          conflictingIndices = conflicts.map(c => c.idx);
          showConflicts(conflicts);
          closeTaskModal();
          return;
        }
        tasks[editingTaskIndex] = { ...baseTask, startTime: datetime.toISOString() };
      } else {
        const conflicts = findConflicts(datetime, 0, tasks);
        if (conflicts.length) {
          pendingTask = { ...baseTask, startTime: datetime.toISOString(), editIndex: null };
          conflictingIndices = conflicts.map(c => c.idx);
          showConflicts(conflicts);
          closeTaskModal();
          return;
        }
        tasks.push({ ...baseTask, startTime: datetime.toISOString() });
      }
    }
  } else {
    const taskObj = {
      title: title.slice(0, 27),
      aspect,
      type: 'Tarefa',
      duration: 0,
      noTime,
      completed: false
    };
    if (editingTaskIndex !== null) tasks[editingTaskIndex] = taskObj; else tasks.push(taskObj);
  }
  localStorage.setItem('tasks', JSON.stringify(tasks));
  closeTaskModal();
  buildTasks();
  if (window.buildCalendar) window.buildCalendar();
}

function deleteTask() {
  if (editingTaskIndex === null) return;
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.splice(editingTaskIndex, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  closeTaskModal();
  buildTasks();
  if (window.buildCalendar) window.buildCalendar();
}

function replaceAllConflicts() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  conflictingIndices.forEach(i => {
    if (tasks[i]) {
      tasks[i].startTime = null;
      tasks[i].substituted = true;
    }
  });
  if (pendingTask) {
    if (pendingTask.editIndex !== null) {
      tasks[pendingTask.editIndex] = pendingTask;
    } else {
      tasks.push(pendingTask);
    }
  }
  localStorage.setItem('tasks', JSON.stringify(tasks));
  conflictModal.classList.add('hidden');
  conflictModal.classList.remove('show');
  pendingTask = null;
  conflictingIndices = [];
  buildTasks();
  if (window.buildCalendar) window.buildCalendar();
}

