## Memora — учебное приложение для карточек с SM‑2

Полная сводка по текущему состоянию проекта: архитектура, технологии, реализованный функционал и направления для улучшения.

---

## 1. Общая концепция

**Memora** — full‑stack веб‑приложение для интервального обучения по карточкам, близкое к Anki / Quizlet, но:

- с акцентом на **SM‑2** (SuperMemo‑2) и планирование повторений,
- несколькими режимами тренировки (обучение, тренировка, matching, тест),
- продуманным интерфейсом (карточки, календарь, статистика),
- элементами геймификации (**StudyPet**, streak, уровни).

Пользователь может:

- создавать **папки → колоды → карточки**,
- учиться в разных режимах (SM‑2 с оценками, свободная тренировка, matching, тест),
- видеть **расписание повторений**, календарь, дашборд и детальную статистику.

---

## 2. Технологический стек

### Backend

- **Django 5.2.10**
- **Django REST Framework (DRF)** 3.16
- **PostgreSQL** (через `dj-database-url`, по умолчанию — sqlite)
- **JWT‑аутентификация**: `djangorestframework_simplejwt`
- **django-taggit** — теги для карточек
- **django-filter** — фильтрация на API
- **CORS / Whitenoise** — для фронта и статики

Приложения:

- `accounts` — пользователь, профиль, регистрация/аутентификация
- `cards` — папки, колоды, карточки, SM‑2, сессии, статистика, календарь
- `pet` — StudyPet (уровни/XP/streak)

### Frontend

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **react-router-dom v7**
- **lucide-react** — иконки
- **react-hot-toast** — уведомления
- **date-fns** — работа с датами
- **recharts** — графики (статистика)
- Классический layout: `Header` + `Sidebar` + `Layout` (max‑width контейнер)

Структура фронта:

- `src/App.jsx` — маршрутизация (public / protected routes, ErrorBoundary)
- `src/pages` — страницы (Dashboard, Decks, Study, FAQ, Schedule, Statistics, Auth, Landing)
- `src/components` — переиспользуемые блоки:
  - `layout` (Header, Sidebar, Layout)
  - `decks` (DeckCard, DeckHeader, DeckStats, StudyModeCard)
  - `cards` (Card, CardModal, CardItem, CardFilters)
  - `folders` (FolderSidebar, FolderTree, FolderCard, breadcrumbs, модалки)
  - `study` (FlashCard, LearningSession, PracticeSession, MatchingSession, TestSession, RatingButtons, ProgressBar)
  - `schedule` (Calendar, DayCard)
  - `pet` (StudyPet)
  - `ui` (Button, Input, TagInput, Alert, Skeleton, ErrorBoundary)

---

## 3. Backend: доменная модель и API

### 3.1. Пользователь и профиль (`accounts`)

**Модель `User`** (`accounts/models.py`):

- Наследуется от `AbstractUser`.
- Дополнительно:
  - `email` (уникальный),
  - `avatar` (ImageField, опционально).

**Модель `UserProfile`**:

- `user` (OneToOne, `related_name='profile'`)
- Статистика:
  - `total_cards_studied`
  - `current_streak`, `longest_streak`
  - `last_study_date`
  - `total_points` (очки за обучение)
- Свойство `level`: вычисляется как `(total_points // 100) + 1`
- Автоматическое создание/сохранение профиля через `post_save` сигналы.

**Сериализаторы:**

- `UserRegistrationSerializer`:
  - регистрация с полями `username`, `email`, `password`, `password_confirm`,
  - валидация уникальности и совпадения паролей.
- `UserSerializer`:
  - `id`, `username`, `email`, `first_name`, `last_name`.

**Views (`accounts/views.py`):**

- `AuthViewSet` (GenericViewSet, `AllowAny`):
  - `POST /api/auth/register/`:
    - создаёт пользователя,
    - возвращает базовую инфу (`id`, `username`, `email`).
- `UserViewSet`:
  - `GET /api/auth/user/me/` — текущий пользователь.

**URL (`accounts/urls.py`):**

- `/api/auth/register/`
- `/api/auth/user/me/`

JWT‑логин/обновление токенов:

- `/api/token/`
- `/api/token/refresh/`

