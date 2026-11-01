(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Count the hero numbers up from zero
  document.querySelectorAll('.stat b').forEach(el => {
    const m = el.textContent.match(/^(\D*)([\d.,]+)(.*)$/);
    if (!m || reduce) return;
    const [, pre, raw, post] = m, num = raw.replace(/,/g, ''), target = parseFloat(num), dec = (num.split('.')[1] || '').length;
    const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const final = el.textContent, start = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? pre + fmt(target * e) + post : final;
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = pre + fmt(0) + post;
    requestAnimationFrame(tick);
    // Animation frames pause in background tabs; never leave a zero showing
    setTimeout(() => { el.textContent = final; }, dur + 300);
  });

  // Fade sections and cards up as they enter
  const targets = document.querySelectorAll('.section-title, .card, .job, .case .results, .case figure, .two > div');
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  targets.forEach(el => io.observe(el));

  // Progress bar and active nav link
  const bar = document.querySelector('.progress');
  const links = [...document.querySelectorAll('.nav a')];
  // Case studies sit after Background but belong to Work
  const marks = links.map((a, i) => [i, document.querySelector(a.getAttribute('href'))]);
  const work = links.findIndex(a => a.getAttribute('href') === '#work');
  const cases = document.getElementById('cases');
  if (cases && work >= 0) marks.splice(marks.length - 1, 0, [work, cases]);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    let current = -1;
    marks.forEach(([i, s]) => { if (s && s.getBoundingClientRect().top < 120) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
