(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Light up a diagram's data-step elements in order, replaying while it is on screen
  document.querySelectorAll('[data-diagram]').forEach(fig => {
    const els = [...fig.querySelectorAll('[data-step]')];
    const last = Math.max(...els.map(el => +el.dataset.step));
    const show = n => els.forEach(el => { if (+el.dataset.step === n) el.classList.add('on'); });
    if (reduce) { for (let n = 1; n <= last; n++) show(n); return; }

    let running = false, visible = false;
    const run = async () => {
      running = true;
      while (visible) {
        fig.classList.add('reset');
        els.forEach(el => el.classList.remove('on'));
        void fig.offsetWidth;
        fig.classList.remove('reset');
        await sleep(400);
        for (let n = 1; n <= last; n++) { show(n); await sleep(380); }
        await sleep(3000);
      }
      running = false;
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) run();
    }, { threshold: 0.35 }).observe(fig);
  });
})();
