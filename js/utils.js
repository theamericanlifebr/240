export function applyCascade(container) {
  [...container.children].forEach((child, idx) => {
    child.classList.add('cascade-item');
    child.style.animationDelay = `${idx * 0.1}s`;
  });
}

export function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#','');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const soundMap = {
  click: new Audio('sounds/click.wav'),
  type: new Audio('sounds/type.mp3'),
  taskcomplete: new Audio('sounds/taskcomplete.wav'),
  newtask: new Audio('sounds/newtask.wav'),
  newlaw: new Audio('sounds/newlaw.wav')
};

export function playSound(name) {
  const sound = soundMap[name];
  if (sound) {
    const clone = sound.cloneNode();
    clone.play();
  }
}
