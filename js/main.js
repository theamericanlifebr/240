import { initTasks } from './tasks.js';
import { initLaws } from './laws.js';
import { initMindset, openMindsetModal, suggestMindset } from './mindset.js';
import { initStats } from './stats.js';
import { initHistory } from './history.js';

let aspectsData = {};
let aspectKeys = [];
let tasksData = [];
let lawsData = [];
let mindsetData = [];
let currentIndex = 0;
let stage = 0; // 0 matters, 1 level
let responses = JSON.parse(localStorage.getItem('responses') || '{}');
let previousLogin = 0;
let pendingReturnPage = null;
let suppressVoting = false;
let introDone = localStorage.getItem('introDone') === 'true';
let levelDone = localStorage.getItem('levelDone') === 'true';

const introMattersMessages = [
  'Este é o iLife Prime\nEstamos preparando tudo pra você',
  'Você fez a escolha certa...\nTudo muda a partir de agora..',
  'Primeiro vamos definir...\nO que você realmente quer..\nDeslise para cima para aceitar..\nou para baixo para não aceitar..'
];

const levelIntroMessages = [
  'Excelente, já sabemos pra onde ir ..,.',
  'Hora de saber onde estamos ..',
  'Defina abaixo seus niveis atuais para cada um dos aspectos ..',
  'Responda com honestidade ...',
  'E vamos alcançar passo a passo ..'
];

const importanceQuestions = {
  Emocional: 'Quer dominar suas emoções?',
  Energia: 'Quer mais energia todo dia?',
  Relacionamentos: 'Quer relações mais fortes?',
  'Propósito': 'Quer viver com propósito?',
  'Nutrição': 'Quer se alimentar melhor?',
  'Sono': 'Quer dormir e acordar bem?',
  'Higiene': 'Quer cuidar mais de você?',
  'Exercícios': 'Quer ter um corpo ativo?',
  'Trabalho': 'Quer crescer no trabalho?',
  'Financeiro': 'Quer mais liberdade financeira?',
  'Estudo': 'Quer aprender sem parar?',
  'Ambiente': 'Quer um espaço que te inspire?'
};

const levelMessages = {
  Emocional: [
    'Meu emocional está péssimo',
    'Meu emocional não está bom',
    'Meu emocional está regular',
    'Meu emocional está bom',
    'Meu emocional está excelente'
  ],
  Energia: [
    'Minha energia está péssima',
    'Minha energia não está boa',
    'Minha energia está regular',
    'Minha energia está boa',
    'Minha energia está excelente'
  ],
  Relacionamentos: [
    'Meus relacionamentos estão péssimos',
    'Meus relacionamentos não estão bons',
    'Meus relacionamentos estão regulares',
    'Meus relacionamentos estão bons',
    'Meus relacionamentos estão excelentes'
  ],
  'Propósito': [
    'Não tenho propósito nenhum',
    'Meu propósito não está claro',
    'Meu propósito é regular',
    'Meu propósito está bom',
    'Meu propósito está excelente'
  ],
  'Nutrição': [
    'Minha alimentação está péssima',
    'Minha alimentação não está boa',
    'Minha alimentação está regular',
    'Minha alimentação está boa',
    'Minha alimentação está excelente'
  ],
  'Sono': [
    'Meu sono está péssimo',
    'Meu sono não está bom',
    'Meu sono está regular',
    'Meu sono está bom',
    'Meu sono está excelente'
  ],
  'Higiene': [
    'Minha higiene está péssima',
    'Minha higiene não está boa',
    'Minha higiene está regular',
    'Minha higiene está boa',
    'Minha higiene está excelente'
  ],
  'Exercícios': [
    'Não faço exercício nenhum',
    'Meus exercícios não estão bons',
    'Meus exercícios são regulares',
    'Meus exercícios estão bons',
    'Meus exercícios estão excelentes'
  ],
  'Trabalho': [
    'Meu trabalho está péssimo',
    'Meu trabalho não está bom',
    'Meu trabalho está regular',
    'Meu trabalho está bom',
    'Meu trabalho está excelente'
  ],
  'Financeiro': [
    'Minha vida financeira está péssima',
    'Minha vida financeira não está boa',
    'Minha vida financeira está regular',
    'Minha vida financeira está boa',
    'Minha vida financeira está excelente'
  ],
  'Estudo': [
    'Meus estudos estão péssimos',
    'Meus estudos não estão bons',
    'Meus estudos estão regulares',
    'Meus estudos estão bons',
    'Meus estudos estão excelentes'
  ],
  'Ambiente': [
    'Meu ambiente está péssimo',
    'Meu ambiente não está bom',
    'Meu ambiente está regular',
    'Meu ambiente está bom',
    'Meu ambiente está excelente'
  ]
};


