import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  Brain, 
  Calendar, 
  Target, 
  BookOpen, 
  Zap, 
  Sparkles, 
  ArrowLeft,
  Search
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sections = [
    {
      title: 'Основы работы',
      icon: BookOpen,
      color: 'blue',
      questions: [
        {
          question: 'Что такое Memora?',
          answer: 'Memora — это платформа для запоминания информации с помощью интервальных повторений. Вы создаёте колоды и карточки (вопрос/ответ), система планирует повторения в нужный момент по алгоритму SM-2 и помогает закрепить знания надолго.'
        },
        {
          question: 'Как начать пользоваться?',
          answer: 'Зарегистрируйтесь, зайдите в раздел "Колоды" и создайте первую колоду. Затем в деталях колоды добавьте несколько карточек с вопросами и ответами. После этого нажмите "Начать обучение" или один из режимов на странице колоды — вы сразу сможете проходить карточки.'
        },
        {
          question: 'Какие режимы обучения есть в Memora?',
          answer: 'В колоде доступны режимы: "Режим обучения" (интервальные повторения с оценками и статистикой), "Режим тренировки" (свободный просмотр без влияния на расписание), "Подбор пар" (игровой режим на сопоставление вопрос-ответ) и "Тест" (варианты ответов с выбором правильного). Все они используют одни и те же карточки, но по-разному помогают закрепить материал.'
        },
        {
          question: 'Бесплатна ли платформа?',
          answer: 'Да, Memora полностью бесплатна. Вы можете создавать неограниченное количество колод и карточек и использовать все основные функции без ограничений.'
        }
      ]
    },
    {
      title: 'Алгоритм SM-2',
      icon: Brain,
      color: 'purple',
      questions: [
        {
          question: 'Что такое алгоритм SM-2?',
          answer: 'SM-2 (SuperMemo 2) — классический алгоритм интервального повторения. Он рассчитывает, через сколько дней показать карточку снова, исходя из того, насколько легко вы вспомнили ответ. Чем лучше вы помните, тем реже показывается карточка, и наоборот.'
        },
        {
          question: 'Как работают интервалы повторения?',
          answer: 'После первого успешного повторения карточка появляется через 1 день, после второго — примерно через 6 дней. Далее интервал умножается на коэффициент лёгкости (обычно около 2.5), поэтому промежутки растут: недели, месяцы и т.д. Если карточка забыта, интервал сокращается или сбрасывается, и карточка снова повторяется чаще.'
        },
        {
          question: 'Что означают оценки карточек?',
          answer: 'В режиме обучения вы оцениваете, насколько хорошо вспомнили ответ: от "Забыл" до "Легко". Низкие оценки уменьшают интервал и заставляют карточку показываться чаще, высокие — увеличивают интервал. Чем честнее вы оцениваете, тем точнее алгоритм подстраивается под вас.'
        },
        {
          question: 'Почему используется именно SM-2?',
          answer: 'SM-2 даёт хороший баланс между простотой и эффективностью. Он прозрачен, предсказуем и не требует сложной настройки. Более новые алгоритмы дают небольшой прирост, но сильно усложняют систему. Для большинства задач SM-2 более чем достаточно.'
        }
      ]
    },
    {
      title: 'Работа с колодами и карточками',
      icon: BookOpen,
      color: 'green',
      questions: [
        {
          question: 'Как создать колоду?',
          answer: 'Откройте раздел "Колоды" и нажмите кнопку создания. Укажите название (обязательно) и, при желании, описание и цвет. После сохранения вы перейдёте на страницу колоды, где можно добавлять карточки.'
        },
        {
          question: 'Как добавить карточку?',
          answer: 'На странице колоды нажмите "Добавить карточку". Заполните поле вопроса (лицевая сторона) и ответа (обратная сторона) и сохраните. Сейчас карточки состоят только из текста вопроса и ответа — без тегов и изображений, чтобы не усложнять создание.'
        },
        {
          question: 'Можно ли редактировать или удалять карточки?',
          answer: 'Да. В списке карточек у каждой карточки есть действия: редактирование и удаление. Вы можете в любой момент поправить текст вопроса или ответа. При удалении карточка и связанная с ней статистика будут полностью удалены.'
        },
        {
          question: 'Как лучше организовать колоды?',
          answer: 'Рекомендуется создавать отдельные колоды под темы или курсы: например, "Английский: слова", "История: даты", "Программирование: термины". Так проще контролировать нагрузку и видеть прогресс по каждому направлению.'
        }
      ]
    },
    {
      title: 'Режимы обучения и расписание',
      icon: Calendar,
      color: 'indigo',
      questions: [
        {
          question: 'Чем отличаются режимы на странице колоды?',
          answer: 'На странице колоды есть четыре режима: "Режим обучения" (основной, с оценками и расписанием), "Режим тренировки" (свободный просмотр карточек), "Подбор пар" (игровой формат: нужно сопоставить вопрос и ответ) и "Тест" (выбор правильного ответа из нескольких вариантов). Можно чередовать режимы в зависимости от цели — выучить, освежить или проверить себя.'
        },
        {
          question: 'Что показывает календарь на главной и в разделе "Расписание"?',
          answer: 'Календарь показывает, сколько карточек запланировано к повторению на каждый день. Вы видите дни с нагрузкой и можете заранее оценить объём работы. Щёлкнув по дню, можно перейти к детальному расписанию в отдельном разделе "Расписание".'
        },
        {
          question: 'Можно ли управлять расписанием вручную?',
          answer: 'Нет, даты повторений рассчитываются автоматически по алгоритму SM-2 на основе ваших оценок. Вы управляете расписанием косвенно: честными оценками и частотой занятий. Это позволяет сохранить научную основу метода и избежать лишнего микроменеджмента.'
        }
      ]
    },
    {
      title: 'Прогресс, статистика и питомец',
      icon: Target,
      color: 'orange',
      questions: [
        {
          question: 'Что я вижу на главной странице (дашборде)?',
          answer: 'На главной странице отображаются ключевые показатели: сколько карточек нужно повторить сегодня, сколько всего колод и карточек, сколько уже выучено. Ниже — списки колод с карточками "на сегодня", быстрые ссылки на разделы и блок с календарём обучения.'
        },
        {
          question: 'Что даёт раздел "Статистика"?',
          answer: 'В разделе "Статистика" собраны графики и числа: активность по дням, прогресс по колодам, количество выученных карточек и другие показатели. Это помогает увидеть, как вы продвигаетесь, какие колоды требуют внимания и как меняется ваша нагрузка со временем.'
        },
        {
          question: 'Зачем нужен учебный питомец?',
          answer: 'Учебный питомец — элемент геймификации. Он получает опыт за ваши занятия, растёт в уровне и помогает визуально отслеживать регулярность. Чем стабильнее вы учитесь, тем быстрее прокачивается питомец. Это дополнительная мотивация возвращаться и заниматься каждый день.'
        }
      ]
    },
    {
      title: 'Советы по эффективному обучению',
      icon: Zap,
      color: 'yellow',
      questions: [
        {
          question: 'Как часто лучше заниматься?',
          answer: 'Оптимально — каждый день по 15–30 минут. Регулярность важнее длительных редких сессий: мозгу нужно время, чтобы между короткими занятиями закреплять материал.'
        },
        {
          question: 'Сколько новых карточек добавлять в день?',
          answer: 'Для старта достаточно 5–10 новых карточек в день. Когда привыкнете к ритму и нагрузке, можно постепенно увеличивать количество. Важно помнить, что каждая новая карточка — это обязательство по будущим повторениям.'
        },
        {
          question: 'Как формулировать хорошие карточки?',
          answer: 'Лучше всего работают короткие и конкретные вопросы: одна карточка — одна идея. Избегайте слишком общих формулировок и длинных списков в одном ответе. Если материал объёмный, разбейте его на несколько простых карточек.'
        },
        {
          question: 'Что делать, если накопилось много просроченных карточек?',
          answer: 'Сфокусируйтесь на регулярных коротких сессиях и временно не добавляйте новые карточки. Постепенно количество просроченных заданий уменьшится. Не пытайтесь "сжечь" всё за один длинный заход — это утомляет и снижает качество запоминания.'
        },
        {
          question: 'Что если я пропустил несколько дней?',
          answer: 'Ничего страшного, просто вернитесь к занятиям. Карточек станет больше, но алгоритм подстроится: часть карточек вы повторите чаще, пока снова не выйдете на комфортный уровень. Главное — не бросать надолго.'
        }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500', hover: 'hover:border-blue-400' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500', hover: 'hover:border-purple-400' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500', hover: 'hover:border-green-400' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500', hover: 'hover:border-orange-400' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-500', hover: 'hover:border-yellow-400' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-500', hover: 'hover:border-indigo-400' }
    };
    return colors[color] || colors.blue;
  };

  const filteredSections = searchQuery.trim()
    ? sections.map(section => ({
        ...section,
        questions: section.questions.filter(q =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.questions.length > 0)
    : sections;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
        <Link to="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>На главную</span>
        </Link>

        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={28} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Часто задаваемые вопросы
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Всё, что нужно знать об использовании Memora и научном методе интервального повторения
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-shadow"
              />
            </div>
          </div>
        </div>

        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Ничего не найдено. Попробуйте другой запрос.</p>
          </div>
        ) : (
          filteredSections.map((section, sectionIndex) => {
            const colors = getColorClasses(section.color);
            
            return (
              <div key={sectionIndex} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 ${colors.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                    <section.icon className={colors.text} size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.title}</h2>
                    <p className="text-xs sm:text-sm text-gray-500">{section.questions.length} {section.questions.length === 1 ? 'вопрос' : section.questions.length < 5 ? 'вопроса' : 'вопросов'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.questions.map((item, questionIndex) => {
                    const globalIndex = `${sectionIndex}-${questionIndex}`;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={questionIndex}
                        className={`bg-white rounded-xl p-4 sm:p-5 md:p-6 border-2 cursor-pointer transition-all ${
                          isOpen 
                            ? `${colors.border} shadow-lg` 
                            : `border-gray-200 ${colors.hover} hover:shadow-md`
                        }`}
                        onClick={() => toggleQuestion(globalIndex)}
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1">
                            {item.question}
                          </h3>
                          <ChevronDown
                            className={`shrink-0 transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : ''
                            } ${colors.text}`}
                            size={24}
                          />
                        </div>

                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 border-2 border-blue-200 shadow-md">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="text-white" size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Готовы начать?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
              Откройте для себя эффективное обучение с Memora
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-6 py-3">
                  На главную
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-6 py-3 shadow-lg">
                  Начать обучение
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
