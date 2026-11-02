(() => {
  'use strict';
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.project')];
  const count = document.getElementById('project-count');
  const menu = document.querySelector('.menu-button');
  const navigation = document.getElementById('navigation');
  let currentFilter = 'all';
  function filterProjects(value) {
    currentFilter = value;
    filters.forEach(button => {
      const selected = button.dataset.filter === value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    let visible = 0;
    projects.forEach(project => {
      project.hidden = value !== 'all' && project.dataset.category !== value;
      if (!project.hidden) visible++;
    });
    count.textContent = visible + '개의 프로젝트';
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  function revealHashTarget() {
    const id = decodeURIComponent(location.hash.slice(1));
    const project = projects.find(item => item.id === id);
    if (project && project.hidden) {
      filterProjects('all');
      project.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', revealHashTarget);
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      const project = projects.find(item => item.id === id);
      if (project && project.hidden) filterProjects('all');
      navigation.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    });
  });
  menu.addEventListener('click', () => {
    const isOpen = menu.getAttribute('aria-expanded') === 'true';
    navigation.classList.toggle('open', !isOpen);
    menu.setAttribute('aria-expanded', String(!isOpen));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      navigation.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
  // FNV-1a + Mulberry32, matching nyang_drop/dist/seed.js.
  function seededRandom(seed) {
    const text = String(seed).normalize('NFC').trim();
    let state = 2166136261;
    for (let i = 0; i < text.length; i++) state = Math.imul(state ^ text.charCodeAt(i), 16777619) >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 2 ** 32;
    };
  }
  function sequence(seed) {
    const random = seededRandom(seed);
    return Array.from({length: 10}, () => 1 + Math.floor(random() * 4));
  }
  function renderSequence(id, values) {
    const root = document.getElementById(id);
    root.replaceChildren(...values.map(value => {
      const chip = document.createElement('span');
      chip.dataset.stage = String(value);
      chip.textContent = String(value);
      chip.setAttribute('aria-label', value + '단계');
      return chip;
    }));
  }
  const input = document.getElementById('seed-input');
  function updateDemo() {
    const seed = input.value.normalize('NFC').trim();
    if (!seed) {
      input.setCustomValidity('시드로 사용할 글자나 숫자를 입력해 주세요.');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');
    const a = sequence(seed);
    const b = sequence(seed);
    renderSequence('sequence-a', a);
    renderSequence('sequence-b', b);
    document.getElementById('seed-status').textContent = '✓ 두 번의 실행에서 10개의 등장 단계가 모두 같습니다.';
  }
  input.addEventListener('input', () => input.setCustomValidity(''));
  document.getElementById('seed-form').addEventListener('submit', event => {event.preventDefault();updateDemo();});
  let sample = 0;
  const sampleSeeds = ['nyang', 'portfolio', 'hello', '고양이', 'ian'];
  document.getElementById('new-seed').addEventListener('click', () => {
    input.value = sampleSeeds[sample++ % sampleSeeds.length];
    input.setCustomValidity('');
    updateDemo();
  });
  let printState;
  window.addEventListener('beforeprint', () => {
    printState = {filter: currentFilter, details: [...document.querySelectorAll('main details')].map(element => ({element,open:element.open}))};
    filterProjects('all');
    printState.details.forEach(({element}) => {element.open = true;});
  });
  window.addEventListener('afterprint', () => {
    if (!printState) return;
    filterProjects(printState.filter);
    printState.details.forEach(({element,open}) => {element.open = open;});
    printState = null;
  });
  document.getElementById('print-button').addEventListener('click', () => window.print());
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navigation.querySelectorAll('a[href^="#"]').forEach(link => {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-15% 0px -60% 0px', threshold: 0});
    ['projects', 'explore', 'about', 'contact'].forEach(id => observer.observe(document.getElementById(id)));
  }
  updateDemo();
  revealHashTarget();
})();