### 3.2. Папки, колоды, карточки, сессии (`cards`)

**Модель `Folder`**:

- `user` — владелец
- `name`, `description`
- `parent` — иерархия папок
- Вспомогательные методы:
  - `get_full_path()` — полный путь «Родитель / Текущая»
  - `get_all_decks()` — все колоды в папке и подпапках
  - `get_breadcrumbs()` — хлебные крошки

**Модель `Deck`**:

- `user`, `folder` (опционально)
- `name`, `description`, `color`, `is_public`
- `created_at`, `updated_at`

**Модель `Card`**:

- `deck` (FK, `related_name='cards'`)
- `front`, `back` — вопрос/ответ
- `tags` (Taggit)
- SM‑2 поля:
  - `ease_factor` (по умолчанию 2.5)
  - `interval` (дни)
  - `repetitions`
  - `next_review` (дата/время следующего повторения)
  - `last_reviewed`
- Прочее:
  - `image` (ImageField, опционально)
  - `card_type` (`basic` / `multiple_choice`, пока используется в тестовом режиме)
  - `is_suspended`
- Индексы:
  - по `next_review`
  - составной `(deck, next_review)` для быстрых запросов due‑карт.

**Модель `StudySession`**:

- `user`, `deck`
- `started_at`, `ended_at`
- `cards_studied`, `cards_correct`, `points_earned`
- `is_practice_mode` (не влияет на SM‑2)
- `is_reversed` (режим реверса «ответ → вопрос»).

**Модель `CardReview`**:

- `session`, `card`, `rating`, `time_taken`, `reviewed_at`
- лог старых/новых EF/interval для аналитики: `ease_factor_before/after`, `interval_before/after`.

#### SM‑2 реализация

- Вынесена в `cards/sm2.py`:
  - `apply_sm2(card, rating)`:
    - для `rating == 1` сбрасывает повторения, ставит интервал 10 минут,
    - для `rating 2–4`:
      - расчёт интервала (1 день → 6 дней → `interval * ease_factor`),
      - изменение `ease_factor` (−0.15 для 2, +0.15 для 4 в пределах [1.3; 2.5]),
      - установка `next_review`, `last_reviewed`.

Используется в `StudyViewSet.submit_review`.

#### API (`cards/views.py`, `cards/urls.py`)

**DeckViewSet** (`/api/decks/`):

- `GET /decks/` — список колод текущего пользователя:
  - фильтры: `sort_by` (name/created_at), `search` по имени/описанию.
- `POST /decks/` — создание колоды (привязка к пользователю).
- `GET /decks/{id}/` — деталка.
- `DELETE /decks/{id}/` — удаление.
- `GET /decks/{id}/cards/` — карточки колоды:
  - фильтры: `status` (`new`, `learning`, `mastered`), `tag`.
  - поддержка пагинации по `page`/`page_size` (иначе максимум 500 карт).

**CardViewSet** (`/api/cards/`):

- `GET /cards/` — список карточек:
  - фильтры: `deck_id`, `tag`, `status`, `search` (front/back/tags), `ordering`.
- `POST /cards/` — создание карточки (через `deck_id`).
- `PATCH /cards/{id}/` — обновление, включая:
  - текстовые поля,
  - загрузку `image` через multipart‑форму,
  - очистку изображения (`clear_image=true`).
- `DELETE /cards/{id}/` — удаление карточки.
- `GET /cards/popular_tags/` — популярные теги пользователя (кэшируются на 5 минут).

**FolderViewSet** (`/api/folders/`):

- `GET /folders/` — список папок пользователя.
- `POST /folders/` — создание папки.
- `DELETE /folders/{id}/` — удаление папки.
- Кастомные действия:
  - `GET /folders/tree/` — дерево папок (рекурсивный сериализатор).
  - `GET /folders/{id}/contents/` — содержимое папки (подпапки + колоды).
  - `POST /folders/{id}/move/` — переместить папку в другую.

**StudyViewSet** (`/api/study/`):

- `GET /study/due_cards/` — карточки на повторение:
  - фильтр по `deck_id`, `limit`,
  - учитывает `next_review <= now`, `is_suspended=False`.
