import { CharacterRosterItem, CharacterAnimeStyle, AnimeEyeStyle, MapEnvironment, PublishedCommunityMap } from '../types/characterRoster';

const CLANS = [
  'Kage Tactical Squad',
  'Dragonfire Vanguard',
  'Ghost Reapers 141',
  'Neo-Tokyo Ronin',
  'Storm Horizon SpecOps',
  'Molten Forge Legion',
  'Celestial Shinobi',
  'Cyber Shonen Corp',
  'Black Lotus Task Force',
  'Abyssal Wolves',
  'Solar Phoenix Division',
  'Iron Tempest Division'
];

const STYLES: CharacterAnimeStyle[] = [
  'tactical_ninja',
  'cyber_shonen',
  'military_specops',
  'mecha_warrior',
  'desert_ronin',
  'flame_alchemist',
  'shadow_assassin',
  'frost_vanguard'
];

const EYE_COLORS = [
  { color: '#38bdf8', glow: '#0284c7', shape: 'piercing', pupil: 'ring' }, // Azure Cyber
  { color: '#ef4444', glow: '#b91c1c', shape: 'demon', pupil: 'slit' },    // Crimson Sharingan
  { color: '#f59e0b', glow: '#d97706', shape: 'sharp', pupil: 'crosshair' },// Amber Hawkeye
  { color: '#10b981', glow: '#059669', shape: 'focused', pupil: 'normal' }, // Emerald Forest
  { color: '#a855f7', glow: '#7e22ce', shape: 'arcane', pupil: 'ring' },   // Void Amethyst
  { color: '#f43f5e', glow: '#be123c', shape: 'piercing', pupil: 'slit' },  // Neon Ruby
  { color: '#06b6d4', glow: '#0891b2', shape: 'cyborg', pupil: 'crosshair' },// Cyan Target
  { color: '#e2e8f0', glow: '#94a3b8', shape: 'sharp', pupil: 'ring' }     // Silver Byakugan
] as const;

const FIRST_NAMES = [
  'Ren', 'Kenji', 'Kaito', 'Ryota', 'Daisuke', 'Sora', 'Haruto', 'Shin', 'Hayato', 'Kazuki',
  'Takeshi', 'Yuto', 'Akira', 'Riku', 'Taiga', 'Kuro', 'Jin', 'Tatsuya', 'Sho', 'Zane',
  'Leon', 'Ghost', 'Striker', 'Shadow', 'Blade', 'Viper', 'Blaze', 'Frost', 'Raven', 'Titan',
  'Ryuga', 'Sosuke', 'Guren', 'Shun', 'Kai', 'Zero', 'Rei', 'Torin', 'Kage', 'Renzo',
  'Kouhei', 'Genji', 'Hanzo', 'Ryu', 'Daiki', 'Masato', 'Aki', 'Hiroshi', 'Ken', 'Baki'
];

const LAST_NAMES = [
  'Takahashi', 'Fujimoto', 'Kurogane', 'Kurosaki', 'Himura', 'Ryuuzaki', 'Kamado', 'Uchiha',
  'Gojo', 'Shifuto', 'Katsuragi', 'Amaterasu', 'Kazama', 'Shirogane', 'Minato', 'Okumura',
  'Yagami', 'Sakamoto', 'Tatsumi', 'Arisugawa', 'Hagane', 'Hayabusa', 'Midoriya', 'Todoroki',
  'Riley', 'Mason', 'Price', 'Woods', 'Vance', 'Volkov', 'Belik', 'Ramirez'
];

const ABILITIES = [
  'Flame Shuriken Barrage',
  'Void Teleport Blink',
  'Shadow Clone Decoy',
  'Dragon Spirit Bullet',
  'Hyper Reflex Overdrive',
  'Titan Ceramic Wall',
  'EMP Glitch Shockwave',
  'Windblade Quickdraw',
  'Venom Gas Cloud',
  'Chidori Lightning Spear',
  'Crimson Berserk Surge',
  'Zero-Degree Ice Frost'
];

// Generate exactly 250 distinct male anime tactical characters
export const FULL_250_CHARACTERS: CharacterRosterItem[] = Array.from({ length: 250 }, (_, i) => {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
  const style = STYLES[i % STYLES.length];
  const clan = CLANS[i % CLANS.length];
  const eye = EYE_COLORS[i % EYE_COLORS.length];
  const hairColors = ['#18181b', '#ffffff', '#dc2626', '#f59e0b', '#2563eb', '#16a34a', '#9333ea', '#64748b'];
  const outfitColors = ['#0f172a', '#1e293b', '#1c1917', '#14532d', '#701a75', '#312e81', '#7c2d12', '#042f2e'];
  const gloveColors = ['#111827', '#27272a', '#1e3a5f', '#3b0764', '#78350f', '#064e3b', '#450a0a'];
  const skinTones = ['#f5d0b0', '#e5b88f', '#cf9972', '#b37c56', '#9c6644', '#fbe0ca'];

  return {
    id: `char_${i + 1}`,
    index: i + 1,
    name: `${fName} "${style.replace('_', ' ').toUpperCase()}" ${lName}`,
    clan,
    style,
    gender: 'Male',
    eyeStyle: {
      color: eye.color,
      glow: eye.glow,
      shape: eye.shape,
      pupil: eye.pupil,
    },
    hairColor: hairColors[i % hairColors.length],
    outfitColor: outfitColors[i % outfitColors.length],
    handSkinTone: skinTones[i % skinTones.length],
    gloveColor: gloveColors[i % gloveColors.length],
    quote: i === 0 
      ? '"My eyes see every bullet trajectory before it fires."' 
      : i === 1 
      ? '"The forest speaks to the hunter, not the hunted."'
      : `"Target locked. Sector clear in 3 seconds."`,
    signatureAbility: ABILITIES[i % ABILITIES.length],
    hp: 100 + (i % 5) * 5,
    speed: 4.8 + (i % 4) * 0.2,
    unlocked: i < 5, // first 5 unlocked by default
    costDiamonds: i < 5 ? 0 : 150 + (i % 8) * 40,
    costCoins: i < 5 ? 0 : 3000 + (i % 8) * 800,
  };
});

