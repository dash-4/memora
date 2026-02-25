import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Calendar, X, Brain } from 'lucide-react';

const navigation = [
  { name: 'Главная', href: '/dashboard', icon: Home },
  { name: 'Колоды', href: '/decks', icon: BookOpen },
  { name: 'Расписание', href: '/schedule', icon: Calendar },
  { name: 'Статистика', href: '/statistics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;


  return (
    <>
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 overflow-y-auto shadow-soft">
        <div className="p-4 sm:p-5 space-y-1">
          <nav className="space-y-1" aria-label="Основная навигация">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-inner-soft'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}
                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none
                  `}
                >
                  <Icon size={20} className={active ? 'text-blue-600' : 'text-gray-500'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">Memora</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Закрыть меню"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Основная навигация">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all
                  ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none
                `}
              >
                <Icon size={22} className={active ? 'text-blue-600' : 'text-gray-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}