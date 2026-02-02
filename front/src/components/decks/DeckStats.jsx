import Card from '../cards/Card'; 

export default function DeckStats({ total, dueToday, newCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <p className="text-gray-600 text-sm">Всего карточек</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">На повторение</p>
        <p className="text-3xl font-bold text-blue-600 mt-1">{dueToday}</p>
      </Card>
      <Card>
        <p className="text-gray-600 text-sm">Новые карточки</p>
        <p className="text-3xl font-bold text-green-600 mt-1">{newCount}</p>
      </Card>
    </div>
  );
}