import Card from '../../../components/cards/Card';
import Button from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import CardItem from '../../../components/cards/CardItem'; 
import { CardFilters } from '../../../components/cards/CardFilters';

export default function CardsList({
  cards,
  statsCards,
  filters,
  onFilterChange,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  onResetFilters,
}) {
  const hasFilters = filters.search || filters.status;

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Карточки</h2>
          {cards.length !== statsCards.length && (
            <p className="text-sm text-gray-500 mt-1">
              Показано {cards.length} из {statsCards.length} карточек
            </p>
          )}
        </div>
        <Button onClick={onCreateCard} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Добавить карточку
        </Button>
      </div>

      <CardFilters
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {cards.length > 0 ? (
        <div className="space-y-3 mt-6">
          {cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={() => onEditCard(card)}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {hasFilters ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">Карточки не найдены</p>
              <Button variant="secondary" onClick={onResetFilters} className="w-full sm:w-auto">
                Сбросить фильтры
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">В колоде пока нет карточек</p>
              <Button onClick={onCreateCard} className="w-full sm:w-auto">
                Добавить первую карточку
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}