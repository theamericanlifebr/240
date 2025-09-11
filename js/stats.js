let aspectKeys = [];
let responses = {};
let statsColors = {};
let aspectsData = {};
let currentIndex = 0;

// Mapeia o nível para a cor correspondente
function getColor(level) {
  if (level <= 20) return '#ff0000';
  if (level <= 30) return '#ffa500';
  if (level <= 50) return '#ffff00';
  if (level <= 65) return '#00ffff';
  if (level <= 80) return '#00ff00';
  return '#40e0d0';
}

// Frases para cada aspecto e faixa de pontuação
const phraseRanges = {
  'Nutrição': [
    { max: 10, text: 'Minha alimentação é péssima e desregulada.' },
    { max: 20, text: 'Como sem pensar, geralmente coisas ruins.' },
    { max: 30, text: 'Como mal quase todos os dias.' },
    { max: 40, text: 'Tento melhorar, mas como mal na maior parte do tempo.' },
    { max: 50, text: 'Consigo fazer escolhas boas às vezes, mas não sustento.' },
    { max: 60, text: 'Mantenho certa regularidade, mas ainda consumo muita besteira.' },
    { max: 70, text: 'Tenho equilíbrio básico, mas falta disciplina.' },
    { max: 80, text: 'Escolho alimentos melhores na maioria das vezes.' },
    { max: 90, text: 'Sigo uma rotina alimentar saudável com raras exceções.' },
    { max: 95, text: 'Minha alimentação é excelente e bem estruturada.' },
    { max: 100, text: 'Minha alimentação é excelente, periódica e otimizada.' }
  ],
  'Exercícios': [
    { max: 10, text: 'Nunca pratico atividade física.' },
    { max: 20, text: 'Faço atividade física muito raramente.' },
    { max: 30, text: 'Movimentação mínima, sem rotina.' },
    { max: 40, text: 'Pratico de vez em quando, sem consistência.' },
    { max: 50, text: 'Faço alguma atividade leve ocasional.' },
    { max: 60, text: 'Exercito-me de forma irregular, mas já comecei a cuidar.' },
    { max: 70, text: 'Tenho uma frequência razoável, mas sem plano claro.' },
    { max: 80, text: 'Pratico exercícios regularmente, ainda que sem intensidade.' },
    { max: 90, text: 'Tenho rotina definida, que me mantém ativo.' },
    { max: 95, text: 'Treino bem, com disciplina e resultados.' },
    { max: 100, text: 'Minha prática de exercícios é consistente e estruturada.' }
  ],
  'Financeiro': [
    { max: 10, text: 'Vivo endividado, sem controle.' },
    { max: 20, text: 'Sempre gasto mais do que ganho.' },
    { max: 30, text: 'Consigo pagar contas, mas nunca sobra nada.' },
    { max: 40, text: 'Tento controlar, mas não acompanho de verdade.' },
    { max: 50, text: 'Faço algum planejamento, mas não sigo.' },
    { max: 60, text: 'Consigo equilibrar entradas e saídas básicas.' },
    { max: 70, text: 'Já consigo guardar um pouco por mês.' },
    { max: 80, text: 'Tenho planejamento e sigo na maior parte do tempo.' },
    { max: 90, text: 'Poupo com frequência e faço boas escolhas financeiras.' },
    { max: 95, text: 'Invisto e administro meu dinheiro com consciência.' },
    { max: 100, text: 'Tenho plena saúde financeira, segurança e crescimento.' }
  ],
  'Relacionamentos': [
    { max: 10, text: 'Me sinto isolado e desconectado.' },
    { max: 20, text: 'Tenho quase nenhum contato com outras pessoas.' },
    { max: 30, text: 'Relacionamentos superficiais e distantes.' },
    { max: 40, text: 'Consigo me aproximar, mas não mantenho vínculos.' },
    { max: 50, text: 'Tenho amigos ou contatos, mas sem profundidade.' },
    { max: 60, text: 'Mantenho algumas boas conexões.' },
    { max: 70, text: 'Tenho relações mais frequentes e positivas.' },
    { max: 80, text: 'Me sinto apoiado por pessoas próximas.' },
    { max: 90, text: 'Tenho vínculos fortes e saudáveis.' },
    { max: 95, text: 'Relacionamentos sólidos, nutritivos e equilibrados.' },
    { max: 100, text: 'Relacionamentos plenos, de confiança, amor e apoio mútuo.' }
  ],
  'Ambiente': [
    { max: 10, text: 'Meu ambiente é caótico e desorganizado.' },
    { max: 20, text: 'Desordem constante, difícil de viver bem.' },
    { max: 30, text: 'Bagunça atrapalha meu dia a dia.' },
    { max: 40, text: 'Tento organizar, mas logo perco o controle.' },
    { max: 50, text: 'Consigo manter arrumado por pouco tempo.' },
    { max: 60, text: 'Meu ambiente é razoável, mas poderia melhorar.' },
    { max: 70, text: 'Mais organizado, com menos impacto negativo.' },
    { max: 80, text: 'Ambiente limpo e funcional na maior parte do tempo.' },
    { max: 90, text: 'Espaço organizado, agradável e produtivo.' },
    { max: 95, text: 'Ambiente saudável e inspirador.' },
    { max: 100, text: 'Ambiente harmonioso, equilibrado e limpo.' }
  ],
  'Higiene': [
    { max: 10, text: 'Não cuido da minha higiene básica.' },
    { max: 20, text: 'Cuido raramente, de forma descuidada.' },
    { max: 30, text: 'Esqueço com frequência de cuidados pessoais.' },
    { max: 40, text: 'Faço o mínimo, mas de forma irregular.' },
    { max: 50, text: 'Tenho higiene básica, mas não consistente.' },
    { max: 60, text: 'Cuido de forma regular, mas incompleta.' },
    { max: 70, text: 'Higiene boa, com pequenos deslizes.' },
    { max: 80, text: 'Mantenho uma rotina de cuidados pessoais.' },
    { max: 90, text: 'Higiene bem feita, com constância.' },
    { max: 95, text: 'Cuidados completos e conscientes.' },
    { max: 100, text: 'Higiene impecável, rotina sólida e saudável.' }
  ],
  'Trabalho': [
    { max: 10, text: 'Estou parado, sem emprego ou ocupação.' },
    { max: 20, text: 'Trabalho desorganizado, sem direção.' },
    { max: 30, text: 'Atividades soltas, sem impacto.' },
    { max: 40, text: 'Faço algo, mas sem clareza de propósito.' },
    { max: 50, text: 'Trabalho básico, apenas para sobreviver.' },
    { max: 60, text: 'Trabalho estável, mas sem paixão.' },
    { max: 70, text: 'Tenho rotina, mas ainda sem grande realização.' },
    { max: 80, text: 'Trabalho com envolvimento e bons resultados.' },
    { max: 90, text: 'Atuo com disciplina e começo a prosperar.' },
    { max: 95, text: 'Trabalho alinhado aos meus objetivos de vida.' },
    { max: 100, text: 'Trabalho pleno, realizado e com impacto positivo.' }
  ],
  'Energia': [
    { max: 10, text: 'Não tenho lazer algum.' },
    { max: 20, text: 'Raramente descanso ou me divirto.' },
    { max: 30, text: 'Quando tenho lazer, não é satisfatório.' },
    { max: 40, text: 'Tento relaxar, mas não consigo.' },
    { max: 50, text: 'Lazer muito limitado.' },
    { max: 60, text: 'Tenho alguns momentos de lazer.' },
    { max: 70, text: 'Consigo equilibrar lazer e rotina.' },
    { max: 80, text: 'Lazer regular e satisfatório.' },
    { max: 90, text: 'Tenho lazer de qualidade que me recarrega.' },
    { max: 95, text: 'Momentos de lazer nutritivos e inspiradores.' },
    { max: 100, text: 'Lazer equilibrado, saudável e pleno.' }
  ],
  'Propósito': [
    { max: 10, text: 'Não tenho ideia do meu propósito.' },
    { max: 20, text: 'Vivo no automático, sem direção.' },
    { max: 30, text: 'Tento buscar sentido, mas me sinto perdido.' },
    { max: 40, text: 'Tenho noções vagas do que quero.' },
    { max: 50, text: 'Alguma clareza, mas sem consistência.' },
    { max: 60, text: 'Já identifiquei parte do meu propósito.' },
    { max: 70, text: 'Estou alinhando minhas ações com ele.' },
    { max: 80, text: 'Tenho clareza razoável do meu caminho.' },
    { max: 90, text: 'Vivo com foco no que faz sentido pra mim.' },
    { max: 95, text: 'Tenho clareza profunda do meu propósito.' },
    { max: 100, text: 'Minha vida é 100% guiada pelo meu propósito.' }
  ],
  'Emocional': [
    { max: 10, text: 'Totalmente instável, dominado por emoções.' },
    { max: 20, text: 'Perco o controle frequentemente.' },
    { max: 30, text: 'Sofro muito com minhas emoções.' },
    { max: 40, text: 'Consigo lidar às vezes, mas caio facilmente.' },
    { max: 50, text: 'Algum autocontrole, mas ainda frágil.' },
    { max: 60, text: 'Consigo me estabilizar em algumas situações.' },
    { max: 70, text: 'Equilíbrio razoável, mas com recaídas.' },
    { max: 80, text: 'Emoções mais bem controladas.' },
    { max: 90, text: 'Tenho boa inteligência emocional.' },
    { max: 95, text: 'Maturidade emocional sólida.' },
    { max: 100, text: 'Equilíbrio e autocontrole emocional exemplar.' }
  ],
  'Sono': [
    { max: 10, text: 'Não durmo quase nada ou de forma péssima.' },
    { max: 20, text: 'Sono desregulado e de má qualidade.' },
    { max: 30, text: 'Consigo dormir, mas acordo mal.' },
    { max: 40, text: 'Horários irregulares, descanso ruim.' },
    { max: 50, text: 'Alguma regularidade, mas sem qualidade.' },
    { max: 60, text: 'Sono razoável, mas nem sempre reparador.' },
    { max: 70, text: 'Durmo bem na maioria das vezes.' },
    { max: 80, text: 'Boa rotina de sono.' },
    { max: 90, text: 'Sono consistente e reparador.' },
    { max: 95, text: 'Durmo bem todos os dias, com qualidade.' },
    { max: 100, text: 'Sono perfeito, saudável e energizante.' }
  ],
  'Estudo': [
    { max: 10, text: 'Não invisto em aprender nada novo.' },
    { max: 20, text: 'Vivo estagnado, sem evolução.' },
    { max: 30, text: 'Faço pouco, sem disciplina.' },
    { max: 40, text: 'Tentei aprender algo, mas abandonei.' },
    { max: 50, text: 'Aprendo esporadicamente.' },
    { max: 60, text: 'Desenvolvo algumas habilidades básicas.' },
    { max: 70, text: 'Aprendo com alguma regularidade.' },
    { max: 80, text: 'Invisto de verdade em novas habilidades.' },
    { max: 90, text: 'Evoluo constantemente em várias áreas.' },
    { max: 95, text: 'Tenho domínio de habilidades valiosas.' },
    { max: 100, text: 'Vivo em aprendizado contínuo e desenvolvimento.' }
  ]
};

