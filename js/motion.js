(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $ = (root, sel) => [...root.querySelectorAll(sel)];

  // Replay a panel's animation while it is on screen; show its end state if motion is reduced
  function loop(fig, { reset, play, finish }) {
    if (reduce) { finish(); return; }
    let running = false, visible = false;
    const clear = () => {
      fig.classList.add('reset');
      reset();
      void fig.offsetWidth;
      fig.classList.remove('reset');
    };
    const run = async () => {
      running = true;
      while (visible) {
        clear();
        await sleep(400);
        await play();
        await sleep(2800);
      }
      running = false;
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) run();
    }, { threshold: 0.35 }).observe(fig);
  }

  async function type(el, text, ms) {
    el.textContent = ''; el.classList.add('caret');
    for (const ch of text) { el.textContent += ch; await sleep(ms); }
    el.classList.remove('caret');
  }
  async function stream(el, text, ms) {
    el.textContent = '';
    for (const w of text.split(' ')) { el.textContent += (el.textContent ? ' ' : '') + w; await sleep(ms); }
  }

  // 1. Chat question routed through agents, answer streamed with citations
  $(document, '[data-motion="chat"]').forEach(fig => {
    const q = fig.querySelector('.type'), a = fig.querySelector('.stream');
    const bot = fig.querySelector('.bubble.bot'), cites = fig.querySelector('.cites');
    const step = n => $(fig, `[data-step="${n}"]`).forEach(el => el.classList.add('on'));
    const Q = q.dataset.text, A = a.dataset.text;
    loop(fig, {
      reset() { q.textContent = ''; a.textContent = ''; $(fig, '.on').forEach(el => el.classList.remove('on')); },
      async play() {
        await type(q, Q, 32); await sleep(300);
        step(1); await sleep(500);
        step(2); await sleep(650);
        step(3); await sleep(600);
        bot.classList.add('on'); await stream(a, A, 70);
        cites.classList.add('on');
      },
      finish() { q.textContent = Q; a.textContent = A; [1, 2, 3].forEach(step); bot.classList.add('on'); cites.classList.add('on'); },
    });
  });

  // 2. History draws, forecast and confidence band follow, then demand drivers grow
  $(document, '[data-motion="forecast"]').forEach(fig => {
    const fc = fig.querySelector('.fc').dataset.pts.trim().split(/\s+/).map(p => p.split(',').map(Number));
    const upper = fc.map(([x, y], i) => `${x},${y - (4 + i * 3.2)}`);
    const lower = fc.map(([x, y], i) => `${x},${y + (4 + i * 3.2)}`).reverse();
    fig.querySelector('.band').setAttribute('points', upper.concat(lower).join(' '));
    const parts = ['.hist', '.fc', '.band', '.bars', '.today-label'].map(s => fig.querySelector(s));
    const on = (...els) => els.forEach(el => el && el.classList.add('on'));
    loop(fig, {
      reset() { parts.forEach(el => el && el.classList.remove('on')); },
      async play() {
        on(parts[0]); await sleep(1700);
        on(parts[1], parts[2], parts[4]); await sleep(1500);
        on(parts[3]); await sleep(1200);
      },
      finish() { on(...parts); },
    });
  });

  // 3. Rep scores each doctor, then the best next action wins
  $(document, '[data-motion="reco"]').forEach(fig => {
    const flows = $(fig, '.flow'), scores = $(fig, '.score');
    loop(fig, {
      reset() { fig.classList.remove('decided'); [...flows, ...scores].forEach(el => el.classList.remove('on')); },
      async play() {
        for (let i = 0; i < flows.length; i++) {
          flows[i].classList.add('on'); await sleep(320);
          scores[i].classList.add('on'); await sleep(220);
        }
        await sleep(500);
        fig.classList.add('decided');
      },
      finish() { [...flows, ...scores].forEach(el => el.classList.add('on')); fig.classList.add('decided'); },
    });
  });
})();
