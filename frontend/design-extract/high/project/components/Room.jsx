/* eslint-disable */
const { useState: useStateR } = React;

function RoomCard({ room, onOpen }) {
  const I = window.Icons;
  return (
    <a onClick={() => onOpen(room.id)}
      className="block cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{room.title}</h3>
        {room.status === 'CLOSED' && <Badge className="shrink-0 bg-gray-800 text-white">종료</Badge>}
      </div>
      <p className="mb-3 text-sm text-gray-500 line-clamp-2">{room.description}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {room.tags.map(t => <Badge key={t.id}>{t.name}</Badge>)}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><I.Users size={14}/>{room.participantCount}명</span>
          <span className="text-blue-600">찬성 {room.proCount}</span>
          <span className="text-red-600">반대 {room.conCount}</span>
          <span className="text-gray-500">중립 {room.neutralCount}</span>
        </div>
        <span className="flex items-center gap-1"><I.Clock size={14}/>방금 전</span>
      </div>
    </a>
  );
}

function RoomFilters({ status, setStatus, tag, setTag }) {
  const I = window.Icons;
  const tags = ['기술','정책','경제','사회','직장','라이프스타일','복지'];
  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <I.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="토론 주제를 검색하세요..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
        </div>
        <Button>검색</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!status?'primary':'secondary'} onClick={()=>setStatus(undefined)}>전체</Button>
        <Button size="sm" variant={status==='OPEN'?'primary':'secondary'} onClick={()=>setStatus('OPEN')}>진행 중</Button>
        <Button size="sm" variant={status==='CLOSED'?'primary':'secondary'} onClick={()=>setStatus('CLOSED')}>종료</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button onClick={()=>setTag(undefined)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!tag?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>전체 태그</button>
        {tags.map(t => (
          <button key={t} onClick={()=>setTag(tag===t?undefined:t)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${tag===t?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}

function RoomHeader({ room, isParticipant, mySide, onJoin, onLeave, onBack }) {
  const I = window.Icons;
  const [showJoin, setShowJoin] = useStateR(false);
  return (
    <>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-start gap-3">
          <button onClick={onBack} className="mt-1 text-gray-400 hover:text-gray-600"><I.ArrowLeft size={20}/></button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{room.title}</h1>
              {room.status==='CLOSED' && <Badge className="bg-gray-800 text-white">종료</Badge>}
            </div>
            <p className="mt-1 text-sm text-gray-500">{room.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {room.tags.map(t => <Badge key={t.id}>{t.name}</Badge>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><I.Users size={16}/>참여자 {room.participantCount}명</span>
            <span className="text-blue-600">찬성 {room.proCount}</span>
            <span className="text-red-600">반대 {room.conCount}</span>
            <span>중립 {room.neutralCount}</span>
          </div>
          <div className="flex items-center gap-2">
            {isParticipant ? (
              <div className="flex items-center gap-2">
                {mySide && <SideBadge side={mySide}/>}
                <Button size="sm" variant="ghost" onClick={onLeave}>나가기</Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowJoin(true)}>참여하기</Button>
            )}
          </div>
        </div>
      </div>
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="입장 선택">
        <p className="mb-4 text-sm text-gray-600">어떤 입장으로 참여하시겠습니까?</p>
        <div className="flex flex-col gap-3">
          <Button variant="pro" onClick={() => { onJoin('PRO'); setShowJoin(false); }}>찬성 (PRO)</Button>
          <Button variant="con" onClick={() => { onJoin('CON'); setShowJoin(false); }}>반대 (CON)</Button>
          <Button variant="secondary" onClick={() => { onJoin('NEUTRAL'); setShowJoin(false); }}>중립 (NEUTRAL)</Button>
        </div>
      </Modal>
    </>
  );
}

function ParticipantSidebar({ participants }) {
  const sides = ['PRO','CON','NEUTRAL'];
  const labels = { PRO:'찬성', CON:'반대', NEUTRAL:'중립' };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">참여자 ({participants.length})</h3>
      <div className="space-y-4">
        {sides.map(side => {
          const m = participants.filter(p => p.side === side);
          return (
            <div key={side}>
              <div className="mb-2 flex items-center gap-2">
                <SideBadge side={side}/>
                <span className="text-xs text-gray-500">{m.length}명</span>
              </div>
              <div className="space-y-2">
                {m.length === 0
                  ? <p className="text-xs text-gray-400">아직 {labels[side]} 참여자가 없습니다</p>
                  : m.map(p => (
                      <div key={p.id} className="flex items-center gap-2">
                        <Avatar name={p.nickname} size="sm"/>
                        <span className="text-sm text-gray-700">{p.nickname}</span>
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { RoomCard, RoomFilters, RoomHeader, ParticipantSidebar });
