import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Brain, Menu } from 'lucide-react';
import { authService } from '@/services/auth'; 
import { useState } from 'react';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const [error, setError] = useState('')

  const handleLogout = async () => {
    try {
      await authService.logout(); 
      navigate('/login', { replace: true });
    } catch (err) {
      setError('ошибка выхода')
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Открыть боковое меню"
              aria-expanded="false"
            >
              <Menu size={24} />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Brain className="text-white" size={22} />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
                Memora
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              title="Выйти из аккаунта"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}