- `GET /study/all_cards/` — все карточки колоды для практики (случайный порядок).
- `POST /study/start_session/`:
  - создаёт `StudySession`, принимает `deck_id`, `mode` (`learning` / `practice` / `matching` / `test`), `reverse`.
- `POST /study/submit_review/`:
  - принимает `card_id`, `session_id`, `rating (1–4)`, `time_taken`,
  - обновляет SM‑2 (кроме practice),
  - создаёт `CardReview`,
  - обновляет `StudySession` и `UserProfile` (очки, streak, уровень).
- `POST /study/end_session/`:
  - закрывает сессию (`ended_at`),
  - начисляет XP StudyPet: `xp = cards_studied * (1 + accuracy)` и возвращает `pet_xp`, `pet_level`.
- `GET /study/schedule/`:
  - возвращает расписание по дням (включая overdue как «сегодня»),
  - агрегирует по колодам, даёт суммарный счётчик на день + разбивку по колодам.
- `GET /study/stats/`:
  - сводная статистика: `cards_due_today`, `total_decks`, `total_cards`, `cards_learned`.

**StatisticsViewSet** (`/api/statistics/`):

- `GET /statistics/dashboard/` — дашбордные метрики:
  - общее количество карт/кратно due,
  - `cards_studied_this_week`, `sessions_this_week`,
  - количество выученных карт,
  - прогресс пользователя (очки, уровень, streak).
  - Ответ кэшируется (TTL ~120с).
- `GET /statistics/learning_stats/` — активность по дням за N дней.
- `GET /statistics/tags_stats/` — статистика по тегам.
- `GET /statistics/decks_progress/` — прогресс по каждой колоде:
  - `new_cards`, `learning_cards`, `mastered_cards`, `cards_due_today`, `mastery_percent` и др.

### 3.3. StudyPet (`pet`)

**Модель `StudyPet`**:

- `user` (OneToOne)
- `pet_type` (`cat` / `dragon` / `robot`)
- `level`, `xp`
- `streak_days`, `last_streak_date`
- Методы:
  - `add_xp(amount)` — накапливает XP, при 100 XP повышает уровень (XP_PER_LEVEL=100).
  - `update_streak(study_date)` — обновляет `streak_days`, учитывая предыдущую дату.

**Сериализатор `StudyPetSerializer`**:

- `pet_type`, `level`, `xp`, `streak_days`, `last_streak_date`, `created_at`, `updated_at`.

**PetViewSet** (`/api/pet/`):

- `GET /api/pet/` — возвращает/создаёт питомца текущего пользователя.
- `POST /api/pet/xp/` — начисление XP, возвращает обновлённого питомца и флаг `level_up`.

---

## 4. Frontend: страницы и ключевые компоненты

### 4.1. Маршрутизация (`App.jsx`)

- Public routes:
  - `/` — Landing
  - `/faq` — FAQ
  - `/login`, `/register` — Auth (только неавторизованные).
- Protected routes:
  - `/dashboard` — Главная (дашборд).
  - `/decks` — список колод.
  - `/decks/:id` — страница колоды.
  - `/study` и `/study/:deckId` — контейнер StudyMode (переключение режимов по query `mode`).
  - `/statistics` — детальная статистика.
  - `/schedule` — расписание и список ближайших дней.
- Весь `<Routes>` обёрнут в `ErrorBoundary` (fallback для ошибок рендеринга).

### 4.2. Layout (`components/layout`)

- `Layout.jsx`:
  - Верхний `Header` (название, кнопка logout, меню).
  - Левый `Sidebar` (навигация: Главная / Колоды / Расписание / Статистика).
  - Правый `main` с контейнером `max-w-7xl` и вертикальными отступами (`py-8..12`).
- `Header.jsx`:
  - Логотип Memora, кнопка меню (мобайл), кнопка выхода.
- `Sidebar.jsx`:
  - Версия для десктопа + выдвижная панель для мобильной навигации.

### 4.3. Dashboard (`pages/Dashboard/Dashboard.jsx`)

Сейчас Dashboard содержит:

1. **StudyPet** — верхний геймификационный блок (питомец, уровень, XP, streak).
2. Заголовок «Главная» и подзаголовок.
3. Сетка из 4 карточек статистики:
   - На сегодня (due cards),
   - Всего колод,
   - Изучено,
   - Всего карточек.
