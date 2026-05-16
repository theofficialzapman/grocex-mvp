import { ItemStatus } from '../types';

const statusConfig: Record<ItemStatus, { bg: string; text: string; label: string }> = {
  red: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'At Risk' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warning' },
  green: { bg: 'bg-green-100', text: 'text-green-700', label: 'Good' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Monitor' },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
