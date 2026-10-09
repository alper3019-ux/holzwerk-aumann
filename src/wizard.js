/** Mehrstufige Anfrage (Projekt → Maße → Fotos → Kontakt). Demo: sendet und speichert nichts. */
export function initWizard(form, reduceMotion) {
  const panels = [...form.querySelectorAll('[data-panel]')];
  const dots = [...form.querySelectorAll('[data-dot]')];
  const prev = form.querySelector('[data-prev]');
  const next = form.querySelector('[data-next]');
  const submit = form.querySelector('[data-submit]');
  const live = form.querySelector('[data-wizard-live]');
  const result = form.querySelector('[data-result]');
  const navBar = form.querySelector('[data-nav]');
  const thumbs = form.querySelector('[data-thumbs]');
  const upload = form.querySelector('[data-upload]');
  const dotsList = form.querySelector('.wizard__steps');
  let current = 1;
  let photos = [];

  const withTransition = (fn) => {
    if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(fn);
    else fn();
  };
  const err = (key, show, inputs = []) => {
    const el = form.querySelector(`[data-error="${key}"]`);
    if (!el) return;
    el.hidden = !show;
    if (!el.id) el.id = `err-${key}`;
    inputs.forEach((i) => {
      if (show) { i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', el.id); }
      else { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); }
    });
  };

  function validate(step) {
    let firstBad = null;
    if (step === 1) {
      const radios = [...form.querySelectorAll('[name="projektart"]')];
      const ok = radios.some((r) => r.checked);
      err('projektart', !ok, radios);
      if (!ok) firstBad = radios[0];
    }
    if (step === 2) {
      const nums = ['breite', 'hoehe', 'tiefe'].map((n) => form.elements[n]);
      const bad = nums.filter((i) => i.value !== '' && !i.checkValidity());
      err('masse', bad.length > 0, bad.length ? bad : nums);
      if (bad.length) firstBad = bad[0];
    }
    if (step === 4) {
      const name = form.elements.name; const email = form.elements.email; const tel = form.elements.telefon; const ds = form.elements.datenschutz;
      const nameOk = name.value.trim().length > 1;
      err('name', !nameOk, [name]);
      const emailVal = email.value.trim(); const telVal = tel.value.trim();
      const emailOk = emailVal === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      const telOk = telVal === '' || /^[+\d][\d\s/()-]{5,}$/.test(telVal);
      const contactOk = (emailVal !== '' || telVal !== '') && emailOk && telOk;
      err('kontakt', !contactOk, [email, tel]);
      err('datenschutz', !ds.checked, [ds]);
      firstBad = !nameOk ? name : !contactOk ? (emailOk && emailVal ? tel : email) : !ds.checked ? ds : null;
    }
    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  function show(step, focus = true) {
    current = step;
    panels.forEach((p) => { p.hidden = Number(p.dataset.panel) !== step; });
    dots.forEach((d) => {
      const n = Number(d.dataset.dot);
      if (n === step) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      d.classList.toggle('is-done', n < step);
    });
    prev.hidden = step === 1;
    next.hidden = step === panels.length;
    submit.hidden = step !== panels.length;
    const legend = panels[step - 1].querySelector('.wizard__legend');
    live.textContent = `Schritt ${step} von ${panels.length}: ${legend.textContent}`;
    if (focus) legend.focus();
  }

  next.addEventListener('click', () => { if (validate(current)) withTransition(() => show(current + 1)); });
  prev.addEventListener('click', () => withTransition(() => show(current - 1)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (current < panels.length) { if (validate(current)) withTransition(() => show(current + 1)); return; }
    if (!validate(current)) return;
    const data = new FormData(form);
    const rows = [
      ['Projektart', data.get('projektart')],
      ['Zeitraum', data.get('zeitraum') || 'Noch offen'],
      ['Maße (B × H × T)', data.get('unbekannt') ? 'Beim Aufmaß klären' : ['breite', 'hoehe', 'tiefe'].map((k) => data.get(k) || '–').join(' × ') + ' cm'],
      ['Notiz', data.get('notiz') || '–'],
      ['Fotos', photos.length ? `${photos.length} ausgewählt (nicht hochgeladen)` : 'keine'],
      ['Name', data.get('name')],
      ['Kontakt', [data.get('email'), data.get('telefon')].filter(Boolean).join(' · ')],
      ['PLZ / Ort', data.get('ort') || '–'],
      ['Rückruf', data.get('rueckruf') || 'Egal'],
    ];
    const dl = result.querySelector('[data-summary]');
    dl.replaceChildren(...rows.flatMap(([k, v]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; return [dt, dd]; }));
    withTransition(() => {
      panels.forEach((p) => { p.hidden = true; });
      navBar.hidden = true; dotsList.hidden = true;
      result.hidden = false;
      live.textContent = 'Demo beendet. Es wurde nichts gesendet.';
      result.focus();
    });
  });

  form.querySelector('[data-restart]').addEventListener('click', () => {
    form.reset(); clearPhotos();
    form.querySelectorAll('[aria-invalid]').forEach((i) => { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
    form.querySelectorAll('[data-error]').forEach((e) => { e.hidden = true; });
    withTransition(() => { result.hidden = true; navBar.hidden = false; dotsList.hidden = false; show(1); });
  });

  /* Fotos: nur lokale Vorschau per Object-URL, kein Upload */
  function render() {
    thumbs.replaceChildren(...photos.map((p, i) => {
      const li = document.createElement('li');
      const img = document.createElement('img'); img.src = p.url; img.alt = `Vorschau: ${p.name}`;
      const b = document.createElement('button'); b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', `Foto ${p.name} entfernen`);
      b.addEventListener('click', () => { URL.revokeObjectURL(p.url); photos.splice(i, 1); render(); upload.focus(); });
      li.append(img, b); return li;
    }));
  }
  function addFiles(list) {
    const imgs = [...list].filter((f) => f.type.startsWith('image/'));
    const room = 6 - photos.length;
    imgs.slice(0, Math.max(0, room)).forEach((f) => photos.push({ name: f.name, url: URL.createObjectURL(f) }));
    err('fotos', imgs.length > room);
    render();
    upload.value = '';
  }
  function clearPhotos() { photos.forEach((p) => URL.revokeObjectURL(p.url)); photos = []; render(); }
  upload.addEventListener('change', () => addFiles(upload.files));
  const drop = upload.closest('.upload');
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-drag'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-drag')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); });

  show(1, false);
}
