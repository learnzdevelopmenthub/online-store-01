import type { OrderStatus } from '../store/api/adminApi.ts';

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'pill' },
  paid: { label: 'Paid', className: 'pill pill-ok' },
  failed: { label: 'Failed', className: 'pill pill-danger' },
  refunded: { label: 'Refunded', className: 'pill' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status];
  return <span className={style.className}>{style.label}</span>;
}
