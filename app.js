/* Clinical Systems Support – Templates Hub
   Static app: no build step, no server. Data lives in data.js (published) and
   localStorage (your local edits until you export them). */
(function () {
  'use strict';

  var STORE_KEY = 'clinsys.templates.hub.v1';
  var PUBLISHED = window.TEMPLATE_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  var state = {
    data: null,            // working copy {version, settings, templates, changelog}
    hadLocal: false,
    edit: false,
    query: '',
    cat: 'All',
    open: new Set(),
    values: {},            // templateId -> {fieldName: value}
    closedCats: new Set(),
    editingId: null
  };

  /* ------------------------------------------------------------------ utils */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'template';
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function safeUrl(u) { return /^(https?:|mailto:)/i.test(u) ? u : '#'; }
  function download(name, text, mime) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime || 'text/plain' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------------------------------------------------------- storage */
  function contentKey(d) { return JSON.stringify({ t: d.templates, s: d.settings }); }
  function isModified() { return contentKey(state.data) !== contentKey(PUBLISHED); }

  function persist() {
    if (!isModified()) { localStorage.removeItem(STORE_KEY); state.hadLocal = false; return; }
    var d = clone(state.data); d.basedOn = state.basedOn || PUBLISHED.version;
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
    state.hadLocal = true;
  }
  function log(note) {
    state.data.changelog = state.data.changelog || [];
    state.data.changelog.unshift({ date: today(), note: note });
  }

  function load() {
    state.data = clone(PUBLISHED); state.basedOn = PUBLISHED.version;
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { raw = null; }
    if (!raw || !raw.templates) return;
    if (contentKey(raw) === contentKey(PUBLISHED)) { localStorage.removeItem(STORE_KEY); return; }
    state.data = { version: PUBLISHED.version, settings: raw.settings, templates: raw.templates, changelog: raw.changelog || [] };
    state.basedOn = raw.basedOn || PUBLISHED.version;
    state.hadLocal = true;
  }

  /* ---------------------------------------------------------- field parsing */
  function parseField(inner) {
    var i = inner.indexOf('|');
    var name = (i < 0 ? inner : inner.slice(0, i)).trim();
    var opt = i < 0 ? '' : inner.slice(i + 1).trim();
    var kind = 'text', options = [];
    if (opt.toLowerCase() === 'multiline') kind = 'multiline';
    else if (opt) { kind = 'select'; options = opt.split(';').map(function (s) { return s.trim(); }).filter(Boolean); }
    return { name: name, kind: kind, options: options };
  }
  var SIG_RE = /\{\{\s*(signature|fullSignature)\s*\}\}/g;
  function expandSig(text) {
    var s = state.data.settings || {};
    return String(text || '').replace(SIG_RE, function (_, k) { return (k === 'signature' ? s.signature : s.fullSignature) || ''; });
  }
  function templateFields(t) {
    var all = [t.to, t.cc, t.subject, t.body].map(expandSig).join('\n');
    var seen = {}, out = [], re = /\{\{([^{}]+)\}\}/g, m;
    while ((m = re.exec(all))) {
      var f = parseField(m[1]);
      if (!f.name || seen[f.name]) { if (f.name && f.kind !== 'text' && seen[f.name] && seen[f.name].kind === 'text') { seen[f.name].kind = f.kind; seen[f.name].options = f.options; } continue; }
      seen[f.name] = f; out.push(f);
    }
    return out;
  }
  function sections(t) {
    var lines = String(t.body || '').split('\n'), out = [], cur = { title: null, lines: [] };
    lines.forEach(function (l) {
      var m = /^##\s+(.+)$/.exec(l);
      if (m) { if (cur.title !== null || cur.lines.join('').trim()) out.push(cur); cur = { title: m[1].trim(), lines: [] }; }
      else cur.lines.push(l);
    });
    if (cur.title !== null || cur.lines.join('').trim()) out.push(cur);
    return out.map(function (s) { return { title: s.title, text: s.lines.join('\n').trim() }; });
  }

  /* -------------------------------------------------------------- rendering */
  var INLINE_RE = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\{\{([^{}]+)\}\}/g;

  function fieldText(inner, values) {
    var f = parseField(inner), v = values[f.name];
    return v ? v : '[' + f.name + ']';
  }
  function urlFields(u, values) {
    return u.replace(/\{\{([^{}]+)\}\}/g, function (_, inner) { return fieldText(inner, values); });
  }
  function inline(s, ctx) {
    var out = '', last = 0, m, re = new RegExp(INLINE_RE.source, 'g');
    while ((m = re.exec(s))) {
      out += plain(s.slice(last, m.index), ctx);
      last = re.lastIndex;
      if (m[1] != null) out += ctx.text ? inline(m[1], ctx) : '<strong><em>' + inline(m[1], ctx) + '</em></strong>';
      else if (m[2] != null) out += ctx.text ? inline(m[2], ctx) : '<strong>' + inline(m[2], ctx) + '</strong>';
      else if (m[3] != null) {
        var url = urlFields(m[4], ctx.values), label = inline(m[3], ctx);
        if (ctx.text) {
          var bare = url.replace(/^mailto:/i, '');
          out += (label.indexOf(url) >= 0 || label === bare) ? label : label + ' (' + bare + ')';
        } else out += '<a href="' + esc(safeUrl(url)) + '" target="_blank" rel="noopener">' + label + '</a>';
      } else {
        var f = parseField(m[5]), v = ctx.values[f.name];
        if (ctx.text) out += v ? v : '[' + f.name + ']';
        else if (v) out += ctx.copy ? esc(v).replace(/\n/g, '<br>') : '<span class="fv">' + esc(v).replace(/\n/g, '<br>') + '</span>';
        else out += '<span class="ph"' + (ctx.copy ? ' style="background:#fff2b0"' : '') + '>[' + esc(f.name) + ']</span>';
      }
    }
    return out + plain(s.slice(last), ctx);
  }
  function plain(s, ctx) { return ctx.text ? s : esc(s); }

  function renderBlocks(text, ctx) {
    text = expandSig(text);
    if (ctx.text) {
      return text.split('\n').map(function (l) { return inline(l, ctx); }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    var html = '', para = [], list = [];
    var pStyle = ctx.copy ? ' style="margin:0 0 10pt"' : '';
    function flushP() { if (para.length) { html += '<p' + pStyle + '>' + para.map(function (l) { return inline(l, ctx); }).join('<br>') + '</p>'; para = []; } }
    function flushL() { if (list.length) { html += '<ul' + (ctx.copy ? ' style="margin:0 0 10pt"' : '') + '>' + list.map(function (l) { return '<li>' + inline(l, ctx) + '</li>'; }).join('') + '</ul>'; list = []; } }
    text.split('\n').forEach(function (line) {
      if (/^\s*$/.test(line)) { flushP(); flushL(); }
      else if (/^\s*[-•]\s+/.test(line)) { flushP(); list.push(line.replace(/^\s*[-•]\s+/, '')); }
      else { flushL(); para.push(line); }
    });
    flushP(); flushL();
    return html;
  }
  function autolinkEmails(s) {
    return String(s || '').replace(/([A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g, '[$1](mailto:$1)');
  }
  function metaText(str, ctx) { return inline(expandSig(str), ctx); }

  function valuesFor(id) { return state.values[id] || (state.values[id] = {}); }

  function renderPreview(t) {
    var ctx = { values: valuesFor(t.id) }, secs = sections(t), isEmail = t.type !== 'chat', html = '';
    if (isEmail && (t.to || t.cc || t.subject)) {
      var rows = '';
      if (t.to) rows += '<div class="meta-row"><b>To</b><span class="val">' + inline(autolinkEmails(t.to), ctx) + '</span><button class="copy-mini" data-action="copy-meta" data-meta="to" type="button">Copy</button></div>';
      if (t.cc) rows += '<div class="meta-row"><b>Cc</b><span class="val">' + inline(autolinkEmails(t.cc), ctx) + '</span><button class="copy-mini" data-action="copy-meta" data-meta="cc" type="button">Copy</button></div>';
      if (t.subject) rows += '<div class="meta-row"><b>Subject</b><span class="val">' + metaText(t.subject, ctx) + '</span><button class="copy-mini" data-action="copy-meta" data-meta="subject" type="button">Copy</button></div>';
      html += '<div class="email-meta">' + rows + '</div>';
    }
    var multi = secs.length > 1 || (secs[0] && secs[0].title);
    secs.forEach(function (s, i) {
      html += '<div class="section-block">';
      if (multi) html += '<div class="section-title"><span>' + esc(s.title || 'Message') + '</span><button class="copy-mini" data-action="copy-section" data-section="' + i + '" type="button">Copy</button></div>';
      html += '<div class="email-body">' + renderBlocks(s.text, ctx) + '</div></div>';
    });
    return '<div class="email">' + html + '</div>';
  }

  function fieldsHTML(t) {
    var fs = templateFields(t), vals = valuesFor(t.id);
    if (!fs.length) return '<div class="no-fields">No fields to fill in.</div>';
    return fs.map(function (f) {
      var v = vals[f.name] || '', id = 'f-' + t.id + '-' + slug(f.name), ctl;
      if (f.kind === 'multiline') ctl = '<textarea id="' + id + '" data-field="' + esc(f.name) + '">' + esc(v) + '</textarea>';
      else if (f.kind === 'select') ctl = '<select id="' + id + '" data-field="' + esc(f.name) + '"><option value="">— choose —</option>' +
        f.options.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
      else ctl = '<input type="text" id="' + id + '" data-field="' + esc(f.name) + '" value="' + esc(v) + '" autocomplete="off" />';
      return '<div class="field"><label for="' + id + '">' + esc(f.name) + '</label>' + ctl + '</div>';
    }).join('');
  }

  function cardHTML(t, no) {
    var isOpen = state.open.has(t.id), isEmail = t.type !== 'chat', multi = sections(t).length > 1;
    return '<article class="card' + (isOpen ? ' open' : '') + '" id="t-' + esc(t.id) + '" data-id="' + esc(t.id) + '">' +
      '<div class="card-head" data-action="toggle"><div class="card-no">' + no + '</div><h2 class="card-title">' + esc(t.title) + '</h2>' +
      '<span class="badge cat">' + esc(t.category) + '</span><span class="badge type">' + (isEmail ? 'Email' : 'Chat') + '</span><span class="caret">▾</span></div>' +
      '<div class="card-body">' +
      '<div class="edit-bar"><button class="btn sm primary" data-action="edit" type="button">Edit</button>' +
      '<button class="btn sm" data-action="dup" type="button">Duplicate</button>' +
      '<button class="btn sm" data-action="up" type="button">Move up ↑</button>' +
      '<button class="btn sm" data-action="down" type="button">Move down ↓</button>' +
      '<button class="btn sm danger" data-action="del" type="button">Delete</button></div>' +
      (t.note ? '<div class="note-box">' + inline(t.note, { values: {} }) + '</div>' : '') +
      '<div class="split"><div class="fields-col"><h4>Fill in</h4><div class="fields">' + fieldsHTML(t) + '</div>' +
      '<button class="btn sm" data-action="clear" type="button">Clear fields</button></div>' +
      '<div class="preview-col"><h4>Preview</h4><div class="preview-wrap">' + renderPreview(t) + '</div>' +
      '<div class="actions">' +
      (multi ? '' : '<button class="btn primary" data-action="copy-body" type="button">Copy formatted</button>') +
      '<button class="btn" data-action="copy-text" type="button">Copy plain text</button>' +
      (isEmail ? '<button class="btn" data-action="mailto" type="button">✉ Open in Outlook</button>' : '') +
      '</div></div></div></div></article>';
  }

  /* ------------------------------------------------------------ list / nav */
  function haystack(t) { return [t.title, t.category, t.subject, t.body, t.note, t.to].join(' ').toLowerCase(); }
  function visible() {
    var terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    return state.data.templates.filter(function (t) {
      if (state.cat !== 'All' && t.category !== state.cat) return false;
      var h = haystack(t);
      return terms.every(function (w) { return h.indexOf(w) >= 0; });
    });
  }
  function categories() {
    var seen = [], map = {};
    state.data.templates.forEach(function (t) { if (!map[t.category]) { map[t.category] = 0; seen.push(t.category); } map[t.category]++; });
    return { list: seen, counts: map };
  }

  function renderAll() {
    var vis = visible(), ts = state.data.templates, cats = categories();
    $('#statCount').textContent = ts.length;
    $('#statCats').textContent = cats.list.length;
    $('#statVersion').textContent = state.data.version;
    $('#statSource').textContent = isModified() ? 'Local edits (not published)' : 'Published';
    $('#resultPill').textContent = vis.length + ' of ' + ts.length + ' shown';
    document.body.classList.toggle('edit', state.edit);

    // chips
    $('#catChips').innerHTML = ['All'].concat(cats.list).map(function (c) {
      return '<button type="button" class="chip' + (state.cat === c ? ' on' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + (c === 'All' ? '' : ' · ' + cats.counts[c]) + '</button>';
    }).join('');

    // index (numbers follow the master order)
    $('#indexList').innerHTML = vis.map(function (t) {
      return '<li><a href="#t-' + esc(t.id) + '"><span><span class="ix-title">' + esc(t.title) + '</span><span class="ix-cat">' + esc(t.category) + ' · ' + (t.type === 'chat' ? 'Chat' : 'Email') + '</span></span></a></li>';
    }).join('');

    // cards
    $('#cards').innerHTML = vis.map(function (t) { return cardHTML(t, ts.indexOf(t) + 1); }).join('');
    $('#emptyState').hidden = vis.length > 0;

    // sidebar
    $('#sideNav').innerHTML = cats.list.map(function (c) {
      var items = ts.filter(function (t) { return t.category === c; });
      return '<details class="cat-group" data-cat="' + esc(c) + '"' + (state.closedCats.has(c) ? '' : ' open') + '><summary><span>' + esc(c) + '</span><span class="count">' + items.length + '</span></summary><div class="cat-links">' +
        items.map(function (t) { return '<a href="#t-' + esc(t.id) + '" data-nav="' + esc(t.id) + '">' + esc(t.title) + '</a>'; }).join('') + '</div></details>';
    }).join('');
    $('#catList').innerHTML = cats.list.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('');
    markActive(state.active);
    renderBanner();
  }

  function markActive(id) {
    state.active = id;
    $$('.cat-links a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === id); });
  }

  function goTo(id, quiet) {
    var t = state.data.templates.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    if (visible().indexOf(t) < 0) { state.query = ''; state.cat = 'All'; $('#globalSearch').value = ''; }
    state.open.add(id); renderAll();
    var el = document.getElementById('t-' + id);
    if (!el) return;
    markActive(id);
    el.scrollIntoView({ behavior: quiet ? 'auto' : 'smooth', block: 'start' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    if (history.replaceState) history.replaceState(null, '', '#t-' + id);
  }

  /* --------------------------------------------------------------- actions */
  function getT(id) { return state.data.templates.filter(function (t) { return t.id === id; })[0]; }

  function copyRich(html, text) {
    var wrapped = '<div style="font-family:Calibri,\'Segoe UI\',Arial,sans-serif;font-size:11pt">' + html + '</div>';
    if (navigator.clipboard && window.ClipboardItem) {
      return navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([wrapped], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })]).then(function () { return true; }, function () { return legacyCopy(wrapped); });
    }
    return Promise.resolve(legacyCopy(wrapped));
  }
  function legacyCopy(html) {
    var d = document.createElement('div'); d.contentEditable = 'true';
    d.style.cssText = 'position:fixed;left:-9999px;top:0;'; d.innerHTML = html; document.body.appendChild(d);
    var r = document.createRange(); r.selectNodeContents(d);
    var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    s.removeAllRanges(); d.remove(); return ok;
  }
  function copyPlain(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyPlain(text); });
    return Promise.resolve(legacyPlain(text));
  }
  function legacyPlain(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok;
  }
  function done(ok, msg) { toast(ok ? msg : 'Copy blocked by the browser – select the preview text and press Ctrl+C.'); }

  function bodyOut(t, secIdx, mode) {
    var vals = valuesFor(t.id), secs = sections(t);
    var list = secIdx == null ? secs : [secs[secIdx]];
    var ctx = mode === 'text' ? { values: vals, text: true } : { values: vals, copy: true };
    return list.map(function (s) { return renderBlocks(s.text, ctx); }).join(mode === 'text' ? '\n\n' : '');
  }
  function metaOut(t, key) {
    var v = expandSig(t[key] || '');
    return v.replace(/\{\{([^{}]+)\}\}/g, function (_, inner) { return fieldText(inner, valuesFor(t.id)); });
  }

  function openMail(t) {
    var to = metaOut(t, 'to').split(/[;,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s && s.indexOf('[') < 0; }).join(';');
    var cc = metaOut(t, 'cc').split(/[;,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s && s.indexOf('[') < 0; }).join(';');
    var q = [];
    if (cc) q.push('cc=' + encodeURIComponent(cc));
    if (t.subject) q.push('subject=' + encodeURIComponent(metaOut(t, 'subject')));
    q.push('body=' + encodeURIComponent(bodyOut(t, null, 'text').replace(/\n/g, '\r\n')));
    window.location.href = 'mailto:' + encodeURIComponent(to).replace(/%40/g, '@').replace(/%3B/g, ';') + '?' + q.join('&');
  }

  function rerenderCard(id) {
    var t = getT(id), el = document.getElementById('t-' + id); if (!t || !el) return;
    var no = state.data.templates.indexOf(t) + 1, wrap = document.createElement('div');
    wrap.innerHTML = cardHTML(t, no); el.replaceWith(wrap.firstChild);
  }

  function onCardClick(e) {
    var btn = e.target.closest('[data-action]'); if (!btn) return;
    var card = btn.closest('.card'), id = card.getAttribute('data-id'), t = getT(id), a = btn.getAttribute('data-action');
    if (a === 'toggle') { card.classList.toggle('open'); card.classList.contains('open') ? state.open.add(id) : state.open.delete(id); return; }
    if (a === 'copy-body') return copyRich(bodyOut(t, null, 'html'), bodyOut(t, null, 'text')).then(function (ok) { done(ok, 'Copied with formatting – paste into Outlook'); });
    if (a === 'copy-section') { var i = +btn.getAttribute('data-section'); return copyRich(bodyOut(t, i, 'html'), bodyOut(t, i, 'text')).then(function (ok) { done(ok, 'Copied with formatting'); }); }
    if (a === 'copy-text') return copyPlain(bodyOut(t, null, 'text')).then(function (ok) { done(ok, 'Plain text copied'); });
    if (a === 'copy-meta') { var k = btn.getAttribute('data-meta'); return copyPlain(metaOut(t, k)).then(function (ok) { done(ok, k.charAt(0).toUpperCase() + k.slice(1) + ' copied'); }); }
    if (a === 'mailto') return openMail(t);
    if (a === 'clear') { state.values[id] = {}; rerenderCard(id); return; }
    if (a === 'edit') return openEditor(id);
    if (a === 'dup') return duplicate(id);
    if (a === 'up' || a === 'down') return move(id, a === 'up' ? -1 : 1);
    if (a === 'del') return remove(id);
  }
  function onCardInput(e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-field'); if (f == null) return;
    var card = e.target.closest('.card'), id = card.getAttribute('data-id');
    valuesFor(id)[f] = e.target.value;
    // keep same-named fields in sync, refresh preview only
    card.querySelector('.preview-wrap').innerHTML = renderPreview(getT(id));
  }

  /* ---------------------------------------------------------------- editing */
  function uniqueId(base) {
    var id = slug(base), n = 2; while (getT(id)) id = slug(base) + '-' + n++; return id;
  }
  function duplicate(id) {
    var t = clone(getT(id)); t.title += ' (copy)'; t.id = uniqueId(t.title);
    var i = state.data.templates.indexOf(getT(id)); state.data.templates.splice(i + 1, 0, t);
    log('Duplicated template: ' + t.title); persist(); goTo(t.id); toast('Template duplicated');
  }
  function move(id, dir) {
    var ts = state.data.templates, i = ts.indexOf(getT(id)), j = i + dir; if (j < 0 || j >= ts.length) return;
    var tmp = ts[i]; ts[i] = ts[j]; ts[j] = tmp; log('Reordered template: ' + tmp.title); persist(); renderAll(); goTo(id, true);
  }
  function remove(id) {
    var t = getT(id); if (!confirm('Delete "' + t.title + '"? This cannot be undone (except by resetting to the published version).')) return;
    state.data.templates.splice(state.data.templates.indexOf(t), 1); state.open.delete(id);
    log('Deleted template: ' + t.title); persist(); renderAll(); toast('Template deleted');
  }

  function openEditor(id) {
    state.editingId = id;
    var t = id ? getT(id) : { title: '', category: state.cat !== 'All' ? state.cat : '', type: 'email', to: '', cc: '', subject: '', note: '', body: 'Dear {{Recipient}},\n\n\n\nKind regards,\n{{signature}}' };
    $('#editorTitle').textContent = id ? 'Edit template' : 'New template';
    $('#eTitle').value = t.title; $('#eCategory').value = t.category; $('#eType').value = t.type || 'email';
    $('#eNote').value = t.note || ''; $('#eTo').value = t.to || ''; $('#eCc').value = t.cc || '';
    $('#eSubject').value = t.subject || ''; $('#eBody').value = t.body || '';
    syncEditor(); $('#editorDlg').showModal(); $('#eTitle').focus();
  }
  function syncEditor() {
    $$('.email-only').forEach(function (el) { el.hidden = $('#eType').value === 'chat'; });
    var tmp = { id: '__preview', body: $('#eBody').value, to: '', cc: '', subject: '', type: $('#eType').value };
    var fs = templateFields(tmp);
    $('#eFields').textContent = 'Detected fields: ' + (fs.length ? fs.map(function (f) { return f.name; }).join(', ') : 'none');
    $('#ePreview').innerHTML = sections(tmp).map(function (s) {
      return (s.title ? '<div style="font-weight:800;font-size:.75rem;letter-spacing:.06em;color:#4a5578;text-transform:uppercase;margin:6px 0">' + esc(s.title) + '</div>' : '') + renderBlocks(s.text, { values: {} });
    }).join('');
  }
  function insertAtCursor(before, after, placeholder) {
    var ta = $('#eBody'), s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || placeholder || '';
    ta.value = ta.value.slice(0, s) + before + sel + (after || '') + ta.value.slice(e);
    ta.focus(); ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + sel.length; syncEditor();
  }
  function format(kind) {
    if (kind === 'bold') insertAtCursor('**', '**', 'bold text');
    else if (kind === 'bullet') insertAtCursor('- ', '', 'List item');
    else if (kind === 'section') insertAtCursor('## ', '', 'Section title');
    else if (kind === 'sig') insertAtCursor('{{signature}}', '', '');
    else if (kind === 'fullsig') insertAtCursor('{{fullSignature}}', '', '');
    else if (kind === 'field') { var n = prompt('Field name (shown as the label, e.g. Study):'); if (n) insertAtCursor('{{' + n.trim() + '}}', '', ''); }
    else if (kind === 'link') {
      var u = prompt('Link address (https://… or mailto:…):'); if (!u) return;
      var ta = $('#eBody'), sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      var label = sel || prompt('Link text:', 'link'); if (!label) return;
      var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '[' + label + '](' + u.trim() + ')' + ta.value.slice(ta.selectionEnd);
      ta.focus(); syncEditor();
    }
  }
  function saveEditor(e) {
    e.preventDefault();
    var title = $('#eTitle').value.trim(), cat = $('#eCategory').value.trim();
    if (!title || !cat) return;
    var rec = { title: title, category: cat, type: $('#eType').value, to: $('#eTo').value.trim(), cc: $('#eCc').value.trim(),
      subject: $('#eSubject').value.trim(), note: $('#eNote').value.trim(), body: $('#eBody').value.replace(/\s+$/, '') };
    if (rec.type === 'chat') { rec.to = ''; rec.cc = ''; rec.subject = ''; }
    var id = state.editingId;
    if (id) { var t = getT(id); Object.keys(rec).forEach(function (k) { t[k] = rec[k]; }); log('Edited template: ' + title); }
    else { rec.id = uniqueId(title); state.data.templates.push(rec); id = rec.id; log('Added template: ' + title); }
    persist(); $('#editorDlg').close(); state.open.add(id); renderAll(); goTo(id); toast('Template saved');
  }

  /* --------------------------------------------------------------- settings */
  function openSettings() {
    $('#sSig').value = state.data.settings.signature || ''; $('#sFull').value = state.data.settings.fullSignature || '';
    renderLog(); $('#settingsDlg').showModal();
  }
  function renderLog() {
    var l = state.data.changelog || [];
    $('#changeLog').innerHTML = l.length ? l.map(function (c) { return '<div><span>' + esc(c.date) + '</span>' + esc(c.note) + '</div>'; }).join('') : '<div>No changes yet.</div>';
  }
  function exportObj() {
    var d = clone(state.data); d.version = today() + '.' + new Date().toTimeString().slice(0, 5).replace(':', ''); delete d.basedOn; return d;
  }
  function exportJs() {
    var d = exportObj();
    download('data.js', '/* Published template data. Replace this file to update the site for everyone. */\nwindow.TEMPLATE_DATA = ' + JSON.stringify(d, null, 2) + ';\n', 'text/javascript');
    toast('data.js downloaded – replace the file in your project and redeploy');
  }
  function importJson(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (!d || !Array.isArray(d.templates)) throw new Error('No templates array');
        d.templates.forEach(function (t) { if (!t.id || !t.title || !t.category || t.body == null) throw new Error('Template missing id/title/category/body'); });
        state.data.templates = d.templates;
        if (d.settings) state.data.settings = d.settings;
        log('Imported ' + d.templates.length + ' templates from JSON'); persist(); renderAll(); renderLog(); toast('Import complete');
      } catch (err) { alert('Import failed: ' + err.message); }
    };
    r.readAsText(file);
  }
  function resetAll() {
    if (!confirm('Discard all local edits and return to the published version?')) return;
    localStorage.removeItem(STORE_KEY); state.data = clone(PUBLISHED); state.basedOn = PUBLISHED.version; state.hadLocal = false; state.values = {};
    $('#settingsDlg').close(); renderAll(); toast('Reset to published version');
  }

  function renderBanner() {
    var b = $('#updateBanner');
    if (state.hadLocal && state.basedOn !== PUBLISHED.version) {
      b.hidden = false;
      b.innerHTML = '<div class="banner-text"><b>A newer published version is available</b> (' + esc(PUBLISHED.version) + '). You have local edits based on ' + esc(state.basedOn) + '.</div>' +
        '<button class="btn primary" data-bn="use" type="button">Use published version</button><button class="btn" data-bn="keep" type="button">Keep my edits</button>';
    } else b.hidden = true;
  }

  /* ------------------------------------------------------------------- init */
  function bind() {
    $('#cards').addEventListener('click', onCardClick);
    $('#cards').addEventListener('input', onCardInput);
    $('#cards').addEventListener('change', onCardInput);

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#t-"]');
      if (a) { e.preventDefault(); goTo(a.getAttribute('href').slice(3)); return; }
      var chip = e.target.closest('.chip[data-cat]');
      if (chip) { state.cat = chip.getAttribute('data-cat'); renderAll(); return; }
      var c = e.target.closest('[data-close]'); if (c) { document.getElementById(c.getAttribute('data-close')).close(); return; }
      var f = e.target.closest('[data-fmt]'); if (f) { format(f.getAttribute('data-fmt')); return; }
      var bn = e.target.closest('[data-bn]');
      if (bn) {
        if (bn.getAttribute('data-bn') === 'use') { localStorage.removeItem(STORE_KEY); state.data = clone(PUBLISHED); state.basedOn = PUBLISHED.version; state.hadLocal = false; toast('Switched to published version'); }
        else { state.basedOn = PUBLISHED.version; persist(); toast('Keeping your edits'); }
        renderAll();
      }
    });
    $('#sideNav').addEventListener('toggle', function (e) {
      var d = e.target, c = d.getAttribute('data-cat'); if (!c) return;
      d.open ? state.closedCats.delete(c) : state.closedCats.add(c);
    }, true);

    $('#globalSearch').addEventListener('input', function (e) { state.query = e.target.value; renderAll(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#globalSearch').focus(); }
    });
    $('#editToggle').addEventListener('change', function (e) { state.edit = e.target.checked; renderAll(); toast(state.edit ? 'Edit mode on' : 'Edit mode off'); });
    ['navNew', 'heroNew'].forEach(function (id) { $('#' + id).addEventListener('click', function () { $('#editToggle').checked = state.edit = true; renderAll(); openEditor(null); }); });
    ['navSettings', 'heroSettings'].forEach(function (id) { $('#' + id).addEventListener('click', openSettings); });
    $('#expandAll').addEventListener('click', function () { visible().forEach(function (t) { state.open.add(t.id); }); renderAll(); });
    $('#collapseAll').addEventListener('click', function () { state.open.clear(); renderAll(); });

    $('#editorForm').addEventListener('submit', saveEditor);
    ['eBody', 'eType'].forEach(function (id) { $('#' + id).addEventListener('input', syncEditor); $('#' + id).addEventListener('change', syncEditor); });

    $('#saveSettings').addEventListener('click', function () {
      state.data.settings.signature = $('#sSig').value.replace(/\s+$/, ''); state.data.settings.fullSignature = $('#sFull').value.replace(/\s+$/, '');
      log('Updated signatures'); persist(); renderAll(); renderLog(); toast('Signatures saved');
    });
    $('#exportJs').addEventListener('click', exportJs);
    $('#exportJson').addEventListener('click', function () { download('templates-backup-' + today() + '.json', JSON.stringify(exportObj(), null, 2), 'application/json'); });
    $('#importBtn').addEventListener('click', function () { $('#importFile').click(); });
    $('#importFile').addEventListener('change', function (e) { if (e.target.files[0]) importJson(e.target.files[0]); e.target.value = ''; });
    $('#resetBtn').addEventListener('click', resetAll);

    window.addEventListener('hashchange', function () {
      var h = location.hash; if (h.indexOf('#t-') === 0) goTo(h.slice(3));
    });
  }

  function init() {
    load(); bind(); renderAll();
    var h = location.hash;
    if (h.indexOf('#t-') === 0) goTo(h.slice(3), true);
    else if (state.data.templates[0]) { state.open.add(state.data.templates[0].id); renderAll(); }
  }
  init();
})();
