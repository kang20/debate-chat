/* eslint-disable */
// Redesigned desktop Home — hero, featured debate, sectioned grid, richer cards.
const { useState: useStateH2 } = React;

function HomePageV2({ onOpenRoom, onCreateRoom }) {
  const I = window.Icons;
  const [status, setStatus] = useStateH2(undefined);
  const [tag, setTag] = useStateH2(undefined);
  const [q, setQ] = useStateH2('');
  const [sort, setSort] = useStateH2('hot');

  const allRooms = window.MOCK.rooms;
  const rooms = allRooms.filter(r => {
    if (status && r.status !== status) return false;
    if (tag && !r.tags.some(t => t.name === tag)) return false;
    if (q && !r.title.includes(q) && !r.description.includes(q)) return false;
    return true;
  });
  // Sort
  const sorted = [...rooms].sort((a,b) => {
    if (sort === 'hot') return (b.participantCount + b.proCount + b.conCount) - (a.participantCount + a.proCount + a.conCount);
    if (sort === 'new') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'close') return (Math.abs(a.proCount - a.conCount)) - (Math.abs(b.proCount - b.conCount));
    return 0;
  });

  const openRooms = sorted.filter(r => r.status === 'OPEN');
  const closedRooms = sorted.filter(r => r.status === 'CLOSED');
  const featured = openRooms[0];
  const rest = openRooms.slice(1);

  // Stats
  const totalParticipants = allRooms.reduce((s,r)=>s+r.participantCount, 0);
  const openCount = allRooms.filter(r=>r.status==='OPEN').length;
  const totalMsgs = Object.values(window.MOCK.messages).reduce((s,a)=>s+a.length,0);

  const categories = [
    { tag: '기술',         label: '기술',         desc: 'AI · 데이터 · 인터넷' },
    { tag: '정책',         label: '정책',         desc: '입법 · 규제' },
    { tag: '경제',         label: '경제',         desc: '시장 · 노동 · 분배' },
    { tag: '사회',         label: '사회',         desc: '미디어 · 교육 · 윤리' },
    { tag: '직장',         label: '직장',         desc: '근무 · 협업' },
    { tag: '복지',         label: '복지',         desc: '소득 · 보장' },
    { tag: '라이프스타일', label: '라이프스타일', desc: '생활 · 문화' },
  ];

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-end justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"/>
                실시간 토론 {openCount}개 진행 중
              </div>
              <h1 className="text-[34px] font-bold leading-[1.15] tracking-tight text-gray-900">
                생각이 부딪치는 곳,<br/>
                <span className="text-indigo-600">한 줄의 의견</span>으로 시작하세요.
              </h1>
              <p className="mt-3 text-[15px] text-gray-500 leading-relaxed">
                찬성과 반대, 그 사이의 모든 입장. 토론챗에서는 모든 메시지에 사이드가 새겨집니다.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <I.Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="토론 주제, 키워드, 태그로 검색"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                </div>
                <Button size="md" onClick={onCreateRoom}><I.Plus size={16}/>새 토론 시작</Button>
              </div>
            </div>
            {/* Stats card cluster */}
            <div className="hidden md:grid grid-cols-3 gap-3 shrink-0">
              <StatCard label="진행 중인 토론" value={openCount} accent="indigo" icon={<I.MessageCircle size={16}/>}/>
              <StatCard label="활동 중 참여자" value={`${totalParticipants}`} unit="명" accent="blue" icon={<I.Users size={16}/>}/>
              <StatCard label="오늘의 메시지" value={`${totalMsgs}`} unit="건" accent="gray" icon={<I.Send size={16}/>}/>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">관심 분야</h2>
            <button onClick={()=>setTag(undefined)} className="text-[11px] text-gray-500 hover:text-gray-700">전체 보기</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {categories.map(c => {
              const active = tag === c.tag;
              return (
                <button key={c.tag} onClick={()=>setTag(active ? undefined : c.tag)}
                  className={`group flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <span className={`text-sm font-semibold ${active?'text-indigo-700':'text-gray-900'}`}>#{c.label}</span>
                  <span className="text-[11px] text-gray-500 leading-tight">{c.desc}</span>
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
            {[{k:undefined,l:'전체'},{k:'OPEN',l:'진행 중'},{k:'CLOSED',l:'종료'}].map(o => (
              <button key={o.l} onClick={()=>setStatus(o.k)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === o.k ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}>{o.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">정렬</span>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
              {[{k:'hot',l:'인기'},{k:'new',l:'최신'},{k:'close',l:'박빙'}].map(o => (
                <button key={o.k} onClick={()=>setSort(o.k)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    sort === o.k ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}>{o.l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURED + REST */}
        {featured && !status && (
          <div className="mb-8">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-base font-bold text-gray-900">지금 뜨거운 토론</h2>
              <span className="text-[11px] text-gray-400">참여자가 가장 많은 토론방</span>
            </div>
            <FeaturedRoomCard room={featured} onOpen={onOpenRoom}/>
          </div>
        )}

        {/* OPEN ROOMS GRID */}
        {(rest.length > 0 || (status && openRooms.length > 0)) && (
          <div className="mb-10">
            <div className="mb-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-base font-bold text-gray-900">진행 중인 토론</h2>
                <span className="text-[11px] text-gray-400">{(status ? openRooms : rest).length}개</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(status ? openRooms : rest).map(r => <RoomCardV2 key={r.id} room={r} onOpen={onOpenRoom}/>)}
            </div>
          </div>
        )}

        {/* CLOSED ROOMS */}
        {closedRooms.length > 0 && status !== 'OPEN' && (
          <div>
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-base font-bold text-gray-900">종료된 토론</h2>
              <span className="text-[11px] text-gray-400">결과를 살펴보세요</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closedRooms.map(r => <RoomCardV2 key={r.id} room={r} onOpen={onOpenRoom} closed/>)}
            </div>
          </div>
        )}

        {sorted.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <I.MessageCircle size={40} className="mx-auto text-gray-300"/>
            <div className="mt-3 text-sm font-medium text-gray-700">검색 결과가 없습니다</div>
            <div className="mt-0.5 text-xs text-gray-400">다른 필터나 키워드를 시도해보세요</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, accent }) {
  const accents = {
    indigo: { bg:'bg-indigo-50', fg:'text-indigo-600' },
    blue:   { bg:'bg-blue-50',   fg:'text-blue-600' },
    gray:   { bg:'bg-gray-100',  fg:'text-gray-600' },
  };
  const a = accents[accent] || accents.gray;
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

function StanceBar({ pro, con, neutral, height = 'h-2' }) {
  const total = pro + con + neutral;
  if (total === 0) return <div className={`${height} w-full rounded-full bg-gray-100`}/>;
  const proPct = (pro / total) * 100;
  const conPct = (con / total) * 100;
  const neuPct = (neutral / total) * 100;
  return (
    <div className={`flex ${height} w-full overflow-hidden rounded-full bg-gray-100`}>
      <div className="bg-blue-500 transition-all" style={{ width: `${proPct}%` }}/>
      <div className="bg-gray-300 transition-all" style={{ width: `${neuPct}%` }}/>
      <div className="bg-red-500 transition-all" style={{ width: `${conPct}%` }}/>
    </div>
  );
}

function relTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3.6e6);
  if (h < 1) return '방금 전';
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h/24);
  return `${d}일 전`;
}

function FeaturedRoomCard({ room, onOpen }) {
  const I = window.Icons;
  const total = room.proCount + room.conCount + room.neutralCount;
  const proPct = total ? Math.round((room.proCount/total)*100) : 50;
  const conPct = total ? Math.round((room.conCount/total)*100) : 50;
  const lead = room.proCount > room.conCount ? 'PRO' : room.conCount > room.proCount ? 'CON' : 'TIE';
  return (
    <a onClick={()=>onOpen(room.id)}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-indigo-200 hover:shadow-md">
      <div className="grid grid-cols-[1fr_320px]">
        {/* Left: content */}
        <div className="p-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"/>
              실시간
            </span>
            {room.tags.map(t => (
              <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">#{t.name}</span>
            ))}
          </div>
          <h3 className="text-2xl font-bold leading-tight text-gray-900 group-hover:text-indigo-700">
            {room.title}
          </h3>
          <p className="mt-2 text-[14px] text-gray-500 leading-relaxed line-clamp-2">{room.description}</p>
          <div className="mt-5 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Avatar name={room.ownerNickname} size="sm"/>
              <span className="font-medium text-gray-700">{room.ownerNickname}</span>
              <span className="text-gray-300">·</span>
              <span>{relTime(room.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <I.Users size={14}/>
              <span className="font-medium text-gray-700">{room.participantCount}명</span> 참여
            </div>
          </div>
        </div>
        {/* Right: stance panel */}
        <div className="border-l border-gray-100 bg-gradient-to-br from-gray-50 to-white p-7">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">현재 분포</div>
          <div className="mb-3 flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${lead==='PRO'?'text-blue-600':lead==='CON'?'text-red-600':'text-gray-700'}`}>
              {lead === 'TIE' ? '박빙' : lead === 'PRO' ? `찬성 우세` : `반대 우세`}
            </span>
          </div>
          <StanceBar pro={room.proCount} con={room.conCount} neutral={room.neutralCount} height="h-2.5"/>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 py-2">
              <div className="text-[10px] font-semibold uppercase text-blue-600">찬성</div>
              <div className="mt-0.5 text-lg font-bold text-blue-700">{proPct}%</div>
              <div className="text-[10px] text-blue-600/70">{room.proCount}명</div>
            </div>
            <div className="rounded-lg bg-gray-100 py-2">
              <div className="text-[10px] font-semibold uppercase text-gray-500">중립</div>
              <div className="mt-0.5 text-lg font-bold text-gray-700">{total ? Math.round((room.neutralCount/total)*100) : 0}%</div>
              <div className="text-[10px] text-gray-500">{room.neutralCount}명</div>
            </div>
            <div className="rounded-lg bg-red-50 py-2">
              <div className="text-[10px] font-semibold uppercase text-red-600">반대</div>
              <div className="mt-0.5 text-lg font-bold text-red-700">{conPct}%</div>
              <div className="text-[10px] text-red-600/70">{room.conCount}명</div>
            </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-indigo-700">
            토론 참여하기 <I.ArrowLeft size={14} style={{transform:'rotate(180deg)'}}/>
          </button>
        </div>
      </div>
    </a>
  );
}

function RoomCardV2({ room, onOpen, closed }) {
  const I = window.Icons;
  const total = room.proCount + room.conCount + room.neutralCount;
  const proPct = total ? Math.round((room.proCount/total)*100) : 50;
  const conPct = total ? Math.round((room.conCount/total)*100) : 50;
  return (
    <a onClick={()=>onOpen(room.id)}
      className={`group flex flex-col cursor-pointer rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md ${closed ? 'border-gray-200 opacity-90' : 'border-gray-200'}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {room.tags.slice(0,2).map(t => (
            <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">#{t.name}</span>
          ))}
        </div>
        {closed
          ? <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-white">종료</span>
          : <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
              <I.Clock size={11}/>{relTime(room.createdAt)}
            </span>
        }
      </div>
      <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-indigo-700">
        {room.title}
      </h3>
      <p className="mb-4 text-[13px] text-gray-500 leading-relaxed line-clamp-2">{room.description}</p>

      {/* Stance bar with labels */}
      <div className="mt-auto">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-blue-600">찬성 {proPct}%</span>
          <span className="text-gray-400">{room.neutralCount > 0 ? `중립 ${room.neutralCount}명` : ''}</span>
          <span className="font-semibold text-red-600">{conPct}% 반대</span>
        </div>
        <StanceBar pro={room.proCount} con={room.conCount} neutral={room.neutralCount}/>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
          <div className="flex items-center gap-1 text-gray-500">
            <Avatar name={room.ownerNickname} size="sm" className="!w-5 !h-5 !text-[9px]"/>
            <span>{room.ownerNickname}</span>
          </div>
          <span className="flex items-center gap-1 text-gray-400">
            <I.Users size={11}/>
            <span className="font-medium text-gray-600">{room.participantCount}명</span>
          </span>
        </div>
      </div>
    </a>
  );
}

window.HomePageV2 = HomePageV2;
window.RoomCardV2 = RoomCardV2;
window.FeaturedRoomCard = FeaturedRoomCard;
window.StanceBar = StanceBar;
