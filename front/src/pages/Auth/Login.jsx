import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await authService.login(formData.username, formData.password);
      toast.success('Вход выполнен успешно!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error('Ошибка входа. Проверьте данные.');
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
          <p className="text-gray-600 mt-2">Войдите в свой аккаунт</p>
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
              label="Пароль"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Введите пароль"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
