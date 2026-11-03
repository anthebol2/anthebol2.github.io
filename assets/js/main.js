/* Small, optional enhancements. All page content is available without JavaScript. */
(function () {
  'use strict';

  function enhance() {
    var root = document.documentElement;
    var logoAssets = {
      final: 'assets/img/orangutan.svg?v=2',
      editorial: 'assets/img/site-mark.svg?v=5',
      geometric: 'assets/img/site-mark-geometric.svg?v=1',
      orbit: 'assets/img/site-mark-orbit.svg?v=1',
      ligature: 'assets/img/site-mark-ligature.svg?v=1',
      aperture: 'assets/img/site-mark-aperture.svg?v=1',
      ribbon: 'assets/img/site-mark-ribbon.svg?v=1',
      seal: 'assets/img/site-mark-seal.svg?v=1',
      blueprint: 'assets/img/site-mark-blueprint.svg?v=1'
    };
    var logoAsset = logoAssets[root.getAttribute('data-logo')] || logoAssets.final;
    var headerLogo = document.querySelector('[data-logo-image]');
    var favicon = document.getElementById('siteFavicon');
    if (headerLogo) headerLogo.src = logoAsset;
    if (favicon) favicon.href = logoAsset;
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Older theme previews use this class to reveal their content.
    document.querySelectorAll('.section, .pub, .timeline__item, .award').forEach(function (element) {
      element.classList.add('reveal-in');
    });

    function watchMedia(query, callback) {
      if (!query) return;
      if (query.addEventListener) query.addEventListener('change', callback);
      else if (query.addListener) query.addListener(callback);
    }

    // Keep native anchor navigation, including the user's motion preference.
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    function updateMotion() {
      root.style.scrollBehavior = reducedMotion && reducedMotion.matches ? 'auto' : '';
    }
    updateMotion();
    watchMedia(reducedMotion, updateMotion);

    var themeButton = document.getElementById('themeToggle');
    var savedTheme = null;
    try { savedTheme = window.localStorage.getItem('theme'); } catch (error) {}

    function isTheme(value) { return value === 'light' || value === 'dark'; }
    function preferredTheme() { return 'light'; }
    function setTheme(theme) {
      root.setAttribute('data-theme', theme);
      if (!themeButton) return;
      var isDark = theme === 'dark';
      var label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      themeButton.setAttribute('aria-label', label);
      themeButton.setAttribute('title', label);
      themeButton.setAttribute('aria-pressed', String(isDark));
    }

    setTheme(isTheme(savedTheme) ? savedTheme : preferredTheme());
    if (themeButton) {
      themeButton.addEventListener('click', function () {
        savedTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(savedTheme);
        try { window.localStorage.setItem('theme', savedTheme); } catch (error) {}
      });
    }
    window.addEventListener('storage', function (event) {
      if (event.key !== 'theme' && event.key !== null) return;
      savedTheme = event.newValue;
      setTheme(isTheme(savedTheme) ? savedTheme : preferredTheme());
    });

    var header = document.querySelector('.nav');
    var menuButton = document.getElementById('navToggle');
    var menu = document.getElementById('primaryNav') || document.querySelector('.nav__links');
    var mobile = window.matchMedia && window.matchMedia('(max-width: 760px)');
    var closeAppearance = function () {};
    var closeMenu = function () {};

    if (menuButton && menu) {
      if (!menu.id) menu.id = 'primaryNav';
      menuButton.setAttribute('aria-controls', menu.id);

      function setMenu(open, returnFocus) {
        if (open) closeAppearance();
        menu.classList.toggle('is-open', open);
        menuButton.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        if (returnFocus) menuButton.focus();
      }
      closeMenu = function () { setMenu(false); };

      setMenu(false);
      menuButton.addEventListener('click', function () {
        var open = menuButton.getAttribute('aria-expanded') !== 'true';
        setMenu(open);
        // The links precede the toggle in the document, so place keyboard
        // focus inside the opened menu before normal tab navigation resumes.
        var firstLink = open && menu.querySelector('a[href]');
        if (firstLink) firstLink.focus();
      });
      menu.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('a');
        if (link && menu.contains(link)) setMenu(false);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
          setMenu(false, true);
        }
      });
      document.addEventListener('click', function (event) {
        if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
      });
      document.addEventListener('focusin', function (event) {
        if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
      });
      watchMedia(mobile, function () {
        // Clear stale state when crossing either side of the mobile breakpoint.
        setMenu(false, mobile.matches && menu.contains(document.activeElement));
      });

      // Activate the collapsible menu only once its controls are ready.
      root.classList.add('js');
    }

    var appearance = document.getElementById('appearancePanel');
    if (appearance) {
      var summary = appearance.querySelector('summary');
      var accentButtons = appearance.querySelectorAll('[data-accent-choice]');
      var fontChoice = document.getElementById('fontChoice');
      var accents = ['muted-navy', 'original-blue', 'slate-blue', 'steel-blue', 'denim', 'midnight'];
      var fonts = ['editorial', 'inter', 'source', 'georgia'];

      function validChoice(value, options) { return options.indexOf(value) !== -1; }
      function readChoice(key) {
        try { return window.localStorage.getItem(key); } catch (error) { return null; }
      }
      function saveChoice(key, value) {
        try { window.localStorage.setItem(key, value); } catch (error) {}
      }
      function updatePreviewChoice(key, value) {
        try {
          var url = new URL(window.location.href);
          if (!url.searchParams.has(key)) return;
          url.searchParams.set(key, value);
          window.history.replaceState(window.history.state, '', url.href);
        } catch (error) {}
      }
      function setAccent(value) {
        var accent = validChoice(value, accents) ? value : 'muted-navy';
        root.setAttribute('data-accent', accent);
        accentButtons.forEach(function (button) {
          button.setAttribute('aria-pressed', String(button.getAttribute('data-accent-choice') === accent));
        });
      }
      function setFont(value) {
        var font = validChoice(value, fonts) ? value : 'editorial';
        root.setAttribute('data-font', font);
        if (fontChoice) fontChoice.value = font;
      }

      var initialAccent = readChoice('site-accent');
      var initialFont = readChoice('site-font');
      try {
        var parameters = new URLSearchParams(window.location.search);
        var previewAccent = parameters.get('color');
        var previewFont = parameters.get('font');
        if (validChoice(previewAccent, accents)) {
          initialAccent = previewAccent;
          saveChoice('site-accent', initialAccent);
        }
        if (validChoice(previewFont, fonts)) {
          initialFont = previewFont;
          saveChoice('site-font', initialFont);
        }
      } catch (error) {}
      setAccent(initialAccent);
      if (fontChoice) setFont(initialFont);

      accentButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var accent = button.getAttribute('data-accent-choice');
          if (!validChoice(accent, accents)) return;
          setAccent(accent);
          saveChoice('site-accent', accent);
          updatePreviewChoice('color', accent);
        });
      });
      if (fontChoice) {
        fontChoice.addEventListener('change', function () {
          if (!validChoice(fontChoice.value, fonts)) return;
          setFont(fontChoice.value);
          saveChoice('site-font', fontChoice.value);
          updatePreviewChoice('font', fontChoice.value);
        });
      }
      window.addEventListener('storage', function (event) {
        if (event.key === 'site-accent' || event.key === null) setAccent(event.newValue);
        if (fontChoice && (event.key === 'site-font' || event.key === null)) setFont(event.newValue);
      });

      closeAppearance = function (returnFocus) {
        appearance.open = false;
        if (returnFocus && summary) summary.focus();
      };
      appearance.addEventListener('toggle', function () {
        if (appearance.open) closeMenu();
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && appearance.open) {
          event.preventDefault();
          closeAppearance(true);
        }
      });
      document.addEventListener('click', function (event) {
        if (appearance.open && !appearance.contains(event.target)) closeAppearance();
      });
      document.addEventListener('focusin', function (event) {
        if (appearance.open && !appearance.contains(event.target)) closeAppearance();
      });
      appearance.hidden = false;
    }

    // Progressive enhancement: original image links still work without JS.
    var figureDialog = document.getElementById('figureDialog');
    var figureLinks = Array.prototype.slice.call(document.querySelectorAll('.pub__media'));
    if (figureDialog && typeof figureDialog.showModal === 'function' && figureLinks.length) {
      var figureImage = document.getElementById('figureDialogImage');
      var figureTitle = document.getElementById('figureDialogTitle');
      var figureOriginal = document.getElementById('figureOriginal');
      var figureCounter = document.getElementById('figureCounter');
      var figurePrevious = document.getElementById('figurePrevious');
      var figureNext = document.getElementById('figureNext');
      var figureClose = document.getElementById('figureClose');
      var figureIndex = 0;
      var figureTrigger = null;

      function displayFigure(index) {
        figureIndex = Math.max(0, Math.min(figureLinks.length - 1, index));
        var link = figureLinks[figureIndex];
        var originalImage = link.querySelector('img');
        var name = link.closest('.pub').querySelector('.pub__name');
        figureImage.src = link.href;
        figureImage.alt = originalImage.alt;
        figureTitle.textContent = name.textContent.replace(/:\s*$/, '') + ' — figure';
        figureOriginal.href = link.href;
        figureCounter.textContent = (figureIndex + 1) + ' / ' + figureLinks.length;
        figurePrevious.disabled = figureIndex === 0;
        figureNext.disabled = figureIndex === figureLinks.length - 1;
      }
      figureLinks.forEach(function (link, index) {
        link.setAttribute('aria-haspopup', 'dialog');
        link.setAttribute('aria-controls', 'figureDialog');
        link.addEventListener('click', function (event) {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          figureTrigger = link;
          displayFigure(index);
          figureDialog.showModal();
          root.classList.add('figure-open');
          figureClose.focus();
        });
      });
      figureClose.addEventListener('click', function () { figureDialog.close(); });
      figurePrevious.addEventListener('click', function () { displayFigure(figureIndex - 1); });
      figureNext.addEventListener('click', function () { displayFigure(figureIndex + 1); });
      figureDialog.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          displayFigure(figureIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
      });
      figureDialog.addEventListener('click', function (event) {
        var rect = figureDialog.getBoundingClientRect();
        if (event.target === figureDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) figureDialog.close();
      });
      figureDialog.addEventListener('close', function () {
        root.classList.remove('figure-open');
        if (figureTrigger) figureTrigger.focus({ preventScroll: true });
      });
    }

    var hero = document.getElementById('about');
    var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
    if (hero && finePointer && finePointer.matches) {
      var landscapeFrame = 0;
      var pointerX = 0;
      var pointerY = 0;
      function resetLandscape() {
        if (landscapeFrame) window.cancelAnimationFrame(landscapeFrame);
        landscapeFrame = 0;
        hero.style.setProperty('--scene-shift-x', '0px');
        hero.style.setProperty('--scene-shift-y', '0px');
        hero.style.setProperty('--light-x', '68%');
        hero.style.setProperty('--light-y', '35%');
      }
      hero.addEventListener('pointermove', function (event) {
        if ((reducedMotion && reducedMotion.matches) || root.getAttribute('data-about-style') !== 'glass') return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (landscapeFrame) return;
        landscapeFrame = window.requestAnimationFrame(function () {
          landscapeFrame = 0;
          var bounds = hero.getBoundingClientRect();
          var x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
          var y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));
          hero.style.setProperty('--scene-shift-x', ((.5 - x) * 22).toFixed(1) + 'px');
          hero.style.setProperty('--scene-shift-y', ((.5 - y) * 14).toFixed(1) + 'px');
          hero.style.setProperty('--light-x', (x * 100).toFixed(1) + '%');
          hero.style.setProperty('--light-y', (y * 100).toFixed(1) + '%');
        });
      }, { passive: true });
      hero.addEventListener('pointerleave', resetLandscape);
      watchMedia(reducedMotion, function () { if (reducedMotion.matches) resetLandscape(); });
    }

    var navLinks = menu ? Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]')) : [];
    var sections = navLinks.map(function (link) {
      var id;
      try { id = decodeURIComponent(link.getAttribute('href').slice(1)); } catch (error) { return null; }
      var section = id && document.getElementById(id);
      return section ? { link: link, section: section } : null;
    }).filter(Boolean).sort(function (a, b) {
      return a.section.compareDocumentPosition(b.section) & 2 ? 1 : -1;
    });

    if (!sections.length) return;
    var readingProgress = document.getElementById('readingProgress');
    var framePending = false;
    function updateActiveSection() {
      framePending = false;
      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var readingLine = headerHeight + Math.min(160, window.innerHeight * 0.2);
      var current = sections[0];
      sections.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= readingLine) current = item;
      });

      var documentHeight = root.scrollHeight;
      if (readingProgress) {
        var scrollable = documentHeight - window.innerHeight;
        var progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
        readingProgress.style.transform = 'scaleX(' + progress + ')';
      }
      if (documentHeight > window.innerHeight + 2 && window.scrollY + window.innerHeight >= documentHeight - 2) {
        current = sections[sections.length - 1];
      }
      navLinks.forEach(function (link) {
        var active = link === current.link;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function scheduleActiveSection() {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateActiveSection);
    }
    window.addEventListener('scroll', scheduleActiveSection, { passive: true });
    window.addEventListener('resize', scheduleActiveSection);
    window.addEventListener('load', scheduleActiveSection);
    window.addEventListener('hashchange', scheduleActiveSection);
    updateActiveSection();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
})();
