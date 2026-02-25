import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, User, Lock, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Введите имя пользователя';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Подтвердите пароль';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.password_confirm
      );

      toast.success('Регистрация успешна! Войдите в аккаунт', {
        id: 'register-success',
        duration: 4000,
      });

      // Редирект на логин
      navigate('/login');
    } catch (error) {

      const errorData = error.response?.data;

      if (errorData && typeof errorData === 'object') {
        setErrors(errorData);

        // Показываем только первую ошибку
        const firstErrorKey = Object.keys(errorData)[0];
        const firstError = errorData[firstErrorKey];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;

        toast.error(errorMessage || 'Ошибка регистрации', { id: 'register-error' });
      } else if (error.response?.status === 500) {
        toast.error('Ошибка сервера. Проверьте логи Django', { id: 'register-error' });
      } else {
        toast.error('Ошибка соединения с сервером', { id: 'register-error' });
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
          <p className="text-gray-600 mt-2">Создайте свой аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Введите имя пользователя"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 8 символов"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password_confirm ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.password_confirm && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Регистрация...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Зарегистрироваться
                  <ArrowRight size={20} className="ml-2" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Войти
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
