import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function CreateDeckModal({ folderId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    folder: folderId || null, 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Введите название колоды');
      return;
    }

    setLoading(true);

    try {
      await api.post('/decks/', formData);
      toast.success('Колода создана! 🎉');
      onSuccess();
    } catch (error) {
      const msg = error.response?.data?.detail ||
                  error.response?.data?.message ||
                  'Не удалось создать колоду';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Создать колоду</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Например: Английский A1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Краткое описание колоды (опционально)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Цвет темы
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-600 font-mono">
                {formData.color.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 order-2 sm:order-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Создание...
                </span>
              ) : (
                'Создать колоду'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}