4. Большой блок «Готовы повторить сегодня?»:
   - список колод с карточками на сегодня,
   - CTA‑кнопка «Начать» для каждой колоды.
5. Три карточки быстрой навигации:
   - Мои колоды,
   - Статистика,
   - Расписание.
6. **Календарь обучения** (Month view):
   - Использует `Calendar` компонент с данными из `/study/schedule/`.
   - Клик ведёт к `/schedule`.
7. Блок «Ближайшие дни»:
   - 3 ближайших дня с количеством карточек и метками «Сегодня/Завтра».

Все отступы на Dashboard выровнены по системе: ~64px сверху/снизу, ~48px между секциями, ~24px внутри карточек.

### 4.4. Список колод и папки (`pages/Decks`)

**DecksList.jsx**:

- Левый сайдбар (`FolderSidebar`) с деревом папок:
  - выбор папки,
  - создание новой,
  - **удаление папок** (через иконку корзины, `DELETE /folders/{id}/`).
- Основная часть:
  - breadcrumbs (`FolderBreadcrumbs`),
  - заголовок: имя текущей папки или «Все колоды»,
  - описание папки (если есть),
  - счётчик колод (с фильтрами).
  - `SearchBar` (поиск + сортировка).
  - Сетка `DeckCard` для отображения колод.
  - Модалки создания папки и колоды.

Debounce‑поиск реализован через `searchQuery` + `debouncedSearch` (setTimeout 300ms).

**DeckCard.jsx**:

- Карточка колоды:
  - Иконка книги в цвете колоды.
  - Название колоды (сейчас ~`text-lg/xl`).
  - Описание (2 строки, line‑clamp).
  - Внизу:
    - количество карточек,
    - количество карточек на сегодня.
- Обёрнута в `Card` (с padding 24px), hover‑тень, `cursor-pointer`.

### 4.5. Страница колоды (`DeckDetail.jsx`)

- Заголовок (`DeckHeader`): имя колоды, описание, кнопка удаления.
- Блок статистики (`DeckStats`): всего, на повторение, новые.
- Подсказки‑алерты (готовность к обучению / всё выучено / нет карточек).
- Переключатель реверса «ответ → вопрос».
- Блок режимов:
  - Режим обучения (SM‑2) с кнопкой «Начать обучение».
  - Режим тренировки (practice) с кнопкой «Начать тренировку».
  - Matching и Test (новые режимы) с описанием и кнопками.
- Список карточек (`CardsList`):
  - Фильтры: статус (new/learning/mastered), теги, поиск.
  - Список `CardItem` (вопрос/ответ, теги, кнопки редактирования/удаления).
- `CardModal`:
  - Создание/редактирование карточки,
  - Текстовые поля + теги + загрузка изображения (с предпросмотром).

### 4.6. Study: режимы обучения (`pages/Study`, `components/study`)

- `StudyMode.jsx`:
  - читает `deck` и `mode` из query,
  - рендерит:
    - `LearningSession` (`mode=learning`),
    - `PracticeSession` (`mode=practice`),
    - `MatchingSession` (`mode=matching`),
    - `TestSession` (`mode=test`).

**LearningSession.jsx**:

- Загружает due‑карты или новые из `/study/due_cards/` и `/decks/{id}/cards/`.
- Создаёт `StudySession` (`/study/start_session/`).
- Пошагово показывает карточки через `FlashCard`.
- При оценке (rating 1–4) делает `submit_review` и в конце `end_session` + возврат к колоде.
- Поддерживает **горячие клавиши 1–4** для выставления оценки.

**PracticeSession.jsx**:

- Загружает случайные карточки `/study/all_cards/`.
- Показывает бесконечный просмотр без оценки и без влияния на SM‑2.

**MatchingSession.jsx**:

- Берёт набор карточек для matching (`/study/matching_cards/`).
- Две колонки вопросов/ответов, выбор пары, подсветка успех/ошибка, shake‑анимация.

**TestSession.jsx**:

