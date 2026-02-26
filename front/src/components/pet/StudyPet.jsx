import { useState, useEffect, useRef } from 'react';
import { petAPI } from '@/services/api';

const PET_EMOJI = { cat: '🐱', dragon: '🐲', robot: '🤖' };
const XP_PER_LEVEL = 100;

export default function StudyPet({ onLevelUp, compact = false }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHappy, setIsHappy] = useState(false);
  const [blink, setBlink] = useState(false);

  // Состояния для имени
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    petAPI.get()
      .then((res) => {
        if (!cancelled) {
          setPet(res.data);
          setTempName(res.data?.name || 'StudyPet');
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = { pet_type: 'cat', level: 1, xp: 0, streak_days: 0, name: 'Безымянный' };
          setPet(fallback);
          setTempName('Безымянный');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pet) return;
    setIsHappy(true);
    setBlink(true);

    const happyTimer = setTimeout(() => setIsHappy(false), 1800);
    const blinkTimer = setTimeout(() => setBlink(false), 300);

    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 250);
    }, 5000 + Math.random() * 4000);

    return () => {
      clearTimeout(happyTimer);
      clearTimeout(blinkTimer);
      clearInterval(blinkInterval);
    };
  }, [pet?.xp, pet?.level]);

  // Фокус на input
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const saveName = async () => {
    const newName = tempName.trim();
    if (!newName || newName === (pet?.name || '')) {
      setIsEditingName(false);
      return;
    }
  
    setSavingName(true);
  
    try {
      const response = await petAPI.update({ name: newName });
  
      // Вариант А: доверяем ответу сервера
      if (response?.data) {
        setPet(response.data);
      } else {
        // Вариант Б: обновляем вручную (если сервер ничего полезного не вернул)
        setPet(prev => ({ ...prev, name: newName }));
      }
  
      setTempName(newName);
      setIsEditingName(false);
    } catch (err) {
      console.error('Ошибка сохранения имени:', err);
      alert('Не получилось сохранить');
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return <div className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 min-h-[160px] animate-pulse" />;
  }

  if (!pet || !pet.pet_type) {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-700 to-purple-800 p-8 text-white text-center">
        <div className="text-7xl mb-4">🐱</div>
        <p className="text-xl">Питомец не загрузился</p>
      </div>
    );
  }

  const emoji = PET_EMOJI[pet.pet_type] || '🐱';
  const xpInLevel = (pet.xp ?? 0) % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;
  const levelGlow = (pet.level ?? 0) >= 5 ? 'shadow-[0_0_25px_rgba(167,139,250,0.7)]' : '';

  const getPetTraits = () => {
    switch (pet.pet_type) {
      case 'cat':
        return {
          size: 'text-[8rem] sm:text-[9.5rem]',
          idle: 'animate-[catSway_5.5s_ease-in-out_infinite]',
          happy: 'scale-110 -rotate-6 animate-bounce',
          eyes: blink ? '😸' : '🐱',
        };
      case 'dragon':
        return {
          size: 'text-[9rem] sm:text-[10.5rem]',
          idle: 'animate-[dragonBreath_6s_ease-in-out_infinite]',
          happy: 'scale-115 animate-[pulse_1.4s]',
          eyes: blink ? '🐲' : '🐉',
        };
      case 'robot':
        return {
          size: 'text-[7.5rem] sm:text-[9rem]',
          idle: 'animate-[robotPulse_4s_infinite]',
          happy: 'animate-[spin_1.1s_ease-out] scale-110',
          eyes: blink ? '🤖' : '👾',
        };
      default:
        return {
          size: 'text-[8rem] sm:text-[9rem]',
          idle: '',
          happy: 'scale-105',
          eyes: emoji,
        };
    }
  };

  const traits = getPetTraits() || {
    size: 'text-8xl sm:text-9xl',
    idle: '',
    happy: 'scale-105',
    eyes: emoji,
  };

  const displayName = pet.name || 'Твой StudyPet';

  return (
    <div
      className={`
        w-full rounded-3xl bg-gradient-to-br from via-blue-700 to-blue-800
        text-white overflow-hidden shadow-2xl relative
        ${compact ? 'p-5' : 'p-6 sm:p-10'}
        transition-all duration-500
      `}
    >
      <div className={`absolute inset-0 opacity-30 ${levelGlow} animate-pulse-slow pointer-events-none`} />

      <div className="relative flex flex-col items-center text-center z-10">
        {/* Питомец */}
        <div className="relative mb-4 group">
          <div
            className={`
              relative 
              ${traits.size} 
              leading-none select-none transition-all duration-400 
              ${isHappy ? traits.happy : traits.idle}
            `}
          >
            <span>{traits.eyes}</span>
          </div>
        </div>

        {!compact && (
          <>
            <div className="min-h-[60px] flex items-center justify-center">
              {isEditingName ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
                  <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    disabled={savingName}
                    maxLength={18}
                    placeholder="Имя питомца"
                    className={`
                      bg-transparent text-3xl sm:text-4xl font-extrabold 
                      text-center outline-none border-b-2 border-white/60 
                      focus:border-white focus:text-white w-full sm:w-64
                      ${savingName ? 'opacity-60 cursor-wait' : ''}
                    `}
                  />
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={saveName}
                      disabled={savingName || !tempName.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                    >
                      {savingName ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      onClick={() => {
                        setTempName(pet?.name || 'StudyPet');
                        setIsEditingName(false);
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="group cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                >
                  <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 drop-shadow-lg tracking-tight group-hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                    {displayName}
                    <span className="opacity-80 group-hover:opacity-70 text-lg">✎</span>
                  </h2>
                </div>
              )}
            </div>

            {/* Уровень */}
            <p className="text-xl font-semibold mt-3 opacity-95 flex items-center gap-2 justify-center">
              Уровень <span className="text-yellow-300 animate-pulse">{pet.level ?? '?'}</span>
            </p>

            {/* Прогресс-бар */}
            <div className="w-full max-w-md mt-3 h-7 bg-black/30 rounded-full overflow-hidden relative shadow-inner backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-pink-500/20 animate-wave-fast pointer-events-none" />
              <div
                className="
                  h-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-500
                  rounded-full transition-all duration-800 ease-out
                  shadow-[0_0_30px_rgba(168,85,247,0.7)]
                  relative overflow-hidden
                "
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/10 animate-shine-fast pointer-events-none" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-base font-bold tracking-wider text-white drop-shadow-xl pointer-events-none">
                {Math.round(progress)}% · {xpInLevel}/{XP_PER_LEVEL}
              </div>
            </div>

           
          </>
        )}

        {compact && (
          <div className="mt-2 text-lg font-medium">
            {displayName.split(' ')[0]} · Lv {pet.level ?? '?'}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}