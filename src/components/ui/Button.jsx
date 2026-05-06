export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-yellow text-navy hover:bg-yellow-dark',
    secondary: 'bg-navy text-white hover:bg-navy-light',
    outline: 'border-2 border-navy text-navy hover:bg-navy hover:text-white',
    ghost: 'text-navy hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    full: 'px-5 py-3 text-base w-full',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
