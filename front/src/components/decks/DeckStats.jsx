import { BookOpen, Calendar, PlusCircle, Sparkles } from 'lucide-react';
import Card from '../cards/Card';

export default function DeckStats({ total, dueToday, newCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
      {/* Всего карточек */}
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-white border border-gray-200/70 rounded-2xl p-6 sm:p-7">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-gray-100/40 to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <BookOpen size={22} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
            </div>
            <p className="text-sm font-medium text-gray-600">Всего карточек</p>
          </div>
          <Sparkles size={18} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {total}
        </p>
      </Card>

      {/* На повторение */}
      <Card className={`
        relative overflow-hidden group transition-all duration-300 rounded-2xl p-6 sm:p-7
        ${dueToday > 0 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50/70 border-2 border-blue-200/60 shadow-blue-100/40 hover:shadow-blue-200/60 hover:border-blue-300'
          : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200/70'
        }
      `}>
        <div className={`
          absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-indigo-400/5 
          ${dueToday > 0 ? 'animate-pulse-slow' : ''} 
          group-hover:scale-105 transition-transform duration-700
        `} />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`
              w-11 h-11 rounded-xl flex items-center justify-center transition-all
              ${dueToday > 0 ? 'bg-blue-100' : 'bg-gray-100'}
              group-hover:scale-110
            `}>
              <Calendar size={22} className={dueToday > 0 ? 'text-blue-600' : 'text-gray-500'} />
            </div>
            <p className="text-sm font-medium text-gray-700">На повторение</p>
          </div>
          {dueToday > 0 && (
            <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold animate-pulse">
              Активно
            </div>
          )}
        </div>
        
        <p className={`
          text-4xl sm:text-5xl font-extrabold tracking-tight relative z-10
          ${dueToday > 0 ? 'text-blue-700' : 'text-gray-400'}
        `}>
          {dueToday}
        </p>
      </Card>

      {/* Новые карточки */}
      <Card className={`
        relative overflow-hidden group transition-all duration-300 rounded-2xl p-6 sm:p-7
        ${newCount > 0 
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50/60 border-2 border-emerald-200/60 shadow-emerald-100/40 hover:shadow-emerald-200/60 hover:border-emerald-300'
          : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200/70'
        }
      `}>
        <div className={`
          absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-teal-400/5 
          ${newCount > 0 ? 'animate-pulse-slow' : ''} 
          group-hover:scale-105 transition-transform duration-700
        `} />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`
              w-11 h-11 rounded-xl flex items-center justify-center transition-all
              ${newCount > 0 ? 'bg-emerald-100' : 'bg-gray-100'}
              group-hover:scale-110
            `}>
              <PlusCircle size={22} className={newCount > 0 ? 'text-emerald-600' : 'text-gray-500'} />
            </div>
            <p className="text-sm font-medium text-gray-700">Новые карточки</p>
          </div>
          {newCount > 0 && (
            <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
              +{newCount}
            </div>
          )}
        </div>
        
        <p className={`
          text-4xl sm:text-5xl font-extrabold tracking-tight relative z-10
          ${newCount > 0 ? 'text-emerald-700' : 'text-gray-400'}
        `}>
          {newCount}
        </p>
      </Card>
    </div>
  );
}