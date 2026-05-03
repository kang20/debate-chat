import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function relativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko });
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy.MM.dd HH:mm', { locale: ko });
}

export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm', { locale: ko });
}
