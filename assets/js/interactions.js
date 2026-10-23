(() => {
  const paths = {Paper:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>', Website:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>', Slides:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0 5-3 5 3M7 8h10m-10 4h6"/>'};
  paths.Code = '<path d="M9 21v-4c-4 1-4-2-6-2m12 6v-4c0-1-.3-2-1-2.5 4-.5 6-2 6-6 0-1.5-.5-3-1.5-4 .3-1 .3-2-.1-3-2 0-3 1-4 1.5a15 15 0 0 0-6 0C7.4 2.5 6.4 1.5 4.4 1.5c-.4 1-.4 2-.1 3-1 1-1.5 2.5-1.5 4 0 4 2 5.5 6 6-.7.5-1 1.5-1 2.5"/>';
  document.querySelectorAll('.pub__links a, .pub__links .resource-pending').forEach(a => {
    const key = Object.keys(paths).find(k => a.textContent.includes(k));
    if(key) a.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[key]}</svg>`);
  });
  const menus = [...document.querySelectorAll('.appearance')];
  menus.forEach(menu => menu.addEventListener('toggle', () => {
    if(menu.open) menus.filter(other => other !== menu).forEach(other => other.open = false);
  }));
  document.addEventListener('click', e => menus.forEach(menu => {if(!menu.contains(e.target)) menu.open = false;}));
  document.addEventListener('keydown', e => {if(e.key === 'Escape') menus.forEach(menu => {if(menu.open) {menu.open = false; menu.querySelector('summary').focus();}});});
  const photoNote = document.querySelector('.photo-memento');
  if (photoNote) {
    const trigger = document.getElementById('photoNoteOpen');
    const card = document.getElementById('photoNoteCard');
    const close = card.querySelector('.photo-card__close');
    const setOpen = (open, returnFocus = false) => {
      card.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      photoNote.classList.toggle('is-open', open);
      if (open) { menus.forEach(menu => menu.open = false); card.focus({preventScroll:true}); }
      else if (returnFocus) trigger.focus({preventScroll:true});
    };
    trigger.addEventListener('click', () => setOpen(card.hidden));
    close.addEventListener('click', () => setOpen(false, true));
    document.addEventListener('pointerdown', e => {
      if (!card.hidden && !photoNote.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !card.hidden) { e.preventDefault(); setOpen(false, true); }
    });
    document.addEventListener('focusin', e => {
      if (!card.hidden && !photoNote.contains(e.target)) setOpen(false);
    });
    // The full photograph takes over focus; return to this keepsake afterward.
    document.addEventListener('photo-viewer:open', () => setOpen(false));
    document.addEventListener('photo-viewer:close', () => setOpen(true));
  }
  const qrDialog = document.getElementById('wechatDialog');
  const qrOpen = document.getElementById('wechatOpen');
  if (qrDialog && qrOpen) {
    const qr = document.getElementById('wechatQR');
    const loaded = () => {
      qr.hidden = false;
      document.getElementById('wechatMissing').hidden = true;
      document.getElementById('wechatDownload').hidden = false;
    };
    qr.addEventListener('load', loaded);
    qr.addEventListener('error', () => {
      qr.hidden = true;
      document.getElementById('wechatMissing').hidden = false;
    });
    if(qr.complete && qr.naturalWidth) loaded();
    qrOpen.addEventListener('click', () => {
      qrDialog.showModal();
      qrOpen.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('figure-open');
    });
    qrDialog.querySelector('.wechat-close').addEventListener('click', () => qrDialog.close());
    qrDialog.addEventListener('click', e => {
      const rect = qrDialog.getBoundingClientRect();
      if(e.target === qrDialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) qrDialog.close();
    });
    qrDialog.addEventListener('close', () => {
      document.documentElement.classList.remove('figure-open');
      qrOpen.setAttribute('aria-expanded', 'false');
      qrOpen.focus({preventScroll:true});
    });
  }
})();
