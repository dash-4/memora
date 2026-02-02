import { BookOpen, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../cards/Card';

export default function DeckCard({ deck }) {
  return (
    <Link to={`/decks/${deck.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: (deck.color || '#3B82F6') + '20' }}
          >
            <BookOpen size={24} style={{ color: deck.color || '#3B82F6' }} />
          </div>
        </div>

        <div className="flex-1 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
            {deck.name}
          </h3>
          <div className="min-h-[40px]">
            {deck.description && (
              <p className="text-gray-600 text-sm line-clamp-2 break-words">
                {deck.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500 pt-4 border-t mt-auto">
          <div className="flex items-center">
            <BookOpen size={16} className="mr-1 shrink-0" />
            <span>{deck.total_cards || 0} карточек</span>
          </div>
          {deck.cards_due_today > 0 && (
            <div className="flex items-center text-blue-600 font-medium">
              <Calendar size={16} className="mr-1 shrink-0" />
              <span>{deck.cards_due_today} на сегодня</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}