const statsColors = {
  Emocional: ['#000000', '#ff4d6d'],
  Energia: ['#000000', '#ff8e00'],
  Relacionamentos: ['#000000', '#9d4edd'],
  Propósito: ['#000000', '#ff00ff'],
  Nutrição: ['#000000', '#32ff6a'],
  Sono: ['#000000', '#04d9ff'],
  Higiene: ['#000000', '#ffb86c'],
  Exercícios: ['#000000', '#39ff14'],
  Trabalho: ['#000000', '#fe53bb'],
  Financeiro: ['#000000', '#ffee32'],
  Estudo: ['#000000', '#00bbf9'],
  Ambiente: ['#000000', '#9400d3']
};

const storedAspectColors = JSON.parse(localStorage.getItem('aspectColors') || '{}');
Object.keys(storedAspectColors).forEach(k => {
  statsColors[k] = [storedAspectColors[k], storedAspectColors[k]];
});

// Prevent copying, context menu, and zoom interactions
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('paste', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a', '+', '-', '0'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

const slider = document.getElementById('slider');
const sliderFeedback = document.getElementById('slider-feedback');
const aspectImage = document.getElementById('aspect-image');
const headerLogo = document.getElementById('header-logo');
const menuCarousel = document.getElementById('menu-carousel');

let savedTheme = localStorage.getItem('theme');
if (savedTheme === 'turquoise') {
  savedTheme = 'neon';
  localStorage.setItem('theme', 'neon');
}
savedTheme = savedTheme || 'neon';
document.body.classList.add(savedTheme);
if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'neon');

const savedBg = localStorage.getItem('customBg');
if (savedBg) document.body.style.backgroundImage = `url(${savedBg})`;
let logoTapCount = 0;
let logoTapTimer;
let logoPressTimer;

headerLogo.addEventListener('touchstart', () => {
  logoPressTimer = setTimeout(() => {
    suggestMindset();
    logoTapCount = 0;
  }, 500);
});

headerLogo.addEventListener('touchend', () => {
  clearTimeout(logoPressTimer);
  logoTapCount++;
  if (logoTapCount === 1) {
    logoTapTimer = setTimeout(() => {
      showPage('menu');
      logoTapCount = 0;
    }, 300);
  } else if (logoTapCount === 2) {
    clearTimeout(logoTapTimer);
    openMindsetModal();
    logoTapCount = 0;
  }
});

headerLogo.addEventListener('click', e => {
  if (!('ontouchstart' in window)) {
    showPage('menu');
  }
});
headerLogo.addEventListener('dblclick', e => {
  if (!('ontouchstart' in window)) {
    openMindsetModal();
  }
});
headerLogo.addEventListener('mousedown', () => {
  if (!('ontouchstart' in window)) {
    logoPressTimer = setTimeout(() => {
      suggestMindset();
    }, 500);
  }
});
headerLogo.addEventListener('mouseup', () => {
  clearTimeout(logoPressTimer);
});

