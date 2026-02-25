import Card from '../cards/Card';

export default function DeckStats({ total, dueToday, newCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <Card className="p-5 sm:p-6">
        <p className="text-muted text-sm font-medium">Всего карточек</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{total}</p>
      </Card>
      <Card className="p-5 sm:p-6 border-l-4 border-l-blue-500">
        <p className="text-muted text-sm font-medium">На повторение</p>
        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{dueToday}</p>
      </Card>
      <Card className="p-5 sm:p-6 border-l-4 border-l-green-500">
        <p className="text-muted text-sm font-medium">Новые карточки</p>
        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{newCount}</p>
      </Card>
    </div>
  );
}