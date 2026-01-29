import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const Register = () => {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.password_confirm) {
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
        formData.password
      );
      toast.success('Регистрация успешна!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Memora</h1>
          <p className="text-gray-600 mt-2">Создайте свой аккаунт</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Имя пользователя"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Введите имя пользователя"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="example@mail.com"
              required
            />

            <Input
              label="Пароль"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Минимум 6 символов"
              required
            />

            <Input
              label="Подтвердите пароль"
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              error={errors.password_confirm}
              placeholder="Повторите пароль"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
