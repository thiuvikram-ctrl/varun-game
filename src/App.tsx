import React, { useState, useEffect } from 'react';
import { loadGameState, saveGameState, UserGameState } from './utils/storage';
import { WEAPONS, VEHICLES } from './data/gameData';
import { FULL_250_CHARACTERS, MAP_ENVIRONMENTS, INITIAL_COMMUNITY_MAPS } from './data/rosterData';
import { CharacterRosterItem, MapEnvironment, GameModeKey, PublishedCommunityMap } from './types/characterRoster';
import { Lobby } from './components/Lobby';
import { Battleground3D } from './components/Battleground3D';
import { StoreModal } from './components/StoreModal';
import { ArmoryModal } from './components/ArmoryModal';
import { VehiclesModal } from './components/VehiclesModal';
import { FriendsModal } from './components/FriendsModal';
import { ApkModal } from './components/ApkModal';
import { Roster250Modal } from './components/Roster250Modal';
import { MapAudienceStudioModal } from './components/MapAudienceStudioModal';

export default function App() {
  const [gameState, setGameState] = useState<UserGameState>(loadGameState);
  const [currentView, setCurrentView] = useState<'LOBBY' | 'MATCH'>('LOBBY');
  const [selectedMode, setSelectedMode] = useState<GameModeKey>('BATTLE_ROYALE');

  // Characters (250 anime roster) & Maps (Forest & Audience Studio)
  const [charactersRoster, setCharactersRoster] = useState<CharacterRosterItem[]>(() => {
    // Merge unlock status with localStorage if any
    return FULL_250_CHARACTERS;
  });

  const [activeCharacterId, setActiveCharacterId] = useState<string>('char_1');
  const [officialMaps] = useState<MapEnvironment[]>(MAP_ENVIRONMENTS);
  const [communityMaps, setCommunityMaps] = useState<PublishedCommunityMap[]>(INITIAL_COMMUNITY_MAPS);
  const [selectedMap, setSelectedMap] = useState<MapEnvironment>(MAP_ENVIRONMENTS[0]);

  // Modals
  const [storeOpen, setStoreOpen] = useState(false);
  const [armoryOpen, setArmoryOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [apkOpen, setApkOpen] = useState(false);
  const [mapStudioOpen, setMapStudioOpen] = useState(false);

  // Sync to storage
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Active items
  const activeCharacter = charactersRoster.find(c => c.id === activeCharacterId) || charactersRoster[0];
  const activePrimaryWeapon = WEAPONS.find(w => w.id === gameState.selectedPrimaryWeaponId) || WEAPONS[0];
  const activeSecondaryWeapon = WEAPONS.find(w => w.id === gameState.selectedSecondaryWeaponId) || WEAPONS[WEAPONS.length - 1];
  const activeVehicle = VEHICLES.find(v => v.id === gameState.selectedVehicleId) || VEHICLES[0];

  // Top Up diamonds & coins
  const handleTopUp = (diamondsToAdd: number, coinsToAdd: number) => {
    setGameState(prev => ({
      ...prev,
      diamonds: prev.diamonds + diamondsToAdd,
      coins: prev.coins + coinsToAdd,
    }));
  };

  const handleClaimMonthly = () => {
    setGameState(prev => ({
      ...prev,
      diamonds: prev.diamonds + 150,
      coins: prev.coins + 5000,
      lastMonthlyClaimTime: Date.now(),
    }));
  };

  const handleClaimDaily = () => {
    setGameState(prev => ({
      ...prev,
      diamonds: prev.diamonds + 25,
      coins: prev.coins + 1000,
      lastDailyClaimTime: Date.now(),
    }));
  };

  // 250 Character Selection & Unlocks
  const handleSelectCharacter = (char: CharacterRosterItem) => {
    setActiveCharacterId(char.id);
  };

  const handleUnlockCharacter = (charId: string, costDiamonds: number, costCoins: number): boolean => {
    if (gameState.diamonds >= costDiamonds && costDiamonds > 0) {
      setGameState(prev => ({
        ...prev,
        diamonds: prev.diamonds - costDiamonds,
      }));
      setCharactersRoster(prev => prev.map(c => c.id === charId ? { ...c, unlocked: true } : c));
      return true;
    } else if (gameState.coins >= costCoins && costCoins > 0) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - costCoins,
      }));
      setCharactersRoster(prev => prev.map(c => c.id === charId ? { ...c, unlocked: true } : c));
      return true;
    }
    return false;
  };

  // Weapons & Skins
  const handleEquipWeapon = (weaponId: string, slot: 'primary' | 'secondary') => {
    setGameState(prev => ({
      ...prev,
      [slot === 'primary' ? 'selectedPrimaryWeaponId' : 'selectedSecondaryWeaponId']: weaponId,
    }));
  };

  const handleEquipWeaponSkin = (weaponId: string, skinId: string) => {
    setGameState(prev => ({
      ...prev,
      equippedWeaponSkins: {
        ...prev.equippedWeaponSkins,
        [weaponId]: skinId,
      },
    }));
  };

  const handleUnlockWeapon = (weaponId: string, costDiamonds: number, costCoins: number): boolean => {
    if (gameState.diamonds >= costDiamonds && costDiamonds > 0) {
      setGameState(prev => ({
        ...prev,
        diamonds: prev.diamonds - costDiamonds,
        unlockedWeaponIds: [...prev.unlockedWeaponIds, weaponId],
      }));
      return true;
    } else if (gameState.coins >= costCoins && costCoins > 0) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - costCoins,
        unlockedWeaponIds: [...prev.unlockedWeaponIds, weaponId],
      }));
      return true;
    }
    return false;
  };

  const handleUnlockWeaponSkin = (weaponId: string, skinId: string, costDiamonds: number): boolean => {
    if (gameState.diamonds >= costDiamonds) {
      setGameState(prev => ({
        ...prev,
        diamonds: prev.diamonds - costDiamonds,
        equippedWeaponSkins: {
          ...prev.equippedWeaponSkins,
          [weaponId]: skinId,
        },
      }));
      return true;
    }
    return false;
  };

  // Vehicles
  const handleSelectVehicle = (vehicleId: string) => {
    setGameState(prev => ({ ...prev, selectedVehicleId: vehicleId }));
  };

  const handleEquipVehicleSkin = (vehicleId: string, skinId: string) => {
    setGameState(prev => ({
      ...prev,
      equippedVehicleSkins: { ...prev.equippedVehicleSkins, [vehicleId]: skinId },
    }));
  };

  const handleUnlockVehicle = (vehicleId: string, costDiamonds: number, costCoins: number): boolean => {
    if (gameState.diamonds >= costDiamonds && costDiamonds > 0) {
      setGameState(prev => ({
        ...prev,
        diamonds: prev.diamonds - costDiamonds,
        unlockedVehicleIds: [...prev.unlockedVehicleIds, vehicleId],
      }));
      return true;
    }
    return false;
  };

  const handleUnlockVehicleSkin = (vehicleId: string, skinId: string, costDiamonds: number): boolean => {
    if (gameState.diamonds >= costDiamonds) {
      setGameState(prev => ({
        ...prev,
        diamonds: prev.diamonds - costDiamonds,
        equippedVehicleSkins: { ...prev.equippedVehicleSkins, [vehicleId]: skinId },
      }));
      return true;
    }
    return false;
  };

  // Community Map Publishing
  const handlePublishMap = (newMap: PublishedCommunityMap) => {
    setCommunityMaps(prev => [newMap, ...prev]);
  };

  const handleUpvoteMap = (mapId: string) => {
    setCommunityMaps(prev => prev.map(m => m.id === mapId ? { ...m, upvotes: m.upvotes + 1 } : m));
  };

  // Friends
  const handleAddFriend = (username: string) => {
    setGameState(prev => ({
      ...prev,
      friends: [
        {
          id: `fr_${Date.now()}`,
          username,
          avatar: 'crosshair',
          status: 'In Lobby',
          rank: 'Corporal I',
          level: 1,
          isInSquad: false,
        },
        ...prev.friends,
      ],
    }));
  };

  const handleToggleSquad = (friendId: string) => {
    setGameState(prev => ({
      ...prev,
      friends: prev.friends.map(f => f.id === friendId ? { ...f, isInSquad: !f.isInSquad } : f),
    }));
  };

  // Match Exit
  const handleExitMatch = (results?: { kills: number; damage: number; won: boolean; place: number }) => {
    if (results) {
      const earnedDiamonds = results.won ? 150 : 35;
      const earnedCoins = results.kills * 200 + 300;

      setGameState(prev => ({
        ...prev,
        diamonds: prev.diamonds + earnedDiamonds,
        coins: prev.coins + earnedCoins,
        stats: {
          ...prev.stats,
          kills: prev.stats.kills + results.kills,
          damageDealt: prev.stats.damageDealt + results.damage,
          matchesPlayed: prev.stats.matchesPlayed + 1,
          wins: results.won ? prev.stats.wins + 1 : prev.stats.wins,
        },
      }));
    }
    setCurrentView('LOBBY');
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#06070a]">
      {currentView === 'LOBBY' ? (
        <Lobby
          character={activeCharacter}
          primaryWeapon={activePrimaryWeapon}
          secondaryWeapon={activeSecondaryWeapon}
          vehicle={activeVehicle}
          selectedMap={selectedMap}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStartMatch={() => setCurrentView('MATCH')}
          diamonds={gameState.diamonds}
          coins={gameState.coins}
          friends={gameState.friends}
          lastMonthlyClaimTime={gameState.lastMonthlyClaimTime}
          onOpenStore={() => setStoreOpen(true)}
          onOpenArmory={() => setArmoryOpen(true)}
          onOpen250Roster={() => setRosterOpen(true)}
          onOpenVehicles={() => setVehiclesOpen(true)}
          onOpenFriends={() => setFriendsOpen(true)}
          onOpenApk={() => setApkOpen(true)}
          onOpenMapStudio={() => setMapStudioOpen(true)}
        />
      ) : (
        <Battleground3D
          mode={selectedMode}
          character={activeCharacter}
          primaryWeapon={activePrimaryWeapon}
          secondaryWeapon={activeSecondaryWeapon}
          vehicle={activeVehicle}
          mapEnv={selectedMap}
          onExitMatch={handleExitMatch}
          onOpenStore={() => setStoreOpen(true)}
        />
      )}

      {/* 250 ANIME CHARACTERS ROSTER MODAL */}
      <Roster250Modal
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        characters={charactersRoster}
        selectedCharacterId={activeCharacterId}
        diamonds={gameState.diamonds}
        coins={gameState.coins}
        onSelectCharacter={handleSelectCharacter}
        onUnlockCharacter={handleUnlockCharacter}
        onOpenStore={() => {
          setRosterOpen(false);
          setStoreOpen(true);
        }}
      />

      {/* MAPS & AUDIENCE CREATOR STUDIO */}
      <MapAudienceStudioModal
        isOpen={mapStudioOpen}
        onClose={() => setMapStudioOpen(false)}
        officialMaps={officialMaps}
        communityMaps={communityMaps}
        selectedMap={selectedMap}
        onSelectMap={setSelectedMap}
        onPublishMap={handlePublishMap}
        onUpvoteMap={handleUpvoteMap}
      />

      {/* STORE */}
      <StoreModal
        isOpen={storeOpen}
        onClose={() => setStoreOpen(false)}
        diamonds={gameState.diamonds}
        coins={gameState.coins}
        lastMonthlyClaimTime={gameState.lastMonthlyClaimTime}
        lastDailyClaimTime={gameState.lastDailyClaimTime}
        onTopUp={handleTopUp}
        onClaimMonthly={handleClaimMonthly}
        onClaimDaily={handleClaimDaily}
      />

      {/* ARMORY & GUNS */}
      <ArmoryModal
        isOpen={armoryOpen}
        onClose={() => setArmoryOpen(false)}
        weapons={WEAPONS}
        unlockedWeaponIds={gameState.unlockedWeaponIds}
        equippedWeaponSkins={gameState.equippedWeaponSkins}
        selectedPrimaryWeaponId={gameState.selectedPrimaryWeaponId}
        selectedSecondaryWeaponId={gameState.selectedSecondaryWeaponId}
        diamonds={gameState.diamonds}
        coins={gameState.coins}
        onEquipWeapon={handleEquipWeapon}
        onEquipSkin={handleEquipWeaponSkin}
        onUnlockWeapon={handleUnlockWeapon}
        onUnlockSkin={handleUnlockWeaponSkin}
        onOpenStore={() => {
          setArmoryOpen(false);
          setStoreOpen(true);
        }}
      />

      {/* VEHICLES */}
      <VehiclesModal
        isOpen={vehiclesOpen}
        onClose={() => setVehiclesOpen(false)}
        vehicles={VEHICLES}
        unlockedVehicleIds={gameState.unlockedVehicleIds}
        equippedVehicleSkins={gameState.equippedVehicleSkins}
        selectedVehicleId={gameState.selectedVehicleId}
        diamonds={gameState.diamonds}
        coins={gameState.coins}
        onSelectVehicle={handleSelectVehicle}
        onEquipSkin={handleEquipVehicleSkin}
        onUnlockVehicle={handleUnlockVehicle}
        onUnlockSkin={handleUnlockVehicleSkin}
        onOpenStore={() => {
          setVehiclesOpen(false);
          setStoreOpen(true);
        }}
      />

      {/* FRIENDS */}
      <FriendsModal
        isOpen={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        friends={gameState.friends}
        onAddFriend={handleAddFriend}
        onToggleSquad={handleToggleSquad}
      />

      {/* APK INSTALL */}
      <ApkModal
        isOpen={apkOpen}
        onClose={() => setApkOpen(false)}
      />
    </main>
  );
}
