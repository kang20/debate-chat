import { cn } from '@/utils/cn';
import type { Side } from '@/types/room';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pro' | 'con' | 'neutral';
  className?: string;
}

const sideToVariant: Record<Side, 'pro' | 'con' | 'neutral'> = {
  PRO: 'pro',
  CON: 'con',
  NEUTRAL: 'neutral',
};

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  pro: 'bg-blue-100 text-blue-800',
  con: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-600',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SideBadge({ side }: { side: Side }) {
  const labels: Record<Side, string> = {
    PRO: '찬성',
    CON: '반대',
    NEUTRAL: '중립',
  };
  return <Badge variant={sideToVariant[side]}>{labels[side]}</Badge>;
}
