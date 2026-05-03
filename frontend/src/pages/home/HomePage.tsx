import { useEffect, useState } from 'react';
import { Plus, MessageCircle, Users, Send, Clock, ArrowRight, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import { CreateRoomModal } from './components/CreateRoomModal';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { relativeTime } from '@/utils/date';
import type { DebateRoom, RoomStatus } from '@/types/room';

type SortKey = 'hot' | 'new' | 'close';

function StanceBar({ pro, con, neutral, height = 'h-2' }: { pro: number; con: number; neutral: number; height?: string }) {
  const total = pro + con + neutral;
  if (total === 0) return <div className={`${height} w-full rounded-full bg-gray-100`} />;
  const proPct = (pro / total) * 100;
  const conPct = (con / total) * 100;
  const neuPct = (neutral / total) * 100;
  return (
    <div className={`flex ${height} w-full overflow-hidden rounded-full bg-gray-100`}>
      <div className="bg-blue-500 transition-all" style={{ width: `${proPct}%` }} />
      <div className="bg-gray-300 transition-all" style={{ width: `${neuPct}%` }} />
      <div className="bg-red-500 transition-all" style={{ width: `${conPct}%` }} />
    </div>
  );
}

function StatCard({ label, value, unit, icon, accent }: {
  label: string; value: number | string; unit?: string;
  icon: React.ReactNode; accent: 'indigo' | 'blue' | 'gray';
}) {
  const accents = {
    indigo: { bg: 'bg-indigo-50', fg: 'text-indigo-600' },
    blue: { bg: 'bg-blue-50', fg: 'text-blue-600' },
    gray: { bg: 'bg-gray-100', fg: 'text-gray-600' },
  };
  const a = accents[accent];
  return (
    <div className="flex w-32 flex-col rounded-xl border border-gray-200 bg-white p-3">
      <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${a.bg} ${a.fg}`}>{icon}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-tight text-gray-900">{value}</span>
        {unit && <span className="text-[11px] font-medium text-gray-500">{unit}</span>}
      </div>
      <div className="mt-0.5 text-[11px] text-gray-500">{label}</div>
    </div>
  );
}

const statusBadge: Record<RoomStatus, { label: string; cls: string }> = {
  RECRUITING: { label: '모집 중', cls: 'bg-green-50 text-green-700' },
  IN_PROGRESS: { label: '진행 중', cls: 'bg-red-50 text-red-600' },
  CLOSED: { label: '종료', cls: 'bg-gray-800 text-white' },
};

function formatStartTime(iso: string) {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

function FeaturedRoomCard({ room, onOpen }: { room: DebateRoom; onOpen: (id: string) => void }) {
  const total = room.proCount + room.conCount + room.neutralCount;
  const proPct = total ? Math.round((room.proCount / total) * 100) : 50;
  const conPct = total ? Math.round((room.conCount / total) * 100) : 50;
  const lead = room.proCount > room.conCount ? 'PRO' : room.conCount > room.proCount ? 'CON' : 'TIE';
  const badge = statusBadge[room.status];
  return (
    <button onClick={() => onOpen(room.id)}
      className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-all hover:border-indigo-200 hover:shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="p-7">
          <div className="mb-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
              {room.status === 'IN_PROGRESS' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
              {badge.label}
            </span>
            {room.tags.map((t) => (
              <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">#{t.name}</span>
            ))}
          </div>
          <h3 className="text-2xl font-bold leading-tight text-gray-900 group-hover:text-indigo-700">{room.title}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-500 line-clamp-2">{room.description}</p>
          <div className="mt-5 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Avatar name={room.moderatorNickname} size="sm" />
              <span className="font-medium text-gray-700">{room.moderatorNickname}</span>
              <span className="text-gray-300">&middot;</span>
              <span>{relativeTime(room.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Users size={14} />
              <span className="font-medium text-gray-700">{room.participantCount}/{room.maxParticipants}명</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <CalendarClock size={14} />
              <span className="font-medium text-gray-600">{formatStartTime(room.startTime)}</span>
            </div>
          </div>
        </div>
        <div className="border-t lg:border-t-0 lg:border-l border-gray-100 bg-gradient-to-br from-gray-50 to-white p-7">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">현재 분포</div>
          <div className="mb-3 flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${lead === 'PRO' ? 'text-blue-600' : lead === 'CON' ? 'text-red-600' : 'text-gray-700'}`}>
              {lead === 'TIE' ? '박빙' : lead === 'PRO' ? '찬성 우세' : '반대 우세'}
            </span>
          </div>
          <StanceBar pro={room.proCount} con={room.conCount} neutral={room.neutralCount} height="h-2.5" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 py-2">
              <div className="text-[10px] font-semibold uppercase text-blue-600">찬성</div>
              <div className="mt-0.5 text-lg font-bold text-blue-700">{proPct}%</div>
              <div className="text-[10px] text-blue-600/70">{room.proCount}명</div>
            </div>
            <div className="rounded-lg bg-gray-100 py-2">
              <div className="text-[10px] font-semibold uppercase text-gray-500">중립</div>
              <div className="mt-0.5 text-lg font-bold text-gray-700">{total ? Math.round((room.neutralCount / total) * 100) : 0}%</div>
              <div className="text-[10px] text-gray-500">{room.neutralCount}명</div>
            </div>
            <div className="rounded-lg bg-red-50 py-2">
              <div className="text-[10px] font-semibold uppercase text-red-600">반대</div>
              <div className="mt-0.5 text-lg font-bold text-red-700">{conPct}%</div>
              <div className="text-[10px] text-red-600/70">{room.conCount}명</div>
            </div>
          </div>
          <div className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-indigo-700">
            토론 참여하기 <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </button>
  );
}

