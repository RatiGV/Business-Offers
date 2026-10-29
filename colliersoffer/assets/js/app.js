(function () {
  'use strict';
  var CATEGORIES = [
    { key: 'it', name: 'IT და პროგრამირება', short: 'IT და პროგრამირება', icon: 'i-it', wide: true },
    { key: 'data', name: 'მონაცემები და AI', short: 'მონაცემები და AI', icon: 'i-data' },
    { key: 'design', name: 'დიზაინი და კრეატივი', short: 'დიზაინი', icon: 'i-design' },
    { key: 'marketing', name: 'მარკეტინგი და კომუნიკაცია', short: 'მარკეტინგი', icon: 'i-marketing' },
    { key: 'management', name: 'მენეჯმენტი და გაყიდვები', short: 'მენეჯმენტი', icon: 'i-management' },
    { key: 'finance', name: 'ფინანსები და ბუღალტერია', short: 'ფინანსები', icon: 'i-finance' },
    { key: 'hr', name: 'HR და განვითარება', short: 'HR', icon: 'i-hr' }
  ];
  var MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
  var courses = (window.COURSES || []).map(function (c) {
    var final = c.price - c.discount;
    return Object.assign({}, c, {
      final: final,
      percent: Math.round((c.discount / c.price) * 100),
      upcoming: isUpcoming(c.start)
    });
  });
  var catByKey = {};
  CATEGORIES.forEach(function (cat) { catByKey[cat.key] = cat; });
  var state = { cat: 'all', q: '', sort: 'discount' };
  var $ = function (id) { return document.getElementById(id); };
  var grid = $('grid');
  var chips = $('chips');
  var bento = $('bento');
  var catbar = $('catbar');
  var search = $('search');
  var sort = $('sort');
  var empty = $('empty');
  function isUpcoming(iso) {
    if (!iso) return false;
    var today = new Date();
    var t = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    return iso >= t;
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function formatDate(iso) {
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1];
  }
  function money(n) { return n.toLocaleString('en-US').replace(/,/g, ' '); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function icon(id) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function countFor(key) {
    return key === 'all' ? courses.length : courses.filter(function (c) { return c.cat === key; }).length;
  }
  function maxDiscountFor(key) {
    return courses.reduce(function (m, c) { return c.cat === key && c.discount > m ? c.discount : m; }, 0);
  }
  /* ---------- Stats ---------- */
  function renderStats() {
    var stats = {
      count: courses.length,
      cats: CATEGORIES.length,
      maxDiscount: courses.reduce(function (m, c) { return Math.max(m, c.discount); }, 0),
      maxPercent: courses.reduce(function (m, c) { return Math.max(m, c.percent); }, 0)
    };
    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var v = stats[el.getAttribute('data-stat')];
      if (v !== undefined) el.textContent = v;
    });
  }
  /* ---------- Category bar, bento, chips ---------- */
  function renderCatbar() {
    var html = '<a href="#courses" data-cat="all">ყველა კურსი</a>';
    CATEGORIES.forEach(function (cat) {
      html += '<a href="#courses" data-cat="' + cat.key + '">' + esc(cat.short) + '</a>';
    });
    catbar.innerHTML = html;
  }
  function renderBento() {
    bento.innerHTML = CATEGORIES.map(function (cat) {
      var n = countFor(cat.key);
      return '<button type="button" class="tile cat-' + cat.key + (cat.wide ? ' tile--wide' : '') + '" data-cat="' + cat.key + '">' +
        '<span class="tile__icon">' + icon(cat.icon) + '</span>' +
        '<span class="tile__name">' + esc(cat.name) + '</span>' +
        '<span class="tile__meta"><b>' + n + ' კურსი</b>ფასდაკლება ' + maxDiscountFor(cat.key) + ' ₾-მდე</span>' +
        '<span class="tile__link">კურსების ნახვა ' + icon('i-arrow') + '</span>' +
        '<span class="tile__deco" aria-hidden="true">' + icon(cat.icon) + '</span>' +
        '</button>';
    }).join('');
  }
  function renderChips() {
    var list = [{ key: 'all', name: 'ყველა', icon: 'i-all' }].concat(CATEGORIES);
    chips.innerHTML = list.map(function (cat) {
      return '<button type="button" class="chip" data-cat="' + cat.key + '" aria-pressed="' + (state.cat === cat.key) + '">' +
        esc(cat.name) + '<span class="chip__count">' + countFor(cat.key) + '</span></button>';
    }).join('');
  }
  function syncActive() {
    chips.querySelectorAll('.chip').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === state.cat));
    });
    catbar.querySelectorAll('a').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-cat') === state.cat);
    });
  }
  /* ---------- Courses ---------- */
  function filtered() {
    var q = norm(state.q);
    var list = courses.filter(function (c) {
      if (state.cat !== 'all' && c.cat !== state.cat) return false;
      if (!q) return true;
      var hay = norm(c.title + ' ' + (c.lecturer || '') + ' ' + catByKey[c.cat].name);
      return q.split(' ').every(function (w) { return hay.indexOf(w) !== -1; });
    });
    var sorters = {
      'discount': function (a, b) { return b.discount - a.discount || b.percent - a.percent || a.final - b.final; },
      'price-asc': function (a, b) { return a.final - b.final; },
      'price-desc': function (a, b) { return b.final - a.final; },
      'start': function (a, b) {
        if (a.upcoming !== b.upcoming) return a.upcoming ? -1 : 1;
        if (a.upcoming) return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
        return a.title.localeCompare(b.title, 'ka');
      },
      'az': function (a, b) { return a.title.localeCompare(b.title, 'ka'); }
    };
    return list.sort(sorters[state.sort] || sorters.discount);
  }
  function cardHTML(c) {
    var cat = catByKey[c.cat];
    var srcs = [c.img, c.img2].filter(Boolean);
    var media = srcs.length
      ? '<img src="' + esc(srcs[0]) + '"' + (srcs[1] ? ' data-alt="' + esc(srcs[1]) + '"' : '') + ' alt="" loading="lazy" decoding="async" width="880" height="462">'
      : '<span class="card__fallback">' + esc(c.title) + '</span>';
    var meta = '';
    if (c.lecturer) meta += '<span>' + icon('i-user') + esc(c.lecturer) + '</span>';
    if (c.upcoming) meta += '<span>' + icon('i-cal') + 'დაწყება: ' + formatDate(c.start) + '</span>';
    return '<a class="card cat-' + c.cat + '" href="' + esc(c.url) + '" target="_blank" rel="noopener">' +
      '<div class="card__media">' + media + '<span class="card__badge">-' + c.discount + ' ₾</span></div>' +
      '<div class="card__body">' +
        '<span class="card__tag">' + icon(cat.icon) + esc(cat.name) + '</span>' +
        '<h3 class="card__title">' + esc(c.title) + '</h3>' +
        (meta ? '<div class="card__meta">' + meta + '</div>' : '') +
        '<div class="card__foot">' +
          '<div class="price">' +
            '<span class="price__old"><span class="visually-hidden">ძველი ფასი: </span>' + money(c.price) + ' ₾</span>' +
            '<span class="price__new"><span class="visually-hidden">ახალი ფასი: </span>' + money(c.final) + '<small>₾</small></span>' +
            '<span class="price__save">დაზოგე ' + c.discount + ' ₾</span>' +
          '</div>' +
          '<span class="card__cta">დეტალურად ' + icon('i-arrow') + '</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }
  /* Image fallback chain: webp -> png/jpg (data-alt) -> course title text */
  function onImgError() {
    var img = this;
    var alt = img.getAttribute('data-alt');
    if (alt) {
      img.removeAttribute('data-alt');
      img.src = alt;
      return;
    }
    img.removeEventListener('error', onImgError);
    var span = document.createElement('span');
    span.className = 'card__fallback';
    span.textContent = img.closest('.card').querySelector('.card__title').textContent;
    img.replaceWith(span);
  }
  function renderGrid() {
    var list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    grid.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', onImgError);
      if (img.complete && !img.naturalWidth) onImgError.call(img);
    });
    empty.hidden = list.length > 0;
  }
  function setCat(key, scroll) {
    state.cat = key;
    syncActive();
    renderGrid();
    if (scroll) $('courses').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  /* ---------- Events ---------- */
  function onCatClick(e) {
    var el = e.target.closest('[data-cat]');
    if (!el) return;
    e.preventDefault();
    setCat(el.getAttribute('data-cat'), el.tagName !== 'BUTTON' || el.classList.contains('tile'));
  }
  chips.addEventListener('click', onCatClick);
  bento.addEventListener('click', onCatClick);
  catbar.addEventListener('click', onCatClick);
  var t;
  search.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = search.value; renderGrid(); }, 120);
  });
  sort.addEventListener('change', function () { state.sort = sort.value; renderGrid(); });
  $('resetFilters').addEventListener('click', function () {
    search.value = '';
    state.q = '';
    setCat('all', false);
  });
  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    return t || (mq.matches ? 'dark' : 'light');
  }
  function updateToggleLabel() {
    $('themeToggle').setAttribute('aria-label', currentTheme() === 'dark' ? 'ღია თემაზე გადართვა' : 'მუქ თემაზე გადართვა');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#111315' : '#25408F');
  }
  $('themeToggle').addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('bgoffer-theme', next); } catch (e) {}
    updateToggleLabel();
  });
  if (mq.addEventListener) mq.addEventListener('change', updateToggleLabel);
  /* ---------- Init ---------- */
  $('year').textContent = new Date().getFullYear();
  renderStats();
  renderCatbar();
  renderBento();
  renderChips();
  syncActive();
  renderGrid();
  updateToggleLabel();
})();
