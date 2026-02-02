import DeckCard from '../../../components/decks/DeckCard';
import Card from '../../../components/cards/Card';
import { Search, BookOpen } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function DecksGrid({ items, type = 'decks', emptyMessage = 'Нет колод', onCreate }) {
  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        {type === 'search' ? (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
            <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска</p>
          </>
        ) : (
          <>
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{emptyMessage}</h3>
            <p className="text-gray-600 mb-6">Создайте свою первую {type === 'decks' ? 'колоду' : 'папку'}</p>
            {onCreate && (
              <Button onClick={onCreate}>
                Создать {type === 'decks' ? 'колоду' : 'папку'}
              </Button>
            )}
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => (
        <DeckCard key={item.id} deck={item} />
      ))}
    </div>
  );
}