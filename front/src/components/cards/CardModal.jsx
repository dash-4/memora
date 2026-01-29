import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CardModal = ({ deckId, card, onClose, onSuccess }) => {
  const isEditing = !!card;
  
  const [formData, setFormData] = useState({
    front: '',
    back: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setFormData({
        front: card.front,
        back: card.back,
      });
    }
  }, [card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/cards/${card.id}/`, formData);
        toast.success('Карточка обновлена!');
      } else {
        await api.post('/cards/', {
          ...formData,
          deck: deckId,
        });
        toast.success('Карточка создана!');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error(isEditing ? 'Ошибка обновления карточки' : 'Ошибка создания карточки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Редактировать карточку' : 'Создать карточку'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Вопрос (Лицевая сторона)
            </label>
            <textarea
              value={formData.front}
              onChange={(e) => setFormData({ ...formData, front: e.target.value })}
              className="input"
              rows="3"
              placeholder="Введите вопрос"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ответ (Обратная сторона)
            </label>
            <textarea
              value={formData.back}
              onChange={(e) => setFormData({ ...formData, back: e.target.value })}
              className="input"
              rows="3"
              placeholder="Введите ответ"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (isEditing ? 'Сохранение...' : 'Создание...') : (isEditing ? 'Сохранить' : 'Создать')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
