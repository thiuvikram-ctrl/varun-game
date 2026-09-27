import React, { useState } from 'react';
import { Friend } from '../types/game';
import { sound } from '../utils/audio';
import { 
  Users, UserPlus, Check, X, Shield, MessageSquare, 
  Send, Circle, Plus, Radio, UserCheck
} from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onAddFriend: (username: string) => void;
  onToggleSquad: (friendId: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  friends,
  onAddFriend,
  onToggleSquad,
}) => {
  const [newFriendName, setNewFriendName] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'chat'>('friends');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Bravo_Ghost_99', text: 'Squad ready for Warzone drop! Lock and load.', time: '23:14' },
    { sender: 'ViperStrike_Tamil', text: 'Got the sniper rifle equipped, I will cover long range.', time: '23:15' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    sound.playClick();
    onAddFriend(newFriendName.trim());
    setNewFriendName('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sound.playClick();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { sender: 'You', text: inputMsg.trim(), time: timeStr }]);
    setInputMsg('');

    // Simulated squad response
    setTimeout(() => {
      const responses = [
        'Roger that! Moving into defensive position.',
        'Copy! Awaiting coordinates.',
        'Enemy patrol sighted on radar, eyes open!',
        'Affirmative, let us push the safe zone.',
      ];
      const botResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [
        ...prev, 
        { sender: 'Bravo_Ghost_99', text: botResponse, time: timeStr }
      ]);
      sound.playHitmarker(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="tactical-border w-full max-w-2xl bg-[#090c13] max-h-[88vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-military text-2xl text-amber-400 tracking-wider">
                TACTICAL SQUAD & FRIENDS NETWORK
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-tactical">
                <span>WARZONE COMMS</span>
                <span aria-hidden="true">·</span>
                <span>ONLINE SQUAD INVITES</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-black/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-colors ${
              activeTab === 'friends'
                ? 'bg-amber-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FRIENDS ROSTER ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded font-tactical text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SQUAD RADIO COMMS</span>
          </button>
        </div>

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="p-4 md:p-6 overflow-y-auto space-y-4">
            {/* Add Friend Form */}
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="text"
                value={newFriendName}
                onChange={e => setNewFriendName(e.target.value)}
                placeholder="Enter Tactical GamerTag (e.g. Shadow_Ranger_99)"
                className="flex-1 px-3 py-2 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>ADD FRIEND</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-2">
              {friends.map(friend => (
                <div
                  key={friend.id}
                  className="p-3 bg-[#0d1017] border border-slate-800/80 rounded flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-tactical font-bold text-sm">
                      {friend.username.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-tactical font-bold text-sm text-white">
                          {friend.username}
                        </span>
                        <span className="text-[10px] text-slate-400 font-tactical px-1.5 py-0.5 bg-black/60 rounded">
                          Lv.{friend.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-tactical">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Circle
                            className={`w-2 h-2 fill-current ${
                              friend.status === 'In Lobby'
                                ? 'text-emerald-400'
                                : friend.status === 'In Battle Royale'
                                ? 'text-amber-400'
                                : friend.status === 'In Training'
                                ? 'text-cyan-400'
                                : 'text-slate-600'
                            }`}
                          />
                          <span>{friend.status}</span>
                        </span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-slate-500">{friend.rank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Squad Action */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleSquad(friend.id);
                    }}
                    className={`px-3 py-1.5 rounded font-tactical text-xs font-bold transition-all ${
                      friend.isInSquad
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {friend.isInSquad ? 'IN SQUAD' : '+ INVITE SQUAD'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SQUAD RADIO COMMS CHAT */}
        {activeTab === 'chat' && (
          <div className="p-4 md:p-6 flex flex-col h-[400px]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 mb-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded text-xs font-tactical max-w-[80%] ${
                    msg.sender === 'You'
                      ? 'ml-auto bg-amber-500/15 border border-amber-500/30 text-amber-200'
                      : 'bg-black/60 border border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-white">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Quick Callouts */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
              {['Cover me!', 'Need ammo!', 'Enemy spotted!', 'Push safe zone!'].map(callout => (
                <button
                  key={callout}
                  onClick={() => {
                    setInputMsg(callout);
                  }}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-[11px] font-tactical text-slate-300 whitespace-nowrap"
                >
                  {callout}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder="Broadcast to tactical squad radio..."
                className="flex-1 px-3 py-2 bg-black/70 border border-slate-800 rounded text-xs font-tactical text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-tactical font-bold text-xs rounded transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SEND</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
