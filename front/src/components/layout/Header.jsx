import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Brain, Menu } from 'lucide-react';
import { authService } from '../../services/auth';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Открыть меню"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Memora</span>
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 sm:px-5 py-2 sm:py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Выход</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
