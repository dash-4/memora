import { Link } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  Zap, 
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: 'Умный алгоритм',
      description: 'SM-2 алгоритм интервального повторения для эффективного запоминания'
    },
    {
      icon: Calendar,
      title: 'Персональное расписание',
      description: 'Система автоматически планирует повторения в оптимальное время'
    },
    {
      icon: Target,
      title: 'Отслеживание прогресса',
      description: 'Детальная статистика и визуализация вашего обучения'
    },
    {
      icon: Zap,
      title: 'Быстрое обучение',
      description: 'Два режима: обучение с алгоритмом и свободная тренировка'
    }
  ];

  const benefits = [
    'Запоминайте информацию надолго',
    'Экономьте время на повторениях',
    'Учитесь в удобном темпе',
    'Отслеживайте свой прогресс',
    'Создавайте неограниченное количество колод',
    'Бесплатно и без рекламы'
  ];

  const steps = [
    {
      number: '01',
      title: 'Создайте колоду',
      description: 'Добавьте карточки с вопросами и ответами по любой теме'
    },
    {
      number: '02',
      title: 'Начните обучение',
      description: 'Система покажет карточки в оптимальном порядке'
    },
    {
      number: '03',
      title: 'Оценивайте знания',
      description: 'Отмечайте, насколько хорошо вы помните каждую карточку'
    },
    {
      number: '04',
      title: 'Повторяйте',
      description: 'Алгоритм автоматически планирует следующие повторения'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">Memora</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/faq" className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                <HelpCircle size={18} />
                <span>FAQ</span>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="px-6">Вход</Button>
              </Link>
              <Link to="/register">
                <Button className="px-6">Регистрация</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto pt-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles size={16} />
              <span>Умная система запоминания</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Запоминайте быстрее с{' '}
              <span className="text-blue-600">Memora</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Платформа для эффективного обучения на основе научно доказанного метода 
              интервального повторения. Учитесь умнее, а не дольше.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/register">
                <Button className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto">
                  Начать бесплатно
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="secondary" className="px-8 py-4 text-lg font-semibold w-full">
                  Как это работает
                </Button>
              </a>
            </div>

            <div className="mb-16">
              <Link to="/faq" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <HelpCircle size={20} />
                <span>Есть вопросы? Читайте FAQ</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto pt-8 border-t border-gray-300">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">10x</div>
                <div className="text-sm md:text-base text-gray-600">Эффективнее</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">∞</div>
                <div className="text-sm md:text-base text-gray-600">Колоды и карточки</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">0₽</div>
                <div className="text-sm md:text-base text-gray-600">Полностью бесплатно</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Всё для эффективного обучения
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Современные инструменты для максимальных результатов
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Как это работает
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Четыре простых шага к эффективному обучению
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-6xl md:text-7xl font-bold text-blue-100 mb-5 leading-none">
                    {step.number}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-blue-400" size={28} strokeWidth={2.5} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/faq" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors">
              <span>Узнайте больше в разделе FAQ</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Почему выбирают Memora
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Научно доказанный метод интервального повторения помогает запоминать 
                информацию в 10 раз эффективнее традиционного обучения.
              </p>
              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={24} />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-blue-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <TrendingUp size={36} />
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold mb-1">+200%</div>
                      <div className="text-blue-100 text-lg">Рост эффективности</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <BookOpen size={36} />
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold mb-1">20 мин</div>
                      <div className="text-blue-100 text-lg">В день достаточно</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Target size={36} />
                    </div>
                    <div>
                      <div className="text-4xl md:text-5xl font-bold mb-1">90%</div>
                      <div className="text-blue-100 text-lg">Долгосрочное запоминание</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Начните учиться эффективнее уже сегодня
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже улучшили свои результаты
          </p>
          <Link to="/register">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all">
              Создать аккаунт бесплатно
              <ArrowRight size={22} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white">Memora</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/faq" className="text-sm hover:text-white transition-colors">
                FAQ
              </Link>
              <span className="text-sm">© 2026 Memora. Все права защищены.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
