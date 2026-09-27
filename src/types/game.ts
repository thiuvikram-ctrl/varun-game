export type CharacterId = 
  | 'ghost' 
  | 'striker' 
  | 'woods' 
  | 'price' 
  | 'nikolai' 
  | 'boris' 
  | 'jax' 
  | 'ramirez';

export interface Outfit {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  priceDiamonds?: number;
  priceCoins?: number;
  unlockedByDefault?: boolean;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    pattern?: string;
  };
  description: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  callsign: string;
  role: string;
  gender: 'Male';
  quote: string;
  bio: string;
  baseHealth: number;
  baseSpeed: number;
  specialAbility: {
    name: string;
    icon: string;
    description: string;
    cooldownSeconds: number;
    durationSeconds: number;
    type: 'sprint' | 'heal' | 'uav' | 'berserk' | 'armor' | 'grenade' | 'emp' | 'snipe';
  };
  priceDiamonds: number;
  priceCoins: number;
  isUnlocked: boolean;
  outfits: Outfit[];
  equippedOutfitId: string;
}

export type WeaponCategory = 'AR' | 'Sniper' | 'SMG' | 'Shotgun' | 'LMG' | 'Pistol';

export interface WeaponSkin {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  priceDiamonds: number;
  unlockedByDefault?: boolean;
  glowColor?: string;
  primaryColor: string;
  pattern: string;
  description: string;
}

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  damage: number;
  fireRate: number; // rounds per minute
  magazineSize: number;
  reloadTime: number; // seconds
  bulletSpeed: number;
  range: number;
  recoil: number;
  soundType: 'ar' | 'sniper' | 'smg' | 'shotgun' | 'lmg' | 'pistol';
  priceDiamonds: number;
  priceCoins: number;
  isUnlocked: boolean;
  skins: WeaponSkin[];
  equippedSkinId: string;
}

export interface VehicleSkin {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  priceDiamonds: number;
  unlockedByDefault?: boolean;
  color: string;
  accentColor: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Buggy' | 'Armored Jeep' | 'Cyber Car' | 'Tactical Quad';
  maxSpeed: number;
  acceleration: number;
  durability: number;
  handling: number;
  capacity: number;
  priceDiamonds: number;
  priceCoins: number;
  isUnlocked: boolean;
  skins: VehicleSkin[];
  equippedSkinId: string;
}

export interface TopUpBundle {
  id: string;
  name: string;
  tag?: string;
  diamonds: number;
  coins: number;
  priceAmount: number;
  currencySymbol: string;
  bonusPercentage?: number;
  bonusItem?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'In Lobby' | 'In Battle Royale' | 'In Training' | 'Offline';
  rank: string;
  level: number;
  isInSquad?: boolean;
}

export type GameMode = 'BATTLE_ROYALE' | 'TEAM_DEATHMATCH' | 'SHOOTING_RANGE';

export interface PlayerStats {
  kills: number;
  wins: number;
  matchesPlayed: number;
  headshots: number;
  damageDealt: number;
  rank: string;
  level: number;
  experience: number;
}