Promise.all([
  fetch('data/aspects.json').then(r => r.json()),
  fetch('tarefas.json').then(r => r.json()),
  fetch('leis.json').then(r => r.json()),
  fetch('mindset.json').then(r => r.json())
]).then(([aspects, tarefas, leis, mindset]) => {
  aspectsData = aspects;
  tasksData = tarefas;
  lawsData = leis;
  mindsetData = mindset;
  aspectKeys = Object.keys(aspects);
  if (introDone || Object.keys(responses).length) {
    document.getElementById('logo-screen').style.display = 'none';
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    initApp(false);
  } else {
    setTimeout(() => {
      const text = document.getElementById('logo-text');
      text.classList.remove('hidden');
      requestAnimationFrame(() => text.classList.add('show'));
    }, 2500);
    setTimeout(() => {
      const logoScreen = document.getElementById('logo-screen');
      logoScreen.classList.add('fade-out');
      setTimeout(() => {
        logoScreen.style.display = 'none';
        playIntro(introMattersMessages, 'intro-matters', () => {
          document.getElementById('question-screen').classList.remove('hidden');
          showQuestion();
        }, true);
      }, 1000);
    }, 4000);
  }
});

function playIntro(messages, screenId, callback, requireSwipe = false) {
  const screen = document.getElementById(screenId);
  const textEl = screen.querySelector('p');
  screen.classList.remove('hidden');
  let idx = 0;
  function showNext() {
    if (idx >= messages.length) {
      if (!requireSwipe) {
        screen.classList.add('hidden');
        callback();
      }
      return;
    }
    textEl.innerHTML = messages[idx].replace(/\n/g, '<br>');
    textEl.classList.add('show');
    if (requireSwipe && idx === messages.length - 1) {
      let startY = 0;
      screen.addEventListener('touchstart', e => startY = e.touches[0].clientY, { once: true });
      screen.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - startY;
        if (dy < -50) {
          textEl.classList.remove('show');
          setTimeout(() => { screen.classList.add('hidden'); callback(); }, 500);
        } else if (dy > 50) {
          location.reload();
        } else {
          showNext();
        }
      }, { once: true });
    } else {
      setTimeout(() => {
        textEl.classList.remove('show');
        setTimeout(() => { idx++; showNext(); }, 500);
      }, 2500);
    }
  }
  showNext();
}

function showQuestion() {
  const key = aspectKeys[currentIndex];
  const title = stage === 0
    ? importanceQuestions[key]
    : `Qual o nível atual do seu ${key.toLowerCase()}?`;
  document.getElementById('question-title').textContent = title;
  aspectImage.src = aspectsData[key].image;
  aspectImage.alt = key;
  const value = stage === 0
    ? (responses[key]?.importance || 50)
    : (responses[key]?.level || 50);
  slider.value = value;
  updateFeedback();
  const totalSteps = aspectKeys.length * 2;
  const stepIndex = stage === 0 ? currentIndex : aspectKeys.length + currentIndex;
  const progress = (stepIndex / totalSteps) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
}

function getImportanceFeedback(val) {
  const v = Number(val);
  if (v <= 20) return 'Totalmente irrelevante';
  if (v <= 40) return 'Pouco importante';
  if (v <= 60) return 'Importância moderada';
  if (v <= 80) return 'Importante';
  return 'Muito importante';
}

function getLevelFeedback(val, key) {
  const msgs = levelMessages[key];
  if (!msgs) return '';
  const idx = Math.min(4, Math.floor(Number(val) / 20));
  return msgs[idx];
}

function updateFeedback() {
  const key = aspectKeys[currentIndex];
  sliderFeedback.textContent = stage === 0
    ? getImportanceFeedback(slider.value)
    : getLevelFeedback(slider.value, key);
}

slider.addEventListener('input', updateFeedback);

