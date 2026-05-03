import { Link } from 'react-router';
import { Users, Clock } from 'lucide-react';
import type { DebateRoom } from '@/types/room';
import { Badge } from '@/components/ui/Badge';
import { relativeTime } from '@/utils/date';

interface RoomCardProps {
  room: DebateRoom;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link
      to={`/rooms/${room.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{room.title}</h3>
        {room.status === 'CLOSED' && (
          <Badge className="shrink-0 bg-gray-800 text-white">종료</Badge>
        )}
      </div>

      <p className="mb-3 text-sm text-gray-500 line-clamp-2">{room.description}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {room.tags.map((tag) => (
          <Badge key={tag.id}>{tag.name}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {room.participantCount}명
          </span>
          <span className="text-blue-600">찬성 {room.proCount}</span>
          <span className="text-red-600">반대 {room.conCount}</span>
          <span className="text-gray-500">중립 {room.neutralCount}</span>
        </div>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {relativeTime(room.createdAt)}
        </span>
      </div>
    </Link>
  );
}