function RoomCardV2({ room, onOpen, closed }: { room: DebateRoom; onOpen: (id: string) => void; closed?: boolean }) {
  const total = room.proCount + room.conCount + room.neutralCount;
  const proPct = total ? Math.round((room.proCount / total) * 100) : 50;
  const conPct = total ? Math.round((room.conCount / total) * 100) : 50;
  const badge = statusBadge[room.status];
  return (
    <button onClick={() => onOpen(room.id)}
      className={cn(
        'group flex flex-col cursor-pointer rounded-xl border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md',
        closed ? 'border-gray-200 opacity-90' : 'border-gray-200'
      )}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
          {room.tags.slice(0, 2).map((t) => (
            <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">#{t.name}</span>
          ))}
        </div>
        <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
          <Clock size={11} />{relativeTime(room.createdAt)}
        </span>
      </div>
      <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-indigo-700">{room.title}</h3>
      <p className="mb-4 text-[13px] leading-relaxed text-gray-500 line-clamp-2">{room.description}</p>
      <div className="mt-auto">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-blue-600">찬성 {proPct}%</span>
          <span className="text-gray-400">{room.neutralCount > 0 ? `중립 ${room.neutralCount}명` : ''}</span>
          <span className="font-semibold text-red-600">{conPct}% 반대</span>
        </div>
        <StanceBar pro={room.proCount} con={room.conCount} neutral={room.neutralCount} />
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
          <div className="flex items-center gap-1 text-gray-500">
            <Avatar name={room.moderatorNickname} size="sm" className="!w-5 !h-5 !text-[9px]" />
            <span>{room.moderatorNickname}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-400">
              <CalendarClock size={11} />
              <span className="text-gray-600">{formatStartTime(room.startTime)}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Users size={11} />
              <span className="font-medium text-gray-600">{room.participantCount}/{room.maxParticipants}명</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

const categories = [
  { tag: '기술', desc: 'AI · 데이터 · 인터넷' },
  { tag: '정책', desc: '입법 · 규제' },
  { tag: '경제', desc: '시장 · 노동 · 분배' },
  { tag: '사회', desc: '미디어 · 교육 · 윤리' },
  { tag: '직장', desc: '근무 · 협업' },
  { tag: '복지', desc: '소득 · 보장' },
  { tag: '라이프스타일', desc: '생활 · 문화' },
];

const statusFilters = [
  { k: undefined as string | undefined, l: '전체' },
  { k: 'RECRUITING', l: '모집 중' },
  { k: 'IN_PROGRESS', l: '진행 중' },
  { k: 'CLOSED', l: '종료' },
];

export function HomePage() {
  const { rooms, isLoading, fetchRooms } = useRoomStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<SortKey>('hot');

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const filtered = rooms.filter((r) => {
    if (status && r.status !== status) return false;
    if (tag && !r.tags.some((t) => t.name === tag)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'hot') return (b.participantCount + b.proCount + b.conCount) - (a.participantCount + a.proCount + a.conCount);
    if (sort === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'close') return Math.abs(a.proCount - a.conCount) - Math.abs(b.proCount - b.conCount);
    return 0;
  });

  const activeRooms = sorted.filter((r) => r.status !== 'CLOSED');
  const closedRooms = sorted.filter((r) => r.status === 'CLOSED');
  const featured = activeRooms[0];
  const rest = activeRooms.slice(1);

  const totalParticipants = rooms.reduce((s, r) => s + r.participantCount, 0);
  const activeCount = rooms.filter((r) => r.status !== 'CLOSED').length;
  const totalMsgs = rooms.reduce((s, r) => s + r.proCount + r.conCount, 0) * 3;

  const onOpenRoom = (id: string) => navigate(`/rooms/${id}`);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-end justify-between gap-8">
            <div className="max-w-2xl flex-1">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                실시간 토론 {activeCount}개 진행 중
              </div>
              <h1 className="text-[34px] font-bold leading-[1.15] tracking-tight text-gray-900">
                생각이 부딪치는 곳,<br />
                <span className="text-indigo-600">한 줄의 의견</span>으로 시작하세요.
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
                찬성과 반대, 그 사이의 모든 입장. 토론챗에서는 모든 메시지에 사이드가 새겨집니다.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {isAuthenticated && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} />새 토론 시작
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden gap-3 shrink-0 md:grid md:grid-cols-3">
              <StatCard label="진행 중인 토론" value={activeCount} accent="indigo" icon={<MessageCircle size={16} />} />
              <StatCard label="활동 중 참여자" value={totalParticipants} unit="명" accent="blue" icon={<Users size={16} />} />
              <StatCard label="오늘의 메시지" value={totalMsgs} unit="건" accent="gray" icon={<Send size={16} />} />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">관심 분야</h2>
            <button onClick={() => setTag(undefined)} className="text-[11px] text-gray-500 hover:text-gray-700">전체 보기</button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((c) => {
              const active = tag === c.tag;
              return (
                <button key={c.tag} onClick={() => setTag(active ? undefined : c.tag)}
                  className={cn(
                    'group flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all',
                    active
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  )}>
                  <span className={cn('text-sm font-semibold', active ? 'text-indigo-700' : 'text-gray-900')}>#{c.tag}</span>
                  <span className="text-[11px] leading-tight text-gray-500">{c.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {statusFilters.map((o) => (
              <button key={o.l} onClick={() => setStatus(o.k)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  status === o.k ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                )}>{o.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">정렬</span>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
              {([{ k: 'hot', l: '인기' }, { k: 'new', l: '최신' }, { k: 'close', l: '박빙' }] as const).map((o) => (
                <button key={o.k} onClick={() => setSort(o.k)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    sort === o.k ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                  )}>{o.l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURED */}
        {featured && !status && (
          <div className="mb-8">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-base font-bold text-gray-900">지금 뜨거운 토론</h2>
              <span className="text-[11px] text-gray-400">참여자가 가장 많은 토론방</span>
            </div>
            <FeaturedRoomCard room={featured} onOpen={onOpenRoom} />
          </div>
        )}

        {/* ACTIVE ROOMS (RECRUITING + IN_PROGRESS) */}
        {(rest.length > 0 || (status && activeRooms.length > 0)) && (
          <div className="mb-10">
            <div className="mb-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {status === 'RECRUITING' ? '모집 중인 토론' : status === 'IN_PROGRESS' ? '진행 중인 토론' : '활성 토론'}
                </h2>
                <span className="text-[11px] text-gray-400">{(status ? activeRooms : rest).length}개</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(status ? activeRooms : rest).map((r) => <RoomCardV2 key={r.id} room={r} onOpen={onOpenRoom} />)}
            </div>
          </div>
        )}

        {/* CLOSED ROOMS */}
        {closedRooms.length > 0 && status !== 'RECRUITING' && status !== 'IN_PROGRESS' && (
          <div>
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-base font-bold text-gray-900">종료된 토론</h2>
              <span className="text-[11px] text-gray-400">결과를 살펴보세요</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closedRooms.map((r) => <RoomCardV2 key={r.id} room={r} onOpen={onOpenRoom} closed />)}
            </div>
          </div>
        )}

        {sorted.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <MessageCircle size={40} className="mx-auto text-gray-300" />
            <div className="mt-3 text-sm font-medium text-gray-700">토론방이 없습니다</div>
            <div className="mt-0.5 text-xs text-gray-400">다른 필터를 시도하거나 새 토론을 시작해보세요</div>
          </div>
        )}
      </div>

      <CreateRoomModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
