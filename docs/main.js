const FONT_SIZE = 100;
const FONT_SPACE = 0.8;
const CHARS_PER_LINE = 8;
let isInFromState = true;
let isUpdateable = true;

function init() {
  const location = window.location.search;
  const from = new URLSearchParams(location).get('from');
  from !== null && (document.getElementById('from-text').value = from);
  const to = new URLSearchParams(location).get('to');
  to !== null && (document.getElementById('to-text').value = to);
  setupOutContainer();
}

function fromTextChanged() {
  updateSearchParams('from', document.getElementById('from-text').value);
  setupOutContainer();
}

function toTextChanged() {
  updateSearchParams('to', document.getElementById('to-text').value);
}

function updateSearchParams(key, value) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
  history.pushState(null, '', newRelativePathQuery);
}

function setupOutContainer() {
  const fromText = document.getElementById('from-text').value;
  const displayText = document.getElementById('display-text');
  const nextElements = [];
  for (let i = 0; char = fromText[i]; i++) {
    const charElement = document.createElement('span');
    charElement.className = 'char';
    styleChar(charElement, i, fromText);
    const charContentElement = document.createElement('span');
    charContentElement.className = 'char-content';
    charContentElement.innerHTML = char.toUpperCase();
    const keyframeElement = document.createElement('style');
    keyframeElement.innerHTML = `@keyframes movement-${i} {
      from {
        transform: 
          translate(${-10 + 20 * Math.random()}px, ${-10 + 20 * Math.random()}px) 
          rotate(${-10 + 20 * Math.random()}deg);
      }
      to {
        transform: 
          translate(${-10 + 20 * Math.random()}px, ${-10 + 20 * Math.random()}px) 
          rotate(${-10 + 20 * Math.random()}deg);
      }
    }`;
    charContentElement.style = `
      width: ${FONT_SIZE * FONT_SPACE}px;
      animation-delay: -${Math.random() * 5}s;
      animation: fire-animation ${2 + 3 * Math.random()}s ease-in-out infinite alternate, movement-${i} ${2 + 3 * Math.random()}s ease-in-out infinite alternate;
    `;
    charContentElement.appendChild(keyframeElement);
    charElement.appendChild(charContentElement);
    nextElements.push(charElement);
  }
  displayText.replaceChildren(...nextElements);
}

function reorder(reorderPosition, toText) {
  const displayText = document.getElementById('display-text');
  displayText.childNodes.forEach((e, i) => {
    styleChar(e, reorderPosition[i], toText);
  });
}

function styleChar(e, i, text) {
  const textData = Array.from(text).reduce((agg, char, j) => {
    let rtn = {
      ...agg
    };
    if (CHARS_PER_LINE <= agg.indexCurrentLine && char === ' ') {
      rtn.text = agg.text + '\n';
      rtn.indexCurrentLine = 0;
      rtn.lines = agg.lines + 1;
    } else {
      rtn.text = agg.text + char;
      rtn.indexCurrentLine = agg.indexCurrentLine + 1;
    }
    if (i === j) {
      rtn.searchLine = agg.lines - 1;
      rtn.searchIndex = agg.indexCurrentLine;
    }
    return rtn;
  }, {
    text: '',
    indexCurrentLine: 0,
    lines: 1,
    searchLine: undefined,
    searchIndex: undefined,
  });

  let baseOffsetX = 0;
  let baseOffsetY = 0;
  let size = 0;

  if (textData.searchLine !== undefined && textData.searchIndex !== undefined) {
    size = FONT_SIZE;
    textArr = textData.text.split('\n');
    baseOffsetX = (textData.searchIndex - (textArr[textData.searchLine].length / 2)) * size * FONT_SPACE;
    baseOffsetY = ((textData.searchLine * size) - size) * 1.2;
  }

  e.style = `
      font-size: ${size}px;
      transform: translate(${baseOffsetX}px, ${baseOffsetY}px);
    `;
}

function animateText() {
  const fromText = document.getElementById('from-text').value.toUpperCase();
  const toText = document.getElementById('to-text').value.toUpperCase();
  let text = '';
  const next = [];
  if (isInFromState) {
    text = toText;
    const usedLetters = [];
    Array.from(fromText).forEach((char, i) => {
      const alreadyFoundCount = usedLetters.filter(c => c === char).length;
      usedLetters.push(char);
      next[i] = toText.split(char, alreadyFoundCount + 1).join(char).length
    });
    isInFromState = false;
  } else {
    text = fromText;
    Array.from(fromText).forEach((char, i) => next[i] = i);
    isInFromState = true;
  }
  reorder(next, text);
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});