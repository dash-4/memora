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
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">Memora</span>
            </Link>

            <div className="hidden md:flex items-center space-x-3">
              <Link to="/faq">
                <Button variant="secondary" size="sm" className="flex items-center gap-1">
                  <HelpCircle size={16} />
                  FAQ
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="sm">Вход</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <HelpCircle size={16} />
                    FAQ
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Вход</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Регистрация</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center pt-8 sm:pt-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 sm:mb-8">
              <Sparkles size={16} />
              <span>Умная система запоминания</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
              Запоминайте быстрее с{' '}
              <span className="text-blue-600">Memora</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto px-4">
              Платформа для эффективного обучения на основе научно доказанного метода 
              интервального повторения. Учитесь умнее, а не дольше.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  Начать бесплатно
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                  Как это работает
                </Button>
              </a>
            </div>

            <Link to="/faq" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-8 sm:mb-12">
              <HelpCircle size={20} />
              <span className="text-sm sm:text-base">Есть вопросы? Читайте FAQ</span>
              <ArrowRight size={16} />
            </Link>

            {/* <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto pt-6 sm:pt-8 border-t border-gray-300 px-4">
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 mb-2">10x</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Эффективнее</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 mb-2">∞</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Колоды</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 mb-2">0₽</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Бесплатно</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Всё для эффективного обучения
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Современные инструменты для максимальных результатов
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
              <div
                key={index}
                className="p-5 sm:p-6 md:p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-soft-lg transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Как это работает
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Четыре простых шага к эффективному обучению
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-blue-100 mb-4 sm:mb-5 leading-none">
                    {step.number}
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link to="/faq" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg transition-colors">
              <span>Узнайте больше в разделе FAQ</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Почему выбирают Memora
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Научно доказанный метод интервального повторения помогает запоминать 
                информацию в 10 раз эффективнее традиционного обучения.
              </p>
              <div className="space-y-4 sm:space-y-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                    <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span className="text-sm sm:text-base md:text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <TrendingUp size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1">+200%</div>
                      <div className="text-blue-100 text-sm sm:text-base md:text-lg">Рост эффективности</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <BookOpen size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1">20 мин</div>
                      <div className="text-blue-100 text-sm sm:text-base md:text-lg">В день достаточно</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Target size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1">90%</div>
                      <div className="text-blue-100 text-sm sm:text-base md:text-lg">Долгосрочное запоминание</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Начните учиться эффективнее уже сегодня
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже улучшили свои результаты
          </p>
          <Link to="/register">
            <Button className=" text-blue-600 hover:bg-blue-400 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto">
              Создать аккаунт 
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white">Memora</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center">
              <Link to="/faq" className="text-sm hover:text-white transition-colors">
                FAQ
              </Link>
              <span className="text-xs sm:text-sm">© 2026 Memora. Все права защищены.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
