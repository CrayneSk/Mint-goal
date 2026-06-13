// shopData.js – GoaLMint Shop Data (themes, XP packs, cosmetics)

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

const cosmeticsList = [
  // --- HATS ---
  { id: 'hat_cap', name: '🧢 Baseball Cap', type: 'hat', cost: 50 },
  { id: 'hat_beanie', name: '🎿 Beanie', type: 'hat', cost: 60 },
  { id: 'hat_cowboy', name: '🤠 Cowboy Hat', type: 'hat', cost: 80 },
  { id: 'hat_tophat', name: '🎩 Top Hat', type: 'hat', cost: 120 },
  { id: 'hat_scholar', name: '🎓 Scholar Hat', type: 'hat', cost: 100 },
  { id: 'hat_crown', name: '👑 Crown', type: 'hat', cost: 300 },
  { id: 'hat_visor', name: '🧢 Visor', type: 'hat', cost: 40 },
  { id: 'hat_beret', name: '👨‍🎨 Beret', type: 'hat', cost: 70 },
  { id: 'hat_helmet', name: '⛑️ Builder Helmet', type: 'hat', cost: 90 },
  { id: 'hat_wizard', name: '🧙 Wizard Hat', type: 'hat', cost: 200 },
  { id: 'hat_party', name: '🎉 Party Hat', type: 'hat', cost: 55 },
  { id: 'hat_sombrero', name: '🇲🇽 Sombrero', type: 'hat', cost: 85 },

  // --- OUTFITS / TOPS ---
  { id: 'outfit_hoodie', name: '👕 Hoodie', type: 'outfit', cost: 80 },
  { id: 'outfit_training', name: '🥋 Training Outfit', type: 'outfit', cost: 150 },
  { id: 'outfit_hero', name: '🦸 Hero Outfit', type: 'outfit', cost: 400 },
  { id: 'outfit_suit', name: '🤵 Business Suit', type: 'outfit', cost: 250 },
  { id: 'outfit_armor', name: '🛡️ Knight Armor', type: 'outfit', cost: 500 },
  { id: 'outfit_pajamas', name: '😴 Pajamas', type: 'outfit', cost: 60 },
  { id: 'outfit_chef', name: '👨‍🍳 Chef Jacket', type: 'outfit', cost: 110 },
  { id: 'outfit_astronaut', name: '👨‍🚀 Astronaut Suit', type: 'outfit', cost: 600 },
  { id: 'outfit_pirate', name: '🏴‍☠️ Pirate Coat', type: 'outfit', cost: 180 },
  { id: 'outfit_samurai', name: '🗡️ Samurai Armor', type: 'outfit', cost: 350 },
  { id: 'outfit_angel', name: '👼 Angel Robe', type: 'outfit', cost: 220 },
  { id: 'outfit_devil', name: '😈 Devil Suit', type: 'outfit', cost: 220 },

  // --- BOTTOMS ---
  { id: 'bottom_jeans', name: '👖 Jeans', type: 'bottom', cost: 70 },
  { id: 'bottom_shorts', name: '🩳 Shorts', type: 'bottom', cost: 50 },
  { id: 'bottom_skirt', name: '👗 Skirt', type: 'bottom', cost: 60 },
  { id: 'bottom_cargo', name: '🦺 Cargo Pants', type: 'bottom', cost: 85 },

  // --- SHOES ---
  { id: 'shoes_sneakers', name: '👟 Sneakers', type: 'shoes', cost: 65 },
  { id: 'shoes_boots', name: '🥾 Boots', type: 'shoes', cost: 90 },
  { id: 'shoes_heels', name: '👠 Heels', type: 'shoes', cost: 80 },
  { id: 'shoes_sandals', name: '🩴 Sandals', type: 'shoes', cost: 45 },
  { id: 'shoes_wizard', name: '🧙 Wizard Shoes', type: 'shoes', cost: 120 },

  // --- ACCESSORIES ---
  { id: 'acc_glasses', name: '👓 Glasses', type: 'accessory', cost: 40 },
  { id: 'acc_sunglasses', name: '🕶️ Sunglasses', type: 'accessory', cost: 55 },
  { id: 'acc_monocle', name: '🧐 Monocle', type: 'accessory', cost: 75 },
  { id: 'acc_earrings', name: '💎 Earrings', type: 'accessory', cost: 100 },
  { id: 'acc_necklace', name: '📿 Necklace', type: 'accessory', cost: 130 },
  { id: 'acc_watch', name: '⌚ Watch', type: 'accessory', cost: 110 },
  { id: 'acc_scarf', name: '🧣 Scarf', type: 'accessory', cost: 45 },

  // --- EFFECTS ---
  { id: 'effect_glow', name: '✨ Glow Aura', type: 'effect', cost: 200 },
  { id: 'effect_fire', name: '🔥 Fire Aura', type: 'effect', cost: 350 },
  { id: 'effect_lightning', name: '⚡ Lightning Aura', type: 'effect', cost: 500 },
  { id: 'effect_hearts', name: '💕 Love Aura', type: 'effect', cost: 250 },
  { id: 'effect_stars', name: '🌟 Star Aura', type: 'effect', cost: 300 },
  { id: 'effect_toxic', name: '☣️ Toxic Aura', type: 'effect', cost: 280 },

  // --- WINGS / BACK ITEMS ---
  { id: 'back_angelwings', name: '👼 Angel Wings', type: 'back', cost: 400 },
  { id: 'back_devilwings', name: '😈 Devil Wings', type: 'back', cost: 400 },
  { id: 'back_cape', name: '🦸 Cape', type: 'back', cost: 180 },
  { id: 'back_jetpack', name: '🚀 Jetpack', type: 'back', cost: 600 },
  { id: 'back_sword', name: '🗡️ Sword on Back', type: 'back', cost: 250 },

  // --- PETS (small companions near avatar) ---
  { id: 'pet_cat', name: '🐱 Cat', type: 'pet', cost: 350 },
  { id: 'pet_dog', name: '🐶 Dog', type: 'pet', cost: 350 },
  { id: 'pet_dragon', name: '🐉 Mini Dragon', type: 'pet', cost: 800 },
  { id: 'pet_robot', name: '🤖 Robot', type: 'pet', cost: 500 }
];