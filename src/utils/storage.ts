import { CharacterId, PlayerStats, Friend } from '../types/game';
import { CHARACTERS, WEAPONS, VEHICLES, INITIAL_FRIENDS } from '../data/gameData';

const STORAGE_KEY = 'cod_warzone_tactical_v1';

export interface UserGameState {
  diamonds: number;
  coins: number;
  lastMonthlyClaimTime: number; // timestamp
  lastDailyClaimTime: number; // timestamp
  selectedCharacterId: CharacterId;
  unlockedCharacterIds: CharacterId[];
  equippedCharacterOutfit: Record<string, string>; // charId -> outfitId
  selectedPrimaryWeaponId: string;
  selectedSecondaryWeaponId: string;
  unlockedWeaponIds: string[];
  equippedWeaponSkins: Record<string, string>; // weaponId -> skinId
  selectedVehicleId: string;
  unlockedVehicleIds: string[];
  equippedVehicleSkins: Record<string, string>; // vehicleId -> skinId
  friends: Friend[];
  stats: PlayerStats;
}

const defaultState: UserGameState = {
  diamonds: 650, // generous starter diamonds so player can test top-up and purchase right away!
  coins: 8500,
  lastMonthlyClaimTime: 0, // ready to claim!
  lastDailyClaimTime: 0, // ready to claim!
  selectedCharacterId: 'ghost',
  unlockedCharacterIds: ['ghost', 'striker'],
  equippedCharacterOutfit: {
    ghost: 'ghost_default',
    striker: 'striker_desert',
    price: 'price_boonie',
    woods: 'woods_jungle',
    boris: 'boris_juggernaut',
    nikolai: 'nikolai_pilot',
    jax: 'jax_neon',
    ramirez: 'ramirez_ghillie',
  },
  selectedPrimaryWeaponId: 'm4a1',
  selectedSecondaryWeaponId: 'deagle',
  unlockedWeaponIds: ['m4a1', 'ak47', 'awm', 'deagle'],
  equippedWeaponSkins: {
    m4a1: 'm4a1_default',
    ak47: 'ak47_default',
    awm: 'awm_default',
    vector: 'vector_default',
    spas12: 'spas12_default',
    m249: 'm249_default',
    deagle: 'deagle_chrome',
  },
  selectedVehicleId: 'buggy',
  unlockedVehicleIds: ['buggy', 'jeep', 'quad'],
  equippedVehicleSkins: {
    buggy: 'buggy_olive',
    jeep: 'jeep_desert',
    hypercar: 'hyper_matrix',
    quad: 'quad_matte',
  },
  friends: INITIAL_FRIENDS,
  stats: {
    kills: 34,
    wins: 5,
    matchesPlayed: 14,
    headshots: 18,
    damageDealt: 12400,
    rank: 'Sergeant Major',
    level: 12,
    experience: 4800,
  },
};

export function loadGameState(): UserGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (err) {
    console.error('Failed to load game state from storage:', err);
    return defaultState;
  }
}

export function saveGameState(state: UserGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save game state to storage:', err);
  }
}
