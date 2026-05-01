import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name.slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700',
        sizeStyles[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
