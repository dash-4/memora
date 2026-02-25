import { useState, useEffect } from 'react';
import { petAPI } from '@/services/api';

const PET_EMOJI = { cat: '🐱', dragon: '🐲', robot: '🤖' };
const XP_PER_LEVEL = 100;

export default function StudyPet({ onLevelUp, compact = false }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    petAPI.get()
      .then((res) => {
        if (!cancelled) setPet(res.data);
      })
      .catch(() => { if (!cancelled) setPet({ pet_type: 'cat', level: 1, xp: 0, streak_days: 0 }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pet) return;
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [pet?.xp, pet?.level]);

  if (loading || !pet) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-r from-[#1E40AF] to-[#6366f1] p-6 min-h-[140px] animate-pulse" />
    );
  }

  const emoji = PET_EMOJI[pet.pet_type] || '🐱';
  const xpInLevel = pet.xp % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-r from-[#1E40AF] to-[#6366f1] text-white overflow-hidden ${compact ? 'p-4' : 'p-6 sm:p-8'} ${pulse ? 'animate-pulse' : ''}`}
      style={{ animation: pulse ? 'scaleIn 0.4s ease' : undefined }}
    >
      <div className="flex flex-col items-center text-center">
        <span className="text-[6rem] leading-none select-none" role="img" aria-label={pet.pet_type}>
          {emoji}
        </span>
        {!compact && (
          <>
            <h2 className="text-[28px] font-bold mt-2">Твой StudyPet</h2>
            <p className="text-[20px] font-medium opacity-90">Уровень {pet.level}</p>
            <div className="w-full max-w-xs mt-4 h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm mt-1 opacity-80">{xpInLevel} / {XP_PER_LEVEL} XP</p>
            {pet.streak_days > 0 && (
              <p className="text-[#F59E0B] font-semibold mt-2">Streak: {pet.streak_days} дней 🔥</p>
            )}
          </>
        )}
        {compact && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[20px] font-medium">Ур. {pet.level}</span>
            {pet.streak_days > 0 && <span className="text-[#F59E0B] text-sm">🔥 {pet.streak_days}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