document.getElementById('next-btn').addEventListener('click', () => {
  const key = aspectKeys[currentIndex];
  if (!responses[key]) responses[key] = { importance: 50, level: 50 };
  if (stage === 0) {
    responses[key].importance = Number(slider.value);
    currentIndex++;
    if (currentIndex < aspectKeys.length) {
      showQuestion();
    } else {
      if (pendingReturnPage) {
        localStorage.setItem('responses', JSON.stringify(responses));
        document.getElementById('question-screen').classList.add('hidden');
        document.getElementById('main-header').classList.remove('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        suppressVoting = true;
        showPage(pendingReturnPage);
        suppressVoting = false;
        pendingReturnPage = null;
      } else {
        currentIndex = 0;
        stage = 1;
        document.getElementById('question-screen').classList.add('hidden');
        playIntro(levelIntroMessages, 'intro-level', () => {
          document.getElementById('question-screen').classList.remove('hidden');
          showQuestion();
        });
      }
    }
  } else {
    responses[key].level = Number(slider.value);
    currentIndex++;
    if (currentIndex < aspectKeys.length) {
      showQuestion();
    } else {
      localStorage.setItem('responses', JSON.stringify(responses));
      localStorage.setItem('levelDone', 'true');
      levelDone = true;
      document.getElementById('question-screen').classList.add('hidden');
      if (pendingReturnPage) {
        document.getElementById('main-header').classList.remove('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        initStats(aspectKeys, responses, statsColors, aspectsData);
        suppressVoting = true;
        showPage(pendingReturnPage);
        suppressVoting = false;
        pendingReturnPage = null;
      } else {
        document.getElementById('oath-text').textContent = buildOath();
        document.getElementById('name-screen').classList.remove('hidden');
      }
    }
  }
});

document.getElementById('agree').addEventListener('change', checkStartReady);
document.getElementById('username').addEventListener('input', checkStartReady);

function checkStartReady() {
  const agree = document.getElementById('agree').checked;
  const name = document.getElementById('username').value.trim();
  document.getElementById('start-btn').disabled = !(agree && name);
}

document.getElementById('start-btn').addEventListener('click', () => {
      document.getElementById('name-screen').classList.add('hidden');
      initApp(true);
    });

function buildOath() {
  const parts = [];
  for (const key of aspectKeys) {
    const res = responses[key];
    if (res.importance >= 7) {
      parts.push(aspectsData[key].speech);
    }
  }
  return parts.length ? 'Eu prometo ' + parts.join(' ') : '';
}

function initApp(firstTime) {
  const now = Date.now();
  previousLogin = Number(localStorage.getItem('lastLogin')) || now;
  localStorage.setItem('lastLogin', now);
  if (firstTime) {
    localStorage.setItem('responses', JSON.stringify(responses));
    const name = document.getElementById('username').value.trim();
    localStorage.setItem('username', name);
    localStorage.setItem('introDone', 'true');
  } else {
    responses = JSON.parse(localStorage.getItem('responses') || '{}');
  }
  buildOptions();
  initTasks(aspectKeys, tasksData, aspectsData);
  initLaws(aspectKeys, lawsData, statsColors);
  initStats(aspectKeys, responses, statsColors, aspectsData);
  initMindset(aspectKeys, mindsetData, statsColors);
  initHistory(aspectsData);
  scheduleNotifications();
  document.getElementById('main-header').classList.remove('hidden');
  document.getElementById('main-content').classList.remove('hidden');
  if (window.innerWidth <= 600) {
    initCarousel();
  }
}

function applyTheme(theme) {
  if (theme === 'turquoise') theme = 'neon';
  document.body.classList.remove('black', 'turquoise', 'neon', 'whitecolor', 'minimalist');
  document.body.classList.add(theme);
  localStorage.setItem('theme', theme);
  savedTheme = theme;
}

function buildOptions() {
  const container = document.getElementById('options-content');
  container.innerHTML = '';

  const themeDiv = document.createElement('div');
  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Tema:';
  const themeSelect = document.createElement('select');
  [
    { value: 'black', label: 'Black' },
    { value: 'neon', label: 'Futurista Neon' },
    { value: 'whitecolor', label: 'White and Color' },
    { value: 'minimalist', label: 'Minimalist' }
  ].forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.value;
    opt.textContent = t.label;
    themeSelect.appendChild(opt);
  });
  themeSelect.value = savedTheme;
  themeSelect.addEventListener('change', e => applyTheme(e.target.value));
  themeDiv.appendChild(themeLabel);
  themeDiv.appendChild(themeSelect);
  container.appendChild(themeDiv);

  const bgDiv = document.createElement('div');
  const bgLabel = document.createElement('label');
  bgLabel.textContent = 'Imagem de fundo:';
  const bgInput = document.createElement('input');
  bgInput.type = 'file';
  bgInput.accept = 'image/*';
  bgInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('customBg', reader.result);
      document.body.style.backgroundImage = `url(${reader.result})`;
    };
    reader.readAsDataURL(file);
  });
  bgDiv.appendChild(bgLabel);
  bgDiv.appendChild(bgInput);
  container.appendChild(bgDiv);

  const aspectColors = JSON.parse(localStorage.getItem('aspectColors') || '{}');
  aspectKeys.forEach(k => {
    const colorWrap = document.createElement('div');
    const colorLabel = document.createElement('label');
    colorLabel.textContent = `${k} cor:`;
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = aspectColors[k] || '#ffffff';
    colorInput.addEventListener('input', e => {
      aspectColors[k] = e.target.value;
      statsColors[k] = [e.target.value, e.target.value];
      localStorage.setItem('aspectColors', JSON.stringify(aspectColors));
    });
    colorWrap.appendChild(colorLabel);
    colorWrap.appendChild(colorInput);
    container.appendChild(colorWrap);
  });

  const categories = [
    { title: 'Princípios fundamentais', filter: v => v === 10 },
    { title: 'Pilares de uma vida equilibrada', filter: v => v >= 8 && v <= 9 },
    { title: 'Pontos a trabalhar a longo prazo', filter: v => v >= 6 && v <= 7 }
  ];
  categories.forEach(cat => {
    const aspects = aspectKeys.filter(k => cat.filter(responses[k]?.importance));
    if (!aspects.length) return;
    const h = document.createElement('h2');
    h.textContent = cat.title;
    container.appendChild(h);
    aspects.sort((a, b) => responses[b].importance - responses[a].importance || a.localeCompare(b));
    aspects.forEach(k => {
      const p = document.createElement('p');
      p.textContent = `${aspectsData[k].speech} Importância: ${responses[k].importance}.`;
      container.appendChild(p);
    });
  });
}

