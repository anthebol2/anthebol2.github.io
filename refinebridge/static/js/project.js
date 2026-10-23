(() => {
  const asset = document.querySelector('#asset');
  const model = document.querySelector('#model');
  const metric = document.querySelector('#metric');
  const chart = document.querySelector('#chart');
  function update() {
    const rows = window.RESULTS.filter(r => r.asset === asset.value);
    const m = Number(model.value), k = Number(metric.value);
    const max = Math.max(...rows.flatMap(r => [r.values[m][k], r.values[m][k+2], r.values[m][k+4]]));
    chart.replaceChildren();
    const tbody = document.querySelector('#selected-results tbody');
    tbody.replaceChildren();
    const title = `${asset.value} · ${model.selectedOptions[0].text} · ${metric.selectedOptions[0].text}`;
    document.querySelector('#selected-caption').textContent = title + ' — lower is better';
    chart.setAttribute('aria-label', title + '. Exact values in the table below.');
    rows.forEach(r => {
      const values = [r.values[m][k], r.values[m][k+2], r.values[m][k+4]];
      const group = document.createElement('div'); group.className = 'bar-group';
      values.forEach((v, i) => {
        const bar = document.createElement('div'); bar.className = 'bar ' + ['original', 'lora', 'bridge'][i];
        bar.style.height = `${v / max * 100}%`;
        bar.title = `${r.h} days · ${['Original', 'LoRA', 'RefineBridge'][i]}: ${v.toFixed(3)}`;
        group.append(bar);
      });
      const label = document.createElement('span'); label.className = 'bar-label'; label.textContent = r.h; group.append(label); chart.append(group);
      const tr = document.createElement('tr');
      const change = (values[0] - values[2]) / values[0] * 100;
      [r.h + ' days', ...values.map(v => v.toFixed(3)), `${change.toFixed(1)}%`].forEach((v,i) => {
        const cell = document.createElement(i === 0 ? 'th' : 'td'); cell.textContent = v;
        if(i === 0) cell.scope = 'row';
        if(i > 0 && i < 4 && values[i-1] === Math.min(...values)) cell.className = 'best';
        tr.append(cell);
      }); tbody.append(tr);
    });
  }
  if (window.RESULTS) {
    document.querySelector('#explorer').hidden = false;
    [asset, model, metric].forEach(el => el.addEventListener('change', update)); update();
  }
  document.querySelector('#copy').addEventListener('click', async () => {
    const bib = document.querySelector('#bib');
    const status = document.querySelector('#copy-status');
    try { await navigator.clipboard.writeText(bib.textContent); status.textContent = 'BibTeX copied to clipboard.'; }
    catch { const range = document.createRange(); range.selectNodeContents(bib); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); status.textContent = 'Citation selected. Press Ctrl+C or Command+C to copy.'; }
  });
  const viewer = document.querySelector('#viewer');
  let opener;
  if(typeof viewer.showModal === 'function') {
    document.querySelectorAll('a.zoom').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); opener = a;
      const image = document.querySelector('#viewer-image'); image.src = a.href; image.alt = a.querySelector('img').alt;
      viewer.showModal();
    }));
    document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', e => { if(e.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => { if(opener) opener.focus(); });
  }
  if('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('nav a')];
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting) links.forEach(a => {
        const active = a.hash === '#' + e.target.id;
        a.classList.toggle('active', active);
        if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
      });
    }), {rootMargin:'-15% 0px -55% 0px'});
    links.forEach(a => observer.observe(document.querySelector(a.hash)));
  }
})();
