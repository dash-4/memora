const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`input ${error ? 'border-red-500' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? 'input-error' : undefined}
        {...props}
      />
      {error && (
        <p id="input-error" className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