- Берёт карточки с вариантами ответа (`/study/test_cards/`).
- Для каждой:
  - вопрос,
  - набор опций (одна верная, несколько неверных),
  - подсветка правильного/неправильного, счётчик, итоговый экран.

**FlashCard.jsx**:

- Карточка flip (вопрос ↔ ответ) с поддержкой реверса и изображений.

**RatingButtons.jsx**:

- Четыре кнопки с эмодзи (Снова/Тяжело/Хорошо/Легко), цветовая обратная связь.

### 4.7. Расписание и календарь (`Schedule.jsx`, `Calendar.jsx`, `DayCard.jsx`)

- `Schedule.jsx`:
  - Использует `/study/schedule/?days=7` + `/statistics/decks_progress/`.
  - Показывает:
    - верхнюю сводку по ближайшим дням,
    - список дней с количеством карточек.
- `Calendar.jsx`:
  - Месячный календарь для Dashboard:
    - рендерит сетку дней,
    - подсвечивает дни с карточками (через `count`),
    - связывает каждый день с датой и `by_deck`.
- `DayCard.jsx`:
  - одна клетка календаря:
    - число дня,
    - количество карточек,
    - подсветка сегодня.

### 4.8. FAQ (`FAQ.jsx`)

- Большая, хорошо проработанная FAQ‑страница:
  - секции: Основы, SM‑2, Работа с колодами и карточками, Прогресс и статистика, Советы по обучению, Расписание повторений.
  - поиск по вопросам/ответам,
  - раскрывающиеся вопросы (`accordion`).

---

## 5. Точки роста и улучшения

На основе текущего состояния кода и ваших идей:

1. **Единая дизайн‑система**:
   - Довести до конца шкалу 8/16/24/32/48/64 по всем страницам.
   - Стандартизовать заголовки (32/24/16) и CTA‑кнопки (48px высота).
   - Упростить режимы на странице колоды до чистых кнопок без перегруженных блоков.

2. **Живой StudyPet + Zustand**:
   - Перенести состояние питомца в Zustand‑store:
     - pet, loading, error, actions fetch/updateFromSession.
   - Добавить UI‑состояния (эмоции, idle/level‑up анимации).
   - Связать StudyPet и post‑session экран (радость/грусть в зависимости от streak/XР).

3. **CardDetail / Session UI**:
   - Сделать минималистичный, full‑screen экран в духе Apple/Notion:
     - большой вопрос по центру (32px),
     - ответ по клику,
     - плавающие кнопки Again/Hard/Good/Easy (80×80 иконки),
     - прогресс и статус карточки (New/Learning/Mastered) снизу.

4. **Интеллектуальная выдача карточек**:
   - Добавить «weighted random shuffle» на фронте поверх SM‑2:
     - не показывать одну и ту же карточку подряд,
     - чаще показывать сложные карты, но с cooldown,
     - реже показывать mastered (но не забывать их).

5. **Экран итоговой статистики после сессии**:
   - Реализовать полноценный финальный экран:
     - mastery% колоды,
     - повторено/освоено/сложные,
     - круговой прогресс и bar‑графики,
     - список сложных карт/тем (чипы),
     - CTA: «Repeat hard cards», «Continue learning», «Back to deck».

6. **Архитектура фронта**:
   - Лёгкая реорганизация компонентов для лучшей переиспользуемости:
     - вынести общие layout‑блоки (Section, PageHeader, StatCard).
   - Добавить Zustand‑store для learning state (текущая сессия, queue карточек).

7. **Кодовая гигиена**:
   - Уже убраны `console.log` и лишние комментарии, но:
     - можно ещё упростить некоторые хуки (объединить `useEffect` там, где возможно),
     - выровнять стили (избежать inline‑`style` в пользу классов/переменных).

Этот README должен помочь быстро понять, какие части уже реализованы (SM‑2, расписание, календарь, несколько режимов обучения, статистика, StudyPet), как они связаны между собой и где сейчас основные точки для улучшения UX/дизайна и архитектуры. 

Для следующих шагов имеет смысл отдельно спланировать:

- «Новый DeckDetail» (чистые режим‑кнопки, минимализм).
- «Full‑screen CardDetail + SessionSummary + StudyPet‑реакции».
- «Zustand‑store и согласованная логика выдачи карточек».

