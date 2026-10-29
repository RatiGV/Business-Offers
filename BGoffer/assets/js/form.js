/* Lead form: fills course dropdown (alphabet ASC) and submits via AJAX to send.php */
(function () {
  var form = document.getElementById('leadForm');
  if (!form) return;
  var select = document.getElementById('leadCourse');
  var msg = document.getElementById('leadMsg');
  var btn = form.querySelector('button[type="submit"]');
  var titles = (window.COURSES || []).map(function (c) { return c.title; });
  titles = titles.filter(function (t, i) { return titles.indexOf(t) === i; });
  titles.sort(function (a, b) { return a.localeCompare(b, 'ka'); });
  titles.forEach(function (t) {
    var o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    select.appendChild(o);
  });
  function setMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'lead__msg ' + (ok ? 'is-ok' : 'is-err');
  }
  function valid(el) {
    var v = el.value.trim();
    var ok = v !== '';
    if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (ok && el.type === 'tel') ok = /^[0-9+()\s-]{6,}$/.test(v);
    el.closest('.field').classList.toggle('is-invalid', !ok);
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('[required]');
    var ok = true;
    for (var i = 0; i < fields.length; i++) ok = valid(fields[i]) && ok;
    if (!ok) { setMsg('გთხოვ, სწორად შეავსო ყველა ველი.', false); return; }
    var data = new FormData(form);
    data.append('device', JSON.stringify({
      userAgent: navigator.userAgent,
      platform: navigator.platform || '',
      language: navigator.language || '',
      screen: screen.width + 'x' + screen.height,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || '')
    }));
    btn.disabled = true;
    setMsg('იგზავნება...', true);
    fetch('send.php', { method: 'POST', body: data, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { form.reset(); setMsg('მადლობა! განაცხადი გაიგზავნა, მალე დაგიკავშირდებით.', true); }
        else setMsg((res && res.error) || 'გაგზავნა ვერ მოხერხდა, სცადე ხელახლა.', false);
      })
      .catch(function () { setMsg('გაგზავნა ვერ მოხერხდა, სცადე ხელახლა.', false); })
      .then(function () { btn.disabled = false; });
  });
  form.addEventListener('input', function (e) {
    if (e.target.closest('.field.is-invalid')) valid(e.target);
  });
})();