// Rich Forest & Battlefield Maps - Always in the Bright Sunny Morning
export const MAP_ENVIRONMENTS: MapEnvironment[] = [
  {
    id: 'deep_forest',
    name: 'Bermuda Forest & Misty Pines (Morning)',
    subtitle: 'Golden Sunrise, Dewy Pines & Sparkling Stream',
    theme: 'deep_forest',
    fogColor: '#e0f2fe',
    skyColor: '#70b5ff',
    groundColor: '#22c55e',
    treeDensity: 1.2,
    description: 'Crisp morning sunshine filtering through tall pine trees, blooming Sakura groves, scenic arched bridge, and dewy grass clearings.',
  },
  {
    id: 'bamboo_grove',
    name: 'Ronin Sacred Bamboo Sanctum (Morning Sun)',
    subtitle: 'Sunlit Emerald Bamboo Groves & Torii Gate',
    theme: 'bamboo_grove',
    fogColor: '#ecfdf5',
    skyColor: '#60a5fa',
    groundColor: '#16a34a',
    treeDensity: 1.5,
    description: 'Radiant morning sunlight piercing emerald bamboo stalks. Perfect for tactical duels and clear morning sightlines.',
  },
  {
    id: 'pine_valley',
    name: 'Kalahari Highland Woodland (Sunny Morning)',
    subtitle: 'Morning Mountain Ridges & Highland Clearings',
    theme: 'pine_valley',
    fogColor: '#e0f2fe',
    skyColor: '#7dd3fc',
    groundColor: '#2f855a',
    treeDensity: 0.9,
    description: 'Bright open morning valley with patrol jeeps parked along sun-drenched hills, fallen logs, and tactical supply bunkers.',
  },
  {
    id: 'cyber_jungle',
    name: 'Neo-Verdant Cyber Woods (Morning Glow)',
    subtitle: 'Sunlit Redwood Canopy & Holographic Relays',
    theme: 'cyber_jungle',
    fogColor: '#e0f2fe',
    skyColor: '#67e8f9',
    groundColor: '#15803d',
    treeDensity: 1.0,
    description: 'Bright morning training ground where futuristic neon relays glow under a radiant blue sky and morning dew canopy.',
  },
  {
    id: 'sunset_canopy',
    name: 'Golden Morning Cedar Forest',
    subtitle: 'Amber Morning Rays & Blooming Sakura Clearing',
    theme: 'sunset_canopy',
    fogColor: '#fef3c7',
    skyColor: '#93c5fd',
    groundColor: '#4ade80',
    treeDensity: 1.1,
    description: 'Glorious morning atmosphere with golden sunbeams filtering through blooming pink cherry blossoms and lush green meadows.',
  },
];

// Community Published Maps (Audience custom creation & publish system)
export const INITIAL_COMMUNITY_MAPS: PublishedCommunityMap[] = [
  {
    id: 'pub_1',
    title: 'Shadow Forest Clash Arena',
    creator: 'KageShinobi_99',
    environment: 'Bermuda Forest & Misty Pines',
    treeCount: 65,
    bunkerCount: 8,
    vehicleSpawns: 4,
    upvotes: 1420,
    plays: 8900,
    description: 'Symmetrical 4v4 Clash Squad battleground with high-cover wooden sniper towers and dual assault buggies.',
    date: '2026-09-20',
  },
  {
    id: 'pub_2',
    title: 'Lone Wolf Dojo in the Bamboo Grove',
    creator: 'AnimeSensei_X',
    environment: 'Ronin Sacred Bamboo Sanctum',
    treeCount: 90,
    bunkerCount: 2,
    vehicleSpawns: 2,
    upvotes: 2180,
    plays: 14300,
    description: 'Pure 1v1 intense duel arena where footstep audio and quick reflexes reign supreme in a tight clearing.',
    date: '2026-09-22',
  },
  {
    id: 'pub_3',
    title: 'Warzone Tank Depot & Redwoods',
    creator: 'CaptainBravo',
    environment: 'Kalahari Highland Woodland',
    treeCount: 50,
    bunkerCount: 12,
    vehicleSpawns: 6,
    upvotes: 980,
    plays: 5600,
    description: 'Large battle royale compound featuring drivable military jeeps, sandbag perimeters and sniper nests.',
    date: '2026-09-24',
  },
];
