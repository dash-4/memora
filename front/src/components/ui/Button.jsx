const Button = ({
  variant = 'primary',
  size = 'default',
  children,
  className = '',
  ...props
}) => {
  let classes = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  if (size === 'sm') {
    classes += ' px-3 py-2 text-sm gap-1.5';
  } else if (size === 'lg') {
    classes += ' px-6 py-3.5 text-base gap-2';
  } else {
    classes += ' px-4 py-2.5 text-sm gap-2';
  }

  if (variant === 'primary') {
    classes += ' bg-blue-600 text-white hover:bg-blue-700 shadow-soft hover:shadow-soft-lg';
  } else if (variant === 'secondary') {
    classes += ' bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200';
  } else if (variant === 'danger') {
    classes += ' bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500';
  }

  if (className) classes += ' ' + className;

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
