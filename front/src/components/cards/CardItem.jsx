import { Edit2, Trash2, Calendar } from 'lucide-react';

export default function CardItem({ card, onEdit, onDelete }) {
  const statusColor =
    card.repetitions === 0 ? 'blue' :
    card.repetitions < 3  ? 'yellow' : 'green';

  const statusText =
    card.repetitions === 0 ? '🆕 Новая' :
    card.repetitions < 3  ? '📚 Изучается' : '✅ Выучена';

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="flex-1 w-full">
          <p className="font-medium text-gray-900 mb-2 break-words">{card.front}</p>
          <p className="text-gray-600 text-sm break-words">{card.back}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 bg-${statusColor}-500`}></span>
              Повторений: {card.repetitions}
            </span>
            {card.next_review && (
              <span className="flex items-center">
                <Calendar size={12} className="mr-1" />
                {new Date(card.next_review).toLocaleDateString('ru-RU')}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded bg-${statusColor}-100 text-${statusColor}-700`}>
              {statusText}
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => onEdit(card)}
            className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}