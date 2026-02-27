import { BookOpen, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../cards/Card';

export default function DeckCard({ deck }) {
  const color = deck.color || '#3B82F6';

  return (
    <Link 
      to={`/decks/${deck.id}`}
      className="block h-full group"
    >
      <Card 
        className={`
          h-full flex flex-col overflow-hidden
          bg-white border border-gray-200/70 rounded-2xl
          shadow-sm hover:shadow-xl transition-all duration-300
          group-hover:-translate-y-1 group-hover:border-gray-300/80
        `}
      >
        {/* Верхняя часть с иконкой */}
        <div className="p- pb-4">
          <div className="flex items-start justify-between">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${color}15` }}
            >
              <BookOpen 
                size={26} 
                style={{ color }} 
                className="transition-transform duration-300 group-hover:rotate-6"
              />
            </div>

            {/* Маленький бейдж с количеством карточек на сегодня */}
            {deck.cards_due_today > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <Calendar size={14} />
                <span>{deck.cards_due_today}</span>
              </div>
            )}
          </div>
        </div>

        {/* Основной контент */}
        <div className="px-6 pb-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors line-clamp-2">
            {deck.name}
          </h3>

          {deck.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
              {deck.description}
            </p>
          )}
        </div>

      
      </Card>
    </Link>
  );
}