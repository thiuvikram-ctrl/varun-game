export type CharacterAnimeStyle = 'tactical_ninja' | 'cyber_shonen' | 'military_specops' | 'mecha_warrior' | 'desert_ronin' | 'flame_alchemist' | 'shadow_assassin' | 'frost_vanguard';

export interface AnimeEyeStyle {
  color: string;
  glow: string;
  shape: 'sharp' | 'piercing' | 'focused' | 'demon' | 'cyborg' | 'arcane';
  pupil: 'slit' | 'ring' | 'crosshair' | 'normal';
}

export interface CharacterRosterItem {
  id: string;
  index: number;
  name: string;
  japaneseTitle?: string;
  clan: string;
  style: CharacterAnimeStyle;
  gender: 'Male';
  eyeStyle: AnimeEyeStyle;
  hairColor: string;
  outfitColor: string;
  handSkinTone: string;
  gloveColor: string;
  quote: string;
  signatureAbility: string;
  hp: number;
  speed: number;
  unlocked: boolean;
  costDiamonds: number;
  costCoins: number;
}

export interface MapEnvironment {
  id: string;
  name: string;
  subtitle: string;
  theme: 'deep_forest' | 'bamboo_grove' | 'pine_valley' | 'cyber_jungle' | 'military_ruins' | 'sunset_canopy' | 'desert_outpost';
  fogColor: string;
  skyColor: string;
  groundColor: string;
  treeDensity: number;
  description: string;
  isCustomPublished?: boolean;
  author?: string;
}

export type GameModeKey = 
  | 'BATTLE_ROYALE' 
  | 'CLASH_SQUAD' 
  | 'TEAM_DEATHMATCH' 
  | 'LONE_WOLF' 
  | 'CUSTOM_ROOM';

export interface PublishedCommunityMap {
  id: string;
  title: string;
  creator: string;
  environment: string;
  treeCount: number;
  bunkerCount: number;
  vehicleSpawns: number;
  upvotes: number;
  plays: number;
  description: string;
  date: string;
}
