import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function DeckHeader({ deck, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <button
          onClick={() => navigate('/decks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{deck?.name}</h1>
          {deck?.description && (
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{deck.description}</p>
          )}
        </div>
      </div>

      <Button
        variant="danger"
        onClick={onDelete}
        className="w-full sm:w-auto"
      >
        <Trash2 size={20} />
        <span className="ml-2 sm:hidden">Удалить</span>
      </Button>
    </div>
  );
}