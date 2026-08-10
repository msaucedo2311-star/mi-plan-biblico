const KEY = 'mi-plan-biblico:v2';
const defaults = {
  completed: {}, reflections: {}, journal: [], questions: [],
  settings: { doctrine: 'Bautista conservador', showAlternatives: true, reminder: true, reminderTime: '07:30', startDate: new Date().toISOString().slice(0,10), apiBase: '' }
};

export function loadState() {
  try { return merge(defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch { return structuredClone(defaults); }
}
function merge(base, saved) {
  return { ...structuredClone(base), ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
}
export function saveState(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = `mi-plan-biblico-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
}
export function importState(file) {
  return file.text().then(JSON.parse).then(data => merge(defaults, data));
}
