const Card = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`card ${hover ? 'hover:border-gray-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
