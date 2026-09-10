/**
 * Mafort Tasks & Focus — sincronização e agenda
 * Cole este código em script.google.com e implante como "App da Web"
 * (Executar como: eu / Quem pode acessar: qualquer pessoa).
 *
 * O que faz:
 *  - guarda o quadro num arquivo JSON no seu Google Drive (pasta "Mafort Tasks & Focus")
 *  - funde as alterações vindas do celular e do PC (vale a mais recente)
 *  - cria/atualiza/apaga eventos de prazo na sua agenda Google, com avisos 12h e 3h antes
 */

var FOLDER_NAME = 'Mafort Tasks & Focus';
var FILE_NAME = 'tasks-focus-data.json';
var REMINDERS_MIN = [12 * 60, 3 * 60];   // 12h e 3h antes
var TOMBSTONE_DAYS = 45;

function doGet(e) {
  return respond({ ok: true, app: 'Mafort Tasks & Focus', version: 1 });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    if (!checkKey(req.key)) return respond({ ok: false, error: 'chave inválida' });

    var stored = loadState();
    var merged = mergeStates(stored, req.state || emptyState());
    if (req.calendar !== undefined) merged.calendarEnabled = !!req.calendar;
    merged.calendarMap = stored.calendarMap || {};
    var calErr = null;
    try { syncCalendar(merged); } catch (err) { calErr = String(err); }
    merged.savedAt = Date.now();
    saveState(merged);
    return respond({ ok: true, state: publicState(merged), calendarError: calErr, savedAt: merged.savedAt });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- chave ---------- */
function checkKey(key) {
  if (!key || String(key).length < 8) return false;
  var props = PropertiesService.getScriptProperties();
  var saved = props.getProperty('KEY');
  if (!saved) { props.setProperty('KEY', String(key)); return true; }  // primeira chamada define a chave
  return saved === String(key);
}

/* ---------- armazenamento ---------- */
function getFile() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
  var files = folder.getFilesByName(FILE_NAME);
  if (files.hasNext()) return files.next();
  return folder.createFile(FILE_NAME, JSON.stringify(emptyState()), MimeType.PLAIN_TEXT);
}
function loadState() {
  try { var s = JSON.parse(getFile().getBlob().getDataAsString() || '{}'); return normalize(s); }
  catch (e) { return emptyState(); }
}
function saveState(state) { getFile().setContent(JSON.stringify(state)); }
function emptyState() { return { columns: [], tasks: [], deleted: {}, calendarEnabled: true, calendarMap: {} }; }
function normalize(s) {
  var e = emptyState();
  s = s || {};
  e.columns = s.columns || []; e.tasks = s.tasks || []; e.deleted = s.deleted || {};
  e.calendarEnabled = s.calendarEnabled !== false; e.calendarMap = s.calendarMap || {};
  return e;
}
function publicState(s) { return { columns: s.columns, tasks: s.tasks, deleted: s.deleted, calendarEnabled: s.calendarEnabled }; }

/* ---------- fusão (vale o updatedAt mais recente; exclusões vencem edições anteriores) ---------- */
function mergeStates(a, b) {
  var out = emptyState();
  var deleted = {}, k;
  for (k in a.deleted) deleted[k] = a.deleted[k];
  for (k in b.deleted) deleted[k] = Math.max(deleted[k] || 0, b.deleted[k]);
  var cutoff = Date.now() - TOMBSTONE_DAYS * 86400000;
  for (k in deleted) if (deleted[k] < cutoff) delete deleted[k];
  out.deleted = deleted;
  out.columns = mergeList(a.columns, b.columns, deleted);
  out.tasks = mergeList(a.tasks, b.tasks, deleted);
  // tarefas de colunas apagadas somem também
  var colIds = {}; out.columns.forEach(function (c) { colIds[c.id] = true; });
  out.tasks = out.tasks.filter(function (t) { return colIds[t.colId]; });
  out.calendarEnabled = a.calendarEnabled !== false;
  return out;
}
function mergeList(la, lb, deleted) {
  var map = {};
  (la || []).concat(lb || []).forEach(function (it) {
    if (!it || !it.id) return;
    var u = it.updatedAt || 0;
    if (deleted[it.id] && deleted[it.id] >= u) return;
    if (!map[it.id] || u > (map[it.id].updatedAt || 0)) map[it.id] = it;
  });
  return Object.keys(map).map(function (id) { return map[id]; })
    .sort(function (x, y) { return (x.order || 0) - (y.order || 0); });
}

/* ---------- agenda ---------- */
function syncCalendar(state) {
  var map = state.calendarMap;
  var cal = CalendarApp.getDefaultCalendar();
  var doneCols = {}; state.columns.forEach(function (c) { if (c.done) doneCols[c.id] = true; });
  var wanted = {};
  if (state.calendarEnabled) {
    state.tasks.forEach(function (t) {
      if (t.deadline && !t.doneAt && !doneCols[t.colId]) wanted[t.id] = t;
    });
  }
  // remove eventos que não devem mais existir
  Object.keys(map).forEach(function (taskId) {
    if (wanted[taskId]) return;
    try { var ev = cal.getEventById(map[taskId].eventId); if (ev) ev.deleteEvent(); } catch (e) {}
    delete map[taskId];
  });
  // cria/atualiza os que devem existir
  Object.keys(wanted).forEach(function (taskId) {
    var t = wanted[taskId];
    var start = new Date(t.deadline), end = new Date(start.getTime() + 30 * 60000);
    var title = 'Prazo: ' + t.title;
    var desc = (t.notes || '') + '\n\n— Mafort Tasks & Focus';
    var entry = map[taskId], ev = null;
    if (entry) { try { ev = cal.getEventById(entry.eventId); } catch (e) { ev = null; } }
    if (!ev) {
      ev = cal.createEvent(title, start, end, { description: desc });
      map[taskId] = { eventId: ev.getId(), deadline: t.deadline, title: t.title, notes: t.notes || '' };
      setReminders(ev);
      return;
    }
    if (entry.deadline !== t.deadline) { ev.setTime(start, end); entry.deadline = t.deadline; setReminders(ev); }
    if (entry.title !== t.title) { ev.setTitle(title); entry.title = t.title; }
    if ((entry.notes || '') !== (t.notes || '')) { ev.setDescription(desc); entry.notes = t.notes || ''; }
  });
}
function setReminders(ev) {
  ev.removeAllReminders();
  REMINDERS_MIN.forEach(function (m) { ev.addPopupReminder(m); });
}

/* ---------- resposta ---------- */
function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
