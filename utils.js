// utils.js
const quotes = ["Small steps, big results.","Consistency is key.","Don't break the chain.","You are what you repeatedly do.","One day at a time."];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getYesterdayStr() { return new Date(Date.now()-86400000).toISOString().split('T')[0]; }
function isToday(s) { return s === getTodayStr(); }
function isYesterday(s) { return s === getYesterdayStr(); }

function habitScheduledToday(h) {
  if (!h.repeatDays || h.repeatDays.length === 0) return h.repeat === 'daily' || h.repeat === 'weekly';
  return h.repeatDays.includes(new Date().getDay());
}

function habitScheduledYesterday(h) {
  const yesterday = (new Date().getDay() + 6) % 7;
  if (!h.repeatDays || h.repeatDays.length === 0) return h.repeat === 'daily' || h.repeat === 'weekly';
  return h.repeatDays.includes(yesterday);
}

function getIdentity(xp) {
  if (xp >= 5000) return 'Legend';
  else if (xp >= 2000) return 'Master Builder';
  else if (xp >= 1000) return 'Consistent';
  else if (xp >= 500) return 'Focused';
  else if (xp >= 100) return 'Disciplined';
  return 'Beginner';
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getThemeDisplayName(themeId) {
  const all = [...freeThemes.map(t => ({ id: t, name: t.charAt(0).toUpperCase() + t.slice(1) })), ...shopThemes];
  const found = all.find(t => t.id === themeId);
  return found ? found.name : themeId;
}