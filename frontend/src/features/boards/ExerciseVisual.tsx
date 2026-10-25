import React from 'react';
import type { ExerciseCategory, ExerciseInfo } from './exerciseDatabase';

interface ExerciseVisualProps {
  exercise: ExerciseInfo;
}

/** Eğik sehpa diyagramını kullanan hareketler. */
const INCLINE_DIAGRAM_IDS = new Set([
  'incline-dumbbell-press',
  'incline-barbell-bench-press',
  'incline-dumbbell-fly',
]);

const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  Göğüs: '🏋️',
  Sırt: '🧗',
  Omuz: '🤸',
  Bacak: '🦵',
  Kol: '💪',
  Karın: '🧘',
  Kardiyo: '🏃',
};

/** Uzun ekipman listesinden ilk öğeyi alır. */
const firstItem = (text?: string): string => (text ? text.split(',')[0].trim() : 'Serbest Ağırlık');

const Pill: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${className}`}>{children}</span>
);

export const ExerciseVisual: React.FC<ExerciseVisualProps> = ({ exercise }) => {
  const primaryMuscle = exercise.targetMuscles.primary[0] ?? exercise.category;
  const hasBenchAngle = !!exercise.benchAngle && exercise.benchAngle !== 'Standart Pozisyon';

  // Eğik sehpa hareketleri için detaylı biyomekanik açı diyagramı
  if (INCLINE_DIAGRAM_IDS.has(exercise.id)) {
    return (
      <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <svg
          viewBox="0 0 400 240"
          className="w-full h-full max-w-sm drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`${exercise.name} için sehpa açısı diyagramı`}
        >
          {/* Ground Floor */}
          <line x1="40" y1="210" x2="360" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Bench Frame */}
          <path d="M 80 210 L 150 210 L 140 160" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <path d="M 280 210 L 220 210 L 230 160" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

          {/* Inclined Backrest */}
          <line x1="120" y1="180" x2="260" y2="80" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
          <line x1="120" y1="180" x2="260" y2="80" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

          {/* Flat Seat */}
          <line x1="90" y1="185" x2="135" y2="185" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
          <line x1="90" y1="185" x2="135" y2="185" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

          {/* Angle Arc Indicator */}
          <path d="M 180 180 A 50 50 0 0 1 175 145" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" fill="none" />
          <text x="188" y="162" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            {exercise.benchAngle ?? '30° - 45°'}
          </text>

          {/* Athlete: Head */}
          <circle cx="265" cy="70" r="14" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />

          {/* Torso on Incline */}
          <line x1="145" y1="170" x2="245" y2="95" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />

          {/* Target Muscle: Upper Chest Highlight */}
          <path
            d="M 215 105 Q 235 95 240 115 Q 220 125 215 105 Z"
            fill="#06b6d4"
            className="animate-pulse"
            opacity="0.9"
          />

          {/* Arm and Weight */}
          <path d="M 225 105 L 210 50" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
          <line x1="195" y1="46" x2="225" y2="46" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
          <rect x="190" y="36" width="6" height="20" rx="2" fill="#60a5fa" />
          <rect x="224" y="36" width="6" height="20" rx="2" fill="#60a5fa" />

          {/* Motion Path */}
          <path d="M 210 90 Q 195 65 210 50" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" fill="none" />

          {/* Target Muscle Badge */}
          <g transform="translate(260, 115)">
            <rect x="0" y="0" width="110" height="24" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
            <circle cx="10" cy="12" r="4" fill="#06b6d4" />
            <text x="20" y="16" fill="#e2e8f0" fontSize="10" fontWeight="600" fontFamily="sans-serif">
              Üst Göğüs Odağı
            </text>
          </g>
        </svg>

        {/* Hareketin verisinden türetilen bilgi etiketleri */}
        <div className="flex items-center gap-2 mt-1 z-10 flex-wrap justify-center">
          <Pill className="bg-blue-500/15 border-blue-500/30 text-blue-300">🎯 Hedef: {primaryMuscle}</Pill>
          {hasBenchAngle && (
            <Pill className="bg-slate-800 border-slate-700 text-slate-300">📐 Eğim: {exercise.benchAngle}</Pill>
          )}
          <Pill className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
            🏋️ {firstItem(exercise.equipment)}
          </Pill>
        </div>
      </div>
    );
  }

  // Diğer tüm hareketler için kategoriye özel kart
  return (
    <div className="relative w-full min-h-48 sm:min-h-56 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 flex flex-col items-center justify-center overflow-hidden shadow-inner">
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: exercise.accentColor }}
      />

      {/* Blueprint Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border"
          style={{
            backgroundColor: `${exercise.accentColor}20`,
            borderColor: `${exercise.accentColor}40`,
            color: exercise.accentColor,
          }}
          aria-hidden="true"
        >
          <span className="text-3xl leading-none">{CATEGORY_ICONS[exercise.category] || '🏋️'}</span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">{exercise.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{exercise.nameTr}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Pill className="bg-slate-800 text-slate-300 border-slate-700">{exercise.category}</Pill>
          <Pill className="bg-blue-500/20 text-blue-300 border-blue-500/30">{primaryMuscle}</Pill>
          <Pill className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{exercise.difficulty} Seviye</Pill>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Pill className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
            🏋️ {firstItem(exercise.equipment)}
          </Pill>
          {hasBenchAngle && (
            <Pill className="bg-slate-800 border-slate-700 text-slate-300">📐 {exercise.benchAngle}</Pill>
          )}
        </div>
      </div>
    </div>
  );
};