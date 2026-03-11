import { useState, useEffect, useRef } from "react";
import { petAPI } from "@/services/api";

const PET_EMOJI = {
  cat: "🐱",
  dragon: "🐉",
  robot: "🤖"
};

const XP_PER_LEVEL = 100;

function getPetTypeByLevel(level) {
  if (level >= 31) return "robot";
  if (level >= 11) return "dragon";
  return "cat";
}

export default function StudyPet({ compact = false }) {

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [blink, setBlink] = useState(false);
  const [isHappy, setIsHappy] = useState(false);

  const [evolving, setEvolving] = useState(false);
  const prevType = useRef(null);

  useEffect(() => {

    petAPI.get()
      .then(res => setPet(res.data))
      .catch(() => {
        setPet({
          level: 1,
          xp: 0,
          name: "Безымянный"
        })
      })
      .finally(() => setLoading(false))

  }, []);

  useEffect(() => {

    if (!pet) return

    setIsHappy(true)

    const t = setTimeout(() => setIsHappy(false), 1200)

    return () => clearTimeout(t)

  }, [pet?.xp, pet?.level])

  useEffect(() => {

    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 200)
    }, 5000 + Math.random() * 3000)

    return () => clearInterval(interval)

  }, [])

  useEffect(() => {

    if (!pet) return

    const newType = getPetTypeByLevel(pet.level)

    if (prevType.current && prevType.current !== newType) {

      setEvolving(true)

      setTimeout(() => {
        setEvolving(false)
      }, 2000)

    }

    prevType.current = newType

  }, [pet?.level])

  if (loading) {
    return (
      <div className="w-full p-8 rounded-2xl bg-indigo-600 animate-pulse"/>
    )
  }

  const petType = getPetTypeByLevel(pet.level)

  const xpInLevel = pet.xp % XP_PER_LEVEL
  const progress = (xpInLevel / XP_PER_LEVEL) * 100

const traits = {

  cat: {
    emoji: blink ? "😸" : "🐱",
    anim: "animate-[petFloat_4s_ease-in-out_infinite]"
  },

  dragon: {
    emoji: "🐉",
    anim: `animate-[dragonFloat_6s_ease-in-out_infinite] ${
      blink ? "scale-95" : "scale-100"
    }`
  },

  robot: {
    emoji: "🤖",
    anim: `animate-[robotHover_5s_ease-in-out_infinite] ${
      blink ? "brightness-125" : "brightness-100"
    }`
  }

}[petType]

  return (

    <div className="w-full rounded-3xl bg-gradient-to-br from via-blue-700 to-blue-800 text-white shadow-2xl p-8 relative overflow-hidden">

      <div className="flex flex-col items-center text-center">

        <div className="relative mb-6">

          {evolving && (
            <div className="absolute w-56 h-56 rounded-full bg-purple-400/40 blur-2xl animate-ping"/>
          )}

          <div
            className={`
            text-[8rem]
            transition-all duration-700
            ${traits.anim}
            ${isHappy ? "scale-110" : ""}
            ${evolving ? "opacity-60 scale-125" : ""}
            `}
          >
            {traits.emoji}
          </div>

          {evolving && (
            <div className="absolute inset-0 pointer-events-none">

              <span className="absolute left-6 top-6 text-xl animate-bounce">✨</span>
              <span className="absolute right-6 top-10 text-xl animate-bounce delay-200">✨</span>
              <span className="absolute bottom-8 left-10 text-xl animate-bounce delay-300">✨</span>
              <span className="absolute bottom-10 right-10 text-xl animate-bounce delay-500">✨</span>

            </div>
          )}

        </div>

        {!compact && (

          <>
            <h2 className="text-3xl font-bold mb-2">
              {pet.name || "StudyPet"}
            </h2>

            <p className="text-xl">
              Уровень <span className="text-yellow-300">{pet.level}</span>
            </p>

            <div className="w-full max-w-md mt-4 h-6 bg-black/30 rounded-full overflow-hidden relative">

              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />

              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {Math.round(progress)}% · {xpInLevel}/{XP_PER_LEVEL}
              </div>

            </div>
          </>

        )}

      </div>

    </div>
  )
} 