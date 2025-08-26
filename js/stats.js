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

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('stats-circle');
  svg.setAttribute('width', '300');
  svg.setAttribute('height', '300');
  svg.setAttribute('viewBox', '0 0 300 300');
  svg.setAttribute('overflow', 'visible');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  circle.setAttribute('cx', '150');
  circle.setAttribute('cy', '150');
  circle.setAttribute('r', String(radius));
  circle.setAttribute('stroke-width', '18');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke-dasharray', String(circumference));
  const circuloAvaliacao = circle; // círculo de avaliação
  svg.appendChild(circuloAvaliacao);
  display.appendChild(svg);

  const name = document.createElement('div');
  name.className = 'stats-name';
  container.appendChild(name);

  const barraAvaliacao = document.createElement('input');
  barraAvaliacao.type = 'range';
  barraAvaliacao.className = 'barra-avaliacao';
  barraAvaliacao.min = '0';
  barraAvaliacao.max = '100';
  container.appendChild(barraAvaliacao);

  function setCircle(level) {
    const color = getColor(level);
    circuloAvaliacao.setAttribute('stroke', color);
    circuloAvaliacao.style.filter = `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`;
    circuloAvaliacao.setAttribute('stroke-dashoffset', String(circumference * (1 - level / 100)));
  }

  function updateBar(level) {
    const color = getColor(level);
    barraAvaliacao.style.setProperty('--barra-cor', color);
    barraAvaliacao.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${level}%, #333 ${level}%)`;
  }

  function animateCircle(target, duration, start = 0) {
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const level = start + (target - start) * progress;
      setCircle(level);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
      animateCircle(100, 1000, 0);
    } else {
      const storedLevel = responses[key]?.level;
      if (storedLevel != null) {
        barraAvaliacao.style.display = 'none';
        setCircle(storedLevel);
      } else {
        barraAvaliacao.style.display = 'block';
        barraAvaliacao.value = '50';
        updateBar(50);
        animateCircle(50, 1000, 0);
        barraAvaliacao.oninput = () => {
          const val = parseInt(barraAvaliacao.value, 10);
          setCircle(val);
          updateBar(val);
        };
        barraAvaliacao.onchange = () => {
          const val = parseInt(barraAvaliacao.value, 10);
          responses[key] = { ...(responses[key] || {}), level: val };
          localStorage.setItem('responses', JSON.stringify(responses));
          barraAvaliacao.style.display = 'none';
        };
      }
    }
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
