import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { TagInput } from '../ui/TagInput';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CardModal = ({ deckId, card, onClose, onSuccess }) => {
  const isEditing = !!card;
  
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    tags: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        front: card.front,
        back: card.back,
        tags: card.tags || [],
      });
    }
  }, [card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.front.trim() || !formData.back.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        front: formData.front.trim(),
        back: formData.back.trim(),
        tags: formData.tags,
      };

      if (isEditing) {
        await api.patch(`/cards/${card.id}/`, payload);
        toast.success('Карточка обновлена! ✅');
      } else {
        await api.post('/cards/', {
          ...payload,
          deck: deckId,
        });
        toast.success('Карточка создана! 🎉');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving card:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          (isEditing ? 'Ошибка обновления карточки' : 'Ошибка создания карточки');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? ' Редактировать карточку' : '➕ Создать карточку'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Вопрос */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Вопрос (Лицевая сторона) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.front}
              onChange={(e) => setFormData({ ...formData, front: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="Введите вопрос или термин..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Что нужно вспомнить? (например: "Что такое React?")
            </p>
          </div>

          {/* Ответ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ответ (Обратная сторона) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.back}
              onChange={(e) => setFormData({ ...formData, back: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="Введите ответ..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Правильный ответ или определение
            </p>
          </div>

          {/* Теги */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Теги <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <TagInput
              value={formData.tags}
              onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
              placeholder="Добавить теги..."
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Нажмите <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> или 
              запятую для добавления тега. Теги помогут организовать карточки.
            </p>
          </div>

          {/* Превью тегов */}
          {formData.tags.length > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-700 mb-2">
                📌 Выбранные теги ({formData.tags.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-white text-purple-700 border border-purple-300 rounded text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки */}
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
              disabled={loading || !formData.front.trim() || !formData.back.trim()}
              className="flex-1 order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Сохранение...' : 'Создание...'}
                </span>
              ) : (
                isEditing ? ' Сохранить' : '➕ Создать карточку'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
