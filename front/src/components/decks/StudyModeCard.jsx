import { Calendar, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../cards/Card';

export default function StudyModeCard({
  mode,          
  count,
  deckId,
  available = true,
}) {
  const isLearning = mode === 'learning';

  const config = isLearning
    ? {
        title: 'Режим обучения',
        desc: 'Повторяйте карточки по расписанию и оценивайте, насколько легко вспомнили. Алгоритм запомнит и покажет сложные карточки чаще.',
        badge: 'Влияет на прогресс',
        badgeColor: 'green',
        icon: Calendar,
        iconColor: 'blue',
        buttonText: 'Начать обучение',
        buttonVariant: 'primary',
        emptyText: '🎉 Нет карточек на сегодня!',
      }
    : {
        title: 'Режим тренировки',
        desc: 'Просто повторяйте карточки без оценок. Отлично для быстрого просмотра перед экзаменом или когда хотите освежить память.',
        badge: 'Свободный режим',
        badgeColor: 'purple',
        icon: Dumbbell,
        iconColor: 'purple',
        buttonText: 'Начать тренировку',
        buttonVariant: 'secondary',
        emptyText: 'Добавьте карточки для тренировки',
      };

  const Icon = config.icon;

  return (
    <Card
      className={`border-2 border-${config.iconColor}-200 hover:border-${config.iconColor}-400 hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${config.iconColor}-100 rounded-xl flex items-center justify-center`}>
          <Icon size={24} className={`text-${config.iconColor}-600`} />
        </div>
        <span className={`px-3 py-1 bg-${config.badgeColor}-100 text-${config.badgeColor}-700 rounded-full text-xs font-medium`}>
          {config.badge}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{config.desc}</p>

      <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-gray-600">{isLearning ? 'На сегодня:' : 'Доступно:'}</p>
          <p className={`text-2xl font-bold text-${config.iconColor}-600`}>
            {count} <span className="text-sm font-normal text-gray-500">карточек</span>
          </p>
        </div>
      </div>

      {available ? (
        <Link to={`/study?deck=${deckId}&mode=${mode}`}>
          <Button
            variant={config.buttonVariant === 'secondary' ? 'secondary' : undefined}
            className={`w-full ${config.buttonVariant === 'secondary' ? 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50' : ''}`}
          >
            <Icon size={18} className="mr-2" />
            {config.buttonText}
          </Button>
        </Link>
      ) : (
        <div className={`text-center py-3 bg-${isLearning ? 'green' : 'gray'}-50 text-${isLearning ? 'green' : 'gray'}-700 rounded-lg text-sm font-medium`}>
          {config.emptyText}
        </div>
      )}
    </Card>
  );
}