export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-navy">{label}</label>}
      <input
        className={`border-2 rounded-xl px-4 py-2.5 text-navy placeholder-gray-400 outline-none transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-yellow'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}
