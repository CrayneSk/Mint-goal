// shopData.js
const shopThemes = [
  { id: 'ocean', name: 'Ocean', cost: 100, emoji: '🌊' },
  { id: 'sunset', name: 'Sunset', cost: 120, emoji: '🌅' },
  { id: 'forest', name: 'Forest', cost: 100, emoji: '🌲' },
  { id: 'candy', name: 'Candy', cost: 80, emoji: '🍬' },
  { id: 'neon', name: 'Neon', cost: 150, emoji: '💜' },
  { id: 'royal', name: 'Royal', cost: 200, emoji: '👑' },
  { id: 'ember', name: 'Ember', cost: 130, emoji: '🔥' },
  { id: 'frost', name: 'Frost', cost: 110, emoji: '❄️' },
  { id: 'aurora', name: 'Aurora', cost: 180, emoji: '🌌' },
  { id: 'cosmos', name: 'Cosmos', cost: 220, emoji: '🚀' },
  { id: 'cherry', name: 'Cherry', cost: 90, emoji: '🍒' },
  { id: 'mint', name: 'Mint', cost: 110, emoji: '🍃' },
  { id: 'lavender', name: 'Lavender', cost: 130, emoji: '💜' },
  { id: 'peach', name: 'Peach', cost: 95, emoji: '🍑' },
  { id: 'azure', name: 'Azure', cost: 140, emoji: '🔷' },
  { id: 'ruby', name: 'Ruby', cost: 160, emoji: '💎' },
  { id: 'jade', name: 'Jade', cost: 150, emoji: '🟢' },
  { id: 'ivory', name: 'Ivory', cost: 120, emoji: '🤍' },
  { id: 'onyx', name: 'Onyx', cost: 170, emoji: '⬛' },
  { id: 'coral', name: 'Coral', cost: 105, emoji: '🪸' },
  { id: 'amethyst', name: 'Amethyst', cost: 180, emoji: '💟' },
  { id: 'topaz', name: 'Topaz', cost: 135, emoji: '🔶' },
  { id: 'sapphire', name: 'Sapphire', cost: 190, emoji: '🔵' },
  { id: 'emerald', name: 'Emerald', cost: 200, emoji: '🟩' },
  { id: 'garnet', name: 'Garnet', cost: 145, emoji: '♦️' },
  { id: 'peridot', name: 'Peridot', cost: 125, emoji: '💚' },
  { id: 'aquamarine', name: 'Aquamarine', cost: 160, emoji: '🌊' },
  { id: 'diamond', name: 'Diamond', cost: 250, emoji: '💠' },
  { id: 'obsidian', name: 'Obsidian', cost: 210, emoji: '🖤' },
  { id: 'platinum', name: 'Platinum', cost: 230, emoji: '🪨' }
];

const freeThemes = ['growth', 'productivity', 'darkfocus', 'golden', 'midnight'];

const xpPacksList = [
  { id: 'xp_500', amount: 500, cost: 50 },
  { id: 'xp_1200', amount: 1200, cost: 100 },
  { id: 'xp_5000', amount: 5000, cost: 400 }
];