function getPhrase(key, level) {
  const ranges = phraseRanges[key];
  if (!ranges) return '';
  const range = ranges.find(r => level <= r.max);
  return range ? range.text : '';
}

export function initStats(keys, res, colors, aspects) {
  aspectKeys = ['logo', ...keys];
  responses = res;
  statsColors = colors;
  aspectsData = { ...aspects, logo: { image: 'logo.png' } };
  currentIndex = 0;
  buildStats();
}

function buildStats() {
  const container = document.getElementById('stats-content');
  container.innerHTML = '';

  const display = document.createElement('div');
  display.className = 'stats-display';
  container.appendChild(display);

  const img = document.createElement('img');
  img.className = 'stats-aspect-image';
  display.appendChild(img);

  const name = document.createElement('div');
  name.className = 'stats-name';
  container.appendChild(name);

  const phraseEl = document.createElement('div');
  phraseEl.className = 'stats-phrase';
  container.appendChild(phraseEl);

  const barraAvaliacao = document.createElement('input');
  barraAvaliacao.type = 'range';
  barraAvaliacao.className = 'barra-avaliacao';
  barraAvaliacao.min = '0';
  barraAvaliacao.max = '100';
  container.appendChild(barraAvaliacao);

  const barraResultado = document.createElement('div');
  barraResultado.className = 'barra-resultado';
  const barraFill = document.createElement('div');
  barraFill.className = 'fill';
  barraResultado.appendChild(barraFill);
  container.appendChild(barraResultado);

  function updateSlider(level) {
    const color = getColor(level);
    barraAvaliacao.style.setProperty('--barra-cor', color);
    barraAvaliacao.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${level}%, #333 ${level}%)`;
  }

  function updateResult(level) {
    const color = getColor(level);
    barraResultado.style.setProperty('--barra-cor', color);
    barraFill.style.background = color;
    barraFill.style.width = `${level}%`;
  }

  function render() {
    const key = aspectKeys[currentIndex];
    img.src = aspectsData[key].image;
    img.alt = key;
    name.textContent = key === 'logo' ? '' : key;

    barraAvaliacao.oninput = null;
    barraAvaliacao.onchange = null;

    if (key === 'logo') {
      barraAvaliacao.style.display = 'none';
      barraResultado.style.display = 'none';
      phraseEl.textContent = '';
      return;
    }

    const storedLevel = responses[key]?.level;

    function enableRating(level) {
      barraAvaliacao.style.display = 'block';
      barraResultado.style.display = 'none';
      barraAvaliacao.value = String(level);
      updateSlider(level);
      phraseEl.textContent = getPhrase(key, level);
      barraAvaliacao.oninput = () => {
        const val = parseInt(barraAvaliacao.value, 10);
        updateSlider(val);
        phraseEl.textContent = getPhrase(key, val);
      };
      barraAvaliacao.onchange = () => {
        const val = parseInt(barraAvaliacao.value, 10);
        responses[key] = { ...(responses[key] || {}), level: val };
        localStorage.setItem('responses', JSON.stringify(responses));
        barraAvaliacao.style.display = 'none';
        updateResult(val);
        phraseEl.textContent = getPhrase(key, val);
        barraResultado.style.display = 'block';
      };
    }

    if (storedLevel != null) {
      updateResult(storedLevel);
      phraseEl.textContent = getPhrase(key, storedLevel);
      barraAvaliacao.style.display = 'none';
      barraResultado.style.display = 'block';
    } else {
      enableRating(50);
    }

    let clickCount = 0;
    let clickTimer;
    const handleTriple = () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => (clickCount = 0), 600);
      if (clickCount === 3) {
        clickCount = 0;
        enableRating(responses[key]?.level || 50);
      }
    };
    img.onclick = handleTriple;
    img.addEventListener('touchend', handleTriple);
  }

  render();

  let startX = 0;
  container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });
  container.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) {
      currentIndex = (currentIndex - 1 + aspectKeys.length) % aspectKeys.length;
      render();
    } else if (dx < -50) {
      currentIndex = (currentIndex + 1) % aspectKeys.length;
      render();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + aspectKeys.length) % aspectKeys.length;
      render();
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % aspectKeys.length;
      render();
    }
  });
}

export function checkStatsPrompt() {}
