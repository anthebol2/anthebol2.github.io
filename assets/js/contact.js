(() => {
  'use strict';

  const initialiseContact = () => {
    const trigger = document.getElementById('emailOpen');
    const dialog = document.getElementById('emailDialog');
    const address = document.getElementById('emailAddress');
    const copyButton = document.getElementById('emailCopy');
    const status = document.getElementById('emailStatus');
    if (!trigger || !dialog || !address || !copyButton || !status || typeof dialog.showModal !== 'function') return;

    const root = document.documentElement;
    let returnFocus = trigger;
    let copying = false;

    trigger.addEventListener('click', (event) => {
      // Modified clicks retain the link's native mailto behaviour.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (dialog.open) {
        event.preventDefault();
        return;
      }
      returnFocus = document.activeElement;
      status.textContent = '';
      try {
        dialog.showModal();
      } catch (_) {
        // Keep the mailto link usable if a browser cannot open the dialog.
        return;
      }
      event.preventDefault();
      root.classList.add('figure-open');
    });

    dialog.querySelectorAll('[data-email-close]').forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });

    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        dialog.close();
      }
    });

    // Escape uses the native dialog cancellation behaviour and reaches this too.
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) root.classList.remove('figure-open');
      if (returnFocus && returnFocus.isConnected && typeof returnFocus.focus === 'function') {
        returnFocus.focus({ preventScroll: true });
      }
    });

    copyButton.addEventListener('click', async () => {
      if (copying) return;
      copying = true;
      copyButton.disabled = true;
      status.textContent = '';
      let copied = false;
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          try {
            await navigator.clipboard.writeText(address.value);
            copied = true;
          } catch (_) {
            // Older browsers and denied clipboard permissions use selection below.
          }
        }
        if (!copied) {
          address.focus({ preventScroll: true });
          address.select();
          address.setSelectionRange(0, address.value.length);
          if (typeof document.execCommand === 'function') {
            try {
              copied = document.execCommand('copy');
            } catch (_) {
              copied = false;
            }
          }
        }
        status.textContent = copied
          ? 'Email address copied. Paste it into your preferred email app.'
          : 'Automatic copying is unavailable. The address is selected: press and hold to copy, or use Ctrl+C (⌘C on Mac).';
      } finally {
        copying = false;
        copyButton.disabled = false;
        if (copied && dialog.open) copyButton.focus({ preventScroll: true });
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseContact, { once: true });
  else initialiseContact();
})();