function scheduleNotifications() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const now = Date.now();
  tasks.forEach(t => {
    const time = new Date(t.startTime).getTime();
    if (time > now) {
      setTimeout(() => {
        new Notification('Mr.President | New Task |', { body: t.title });
      }, time - now);
    }
  });
}

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', e => {
    const page = e.currentTarget.getAttribute('data-page');
    showPage(page);
  });
});

function initCarousel() {
  const items = [
    { page: 'tasks', img: 'acoes.png', label: 'Tarefas' },
    { page: 'laws', img: 'leis.png', label: 'Leis' },
    { page: 'stats', img: 'estatisticas.png', label: 'Estatísticas' },
    { page: 'mindset', img: 'mindset.png', label: 'Mindset' },
    { page: 'options', img: 'constituicao.png', label: 'Opções' },
    { page: 'history', img: 'historico.png', label: 'Histórico' }
  ];
  let idx = 0;
  const img = document.createElement('img');
  menuCarousel.appendChild(img);

  function render() {
    const item = items[idx];
    img.src = item.img;
    img.alt = item.label;
    showPage(item.page);
  }

  render();

  let startX = 0;
  menuCarousel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });
  menuCarousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) {
      idx = (idx - 1 + items.length) % items.length;
      render();
    } else if (dx < -50) {
      idx = (idx + 1) % items.length;
      render();
    }
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(sec => sec.classList.remove('active'));
  const section = document.getElementById(pageId);
  if (section) section.classList.add('active');
  if (!suppressVoting) {
    if (pageId === 'laws') startMattersVoting();
    if (pageId === 'stats' && !levelDone) startLevelVoting();
  }
}

function startMattersVoting() {
  pendingReturnPage = 'laws';
  currentIndex = 0;
  stage = 0;
  document.getElementById('main-header').classList.add('hidden');
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('question-screen').classList.remove('hidden');
  showQuestion();
}

function startLevelVoting() {
  pendingReturnPage = 'stats';
  currentIndex = 0;
  stage = 1;
  document.getElementById('main-header').classList.add('hidden');
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('question-screen').classList.remove('hidden');
  showQuestion();
}

