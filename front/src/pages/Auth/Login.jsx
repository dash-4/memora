import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await authService.login(formData.username, formData.password);
      toast.success('Вход выполнен успешно!', { id: 'login-success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      const errorData = error.response?.data;
      
      if (errorData && typeof errorData === 'object') {
        setErrors(errorData);
        
        const firstErrorKey = Object.keys(errorData)[0];
        const firstError = errorData[firstErrorKey];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        
        toast.error(errorMessage || 'Неверные данные для входа', { id: 'login-error' });
      } else {
        toast.error('Ошибка входа. Проверьте данные.', { id: 'login-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg hover:shadow-xl transition-shadow">
              <Brain className="text-white" size={32} />
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Memora</h1>
          <p className="text-gray-600 mt-2">Войдите в свой аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Имя пользователя или Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Введите логин"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.username || errors.detail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password || errors.detail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {errors.detail && (
                <p className="mt-1 text-sm text-red-600">{errors.detail}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Вход...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Войти
                  <ArrowRight size={20} className="ml-2" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Нет аккаунта?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
