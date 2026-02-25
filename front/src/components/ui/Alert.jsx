/**
 * Семантические подсказки: инфо, успех, предупреждение, ошибка.
 * Соответствует критериям дизайна: контрастность и состояния.
 */
const variants = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

export default function Alert({ variant = 'info', title, children, className = '' }) {
  return (
    <div role="alert" className={`${variants[variant]} p-4 sm:p-5 rounded-xl ${className}`}>
      {title && <h4 className="text-sm font-semibold mb-1">{title}</h4>}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}
