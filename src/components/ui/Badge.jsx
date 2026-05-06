const colors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
}

const labels = {
  pending: 'Na čekanju',
  accepted: 'Prihvaćeno',
  preparing: 'U pripremi',
  ready: 'Spremno',
  delivering: 'U dostavi',
  delivered: 'Dostavljeno',
  declined: 'Odbijeno',
  cancelled: 'Otkazano',
  open: 'Otvoreno',
  closed: 'Zatvoreno',
}

export function Badge({ status, className = '' }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] ?? 'bg-gray-100 text-gray-700'} ${className}`}>
      {labels[status] ?? status}
    </span>
  )
}
