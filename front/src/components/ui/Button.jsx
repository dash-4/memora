const Button = ({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) => {
  let classes = 'btn';
  
  if (variant === 'primary') {
    classes += ' btn-primary';
  } else if (variant === 'secondary') {
    classes += ' btn-secondary';
  } else if (variant === 'danger') {
    classes += ' btn-danger';
  }
  
  if (className) {
    classes += ' ' + className;
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
