(() => {
  const openButton = document.querySelector('[data-photo-viewer-open]');
  if (!openButton || typeof HTMLDialogElement === 'undefined') return;
  const preview = openButton.querySelector('img');
  if (!preview) return;
  const card = openButton.closest('.photo-card');
  const viewer = document.createElement('dialog');
  viewer.id = 'filmViewer';
  viewer.className = 'film-viewer';
  viewer.setAttribute('aria-labelledby', 'filmViewerTitle');
  viewer.setAttribute('aria-describedby', 'filmViewerMetadata');
  viewer.innerHTML = `
    <div class="film-viewer__layout">
      <header class="film-viewer__header">
        <div class="film-viewer__identity">
          <p class="film-viewer__kicker">From my film roll</p>
          <h2 id="filmViewerTitle"></h2>
          <p class="film-viewer__metadata" id="filmViewerMetadata"></p>
        </div>
        <div class="film-viewer__tools" aria-label="Photograph controls">
          <button type="button" class="film-viewer__button" data-film-fit aria-label="Fit the full photograph in the viewer" aria-pressed="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/></svg><span>Fit</span></button>
          <button type="button" class="film-viewer__button" data-film-zoom aria-label="Zoom in to explore the photograph" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M10 7v6m-3-3h6"/></svg><span>Zoom</span></button>
          <button type="button" class="film-viewer__button film-viewer__close" aria-label="Close photograph viewer" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
        </div>
      </header>
      <div class="film-viewer__stage" tabindex="0" aria-label="Photograph, scroll to explore when zoomed">
        <div class="film-viewer__space"><button type="button" class="film-viewer__photo" aria-label="Zoom in on the photograph"><img draggable="false" /></button></div>
      </div>
      <footer class="film-viewer__footer"><p data-film-help>Click the photograph to look closer.</p><span class="film-viewer__index">01 / 01</span></footer>
    </div>`;
  viewer.querySelector('h2').textContent = card?.querySelector('h2')?.textContent || 'Yamzho Yumco';
  const details = [...(card?.querySelectorAll('.photo-card__details dd') || [])].map(item => item.textContent.trim());
  const location = card?.querySelector('.photo-card__location')?.textContent.trim() || 'Tibet';
  viewer.querySelector('#filmViewerMetadata').textContent = [location, ...details].join(' · ');
  const image = viewer.querySelector('img');
  image.src = preview.currentSrc || preview.src;
  image.alt = preview.alt;
  document.body.append(viewer);
  openButton.setAttribute('aria-haspopup', 'dialog');
  openButton.setAttribute('aria-controls', viewer.id);

  const stage = viewer.querySelector('.film-viewer__stage');
  const space = viewer.querySelector('.film-viewer__space');
  const photo = viewer.querySelector('.film-viewer__photo');
  const fitButton = viewer.querySelector('[data-film-fit]');
  const zoomButton = viewer.querySelector('[data-film-zoom]');
  const help = viewer.querySelector('[data-film-help]');
  let zoom = 1;
  let fitWidth = 0;
  let fitHeight = 0;
  let drag = null;
  let suppressClick = false;

  const layout = () => {
    if (!viewer.open) return;
    const padding = parseFloat(getComputedStyle(space).paddingLeft) || 24;
    const naturalWidth = image.naturalWidth || Number(preview.getAttribute('width')) || 2870;
    const naturalHeight = image.naturalHeight || Number(preview.getAttribute('height')) || 1925;
    const scale = Math.min((stage.clientWidth - padding * 2) / naturalWidth, (stage.clientHeight - padding * 2) / naturalHeight, 1);
    fitWidth = Math.max(1, naturalWidth * scale);
    fitHeight = Math.max(1, naturalHeight * scale);
    photo.style.width = `${fitWidth * zoom}px`;
    photo.style.height = `${fitHeight * zoom}px`;
    space.style.width = `${Math.max(stage.clientWidth, fitWidth * zoom + padding * 2)}px`;
    space.style.height = `${Math.max(stage.clientHeight, fitHeight * zoom + padding * 2)}px`;
    viewer.classList.toggle('is-zoomed', zoom > 1);
    fitButton.setAttribute('aria-pressed', String(zoom === 1));
    zoomButton.setAttribute('aria-pressed', String(zoom > 1));
    photo.setAttribute('aria-label', zoom > 1 ? 'Return to the full photograph' : 'Zoom in on the photograph');
    help.textContent = zoom > 1 ? 'Drag or scroll to explore. Click to see the full frame.' : 'Click the photograph to look closer.';
  };
  const setZoom = (nextZoom, point) => {
    const rect = photo.getBoundingClientRect();
    const focusX = point ? Math.min(1, Math.max(0, (point.x - rect.left) / rect.width)) : .5;
    const focusY = point ? Math.min(1, Math.max(0, (point.y - rect.top) / rect.height)) : .5;
    zoom = nextZoom;
    layout();
    const padding = parseFloat(getComputedStyle(space).paddingLeft) || 24;
    stage.scrollLeft = padding + fitWidth * zoom * focusX - stage.clientWidth / 2;
    stage.scrollTop = padding + fitHeight * zoom * focusY - stage.clientHeight / 2;
  };

  openButton.addEventListener('click', () => {
    if (viewer.open) return;
    document.dispatchEvent(new CustomEvent('photo-viewer:open'));
    zoom = 1;
    viewer.showModal();
    document.body.classList.add('film-viewer-open');
    layout();
    stage.scrollTop = stage.scrollLeft = 0;
  });
  viewer.querySelector('.film-viewer__close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('cancel', event => { event.preventDefault(); viewer.close(); });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('film-viewer-open');
    viewer.classList.remove('is-dragging');
    drag = null;
    document.dispatchEvent(new CustomEvent('photo-viewer:close'));
    openButton.focus({preventScroll:true});
  });
  fitButton.addEventListener('click', () => setZoom(1));
  zoomButton.addEventListener('click', () => setZoom(zoom > 1 ? 1 : 2));
  photo.addEventListener('click', event => {
    if (suppressClick) { suppressClick = false; return; }
    setZoom(zoom > 1 ? 1 : 2, event.detail ? {x:event.clientX,y:event.clientY} : undefined);
  });
  // Mouse dragging complements native touch scrolling without blocking gestures.
  stage.addEventListener('pointerdown', event => {
    if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {x:event.clientX,y:event.clientY,left:stage.scrollLeft,top:stage.scrollTop,moved:false};
  });
  stage.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) {
      drag.moved = true;
      if (!stage.hasPointerCapture(event.pointerId)) stage.setPointerCapture(event.pointerId);
      viewer.classList.add('is-dragging');
      stage.scrollLeft = drag.left - dx;
      stage.scrollTop = drag.top - dy;
    }
  });
  const endDrag = () => {
    if (drag?.moved) {
      suppressClick = true;
      // A captured pointer can deliver its click to the stage instead of the image.
      setTimeout(() => { suppressClick = false; }, 0);
    }
    drag = null;
    viewer.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  viewer.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(2); }
    else if (event.key === '-' || event.key === '0') { event.preventDefault(); setZoom(1); }
  });
  image.addEventListener('load', layout);
  window.addEventListener('resize', layout);
})();
