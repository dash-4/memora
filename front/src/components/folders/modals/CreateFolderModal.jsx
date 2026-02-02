import { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // или другой крестик
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/services/api';

// const iconOptions = ['📁', '📂', '🗂️', '📚', '📖', '📝', '🎯', '⭐', '🔥', '💼', '🎨', '🔬'];

export default function CreateFolderModal({ parentId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📁',
    parent: parentId,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Введите название папки');
      return;
    }

    setLoading(true);
    try {
      await api.post('/folders/', formData);
      toast.success('Папка создана! 📁');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Ошибка создания папки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEsc = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Создать папку</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Название папки"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Краткое описание"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Иконка</label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`
                    text-2xl p-2 rounded-lg border-2 transition-all
                    ${formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div> */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Цвет</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-sm text-gray-600">{formData.color.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}