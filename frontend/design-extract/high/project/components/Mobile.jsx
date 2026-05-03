/* eslint-disable */
// Mobile-specific composition of the existing primitives.
// Reuses Avatar, Badge, SideBadge, Button, Input, ChatMessage, ArgumentNode etc.
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

function MobileFrame({ children, statusBarTime = '14:25', screenLabel }) {
  // Lightweight mobile shell — fits inside iOS frame which already provides
  // the bezel + status bar. We just render our app content into the safe area.
  return (
    <div className="flex h-full w-full flex-col bg-gray-50" data-screen-label={screenLabel}>
      {children}
    </div>
  );
}

function MobileTopBar({ title, leading, trailing, subtitle, transparent }) {
  return (
    <div className={`flex shrink-0 items-center gap-2 px-3 ${transparent ? '' : 'border-b border-gray-200 bg-white'}`} style={{ minHeight: 52 }}>
      <div className="flex w-9 items-center">{leading}</div>
      <div className="flex-1 min-w-0 text-center">
        <div className="truncate text-[15px] font-semibold text-gray-900">{title}</div>
        {subtitle && <div className="truncate text-[11px] text-gray-500">{subtitle}</div>}
      </div>
      <div className="flex w-9 items-center justify-end">{trailing}</div>
    </div>
  );
}

function MobileTabBar({ tab, onTab }) {
  const I = window.Icons;
  const items = [
    { id: 'home', label: '둘러보기', icon: I.MessageCircle },
    { id: 'my', label: '내 토론', icon: I.Users },
    { id: 'noti', label: '알림', icon: I.Bell, badge: 2 },
    { id: 'me', label: '프로필', icon: I.User || I.Users },
  ];
  return (
    <div className="flex shrink-0 items-stretch border-t border-gray-200 bg-white" style={{ paddingBottom: 18 }}>
      {items.map(it => {
        const Ico = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => onTab(it.id)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
            <span className="relative">
              <Ico size={22}/>
              {it.badge ? <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{it.badge}</span> : null}
            </span>
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ===== Mobile Login =====
function MobileLogin({ onLogin, mode = 'login', onSwitch }) {
  const I = window.Icons;
  const [email, setEmail] = useStateM('kim@example.com');
  const [pw, setPw] = useStateM('password123');
  const [nick, setNick] = useStateM('');
  const isReg = mode === 'register';
  const submit = (e) => { e.preventDefault(); onLogin({ email, nickname: nick || '김토론' }); };
  return (
    <MobileFrame screenLabel={isReg ? 'M-회원가입' : 'M-로그인'}>
      <div className="flex flex-1 flex-col px-6 pt-12 pb-6">
        <div className="mb-8 flex flex-col items-center gap-2 text-indigo-600">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <I.MessageSquare size={32}/>
          </div>
          <div className="text-2xl font-bold tracking-tight">토론챗</div>
          <div className="text-xs text-gray-500">생각이 자라는 토론 공간</div>
        </div>
        <h2 className="mb-1 text-lg font-bold text-gray-900">{isReg ? '회원가입' : '다시 오신 것을 환영합니다'}</h2>
        <p className="mb-5 text-xs text-gray-500">
          {isReg ? '새 계정을 만들고 토론에 참여하세요' : '계정에 로그인하여 토론에 참여하세요'}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input label="이메일" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          {isReg && <Input label="닉네임" value={nick} onChange={e=>setNick(e.target.value)} placeholder="3-20자 한글/영문/숫자"/>}
          <Input label="비밀번호" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••"/>
          <Button type="submit" size="lg" className="w-full mt-2">{isReg ? '가입하기' : '로그인'}</Button>
        </form>
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-500">
          <div className="font-medium text-gray-600 mb-0.5">테스트 계정</div>
          kim@example.com / password123
        </div>
        <p className="mt-auto pt-6 text-center text-xs text-gray-500">
          {isReg ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
          <a onClick={onSwitch} className="cursor-pointer font-semibold text-indigo-600">
            {isReg ? '로그인' : '회원가입'}
          </a>
        </p>
      </div>
    </MobileFrame>
  );
}

// ===== Mobile Home (Room list) =====
function MobileHome({ user, onOpenRoom, onCreate, tab, onTab, onLogout }) {
  const I = window.Icons;
  const [status, setStatus] = useStateM(undefined);
  const [tag, setTag] = useStateM(undefined);
  const [q, setQ] = useStateM('');
  const tags = ['기술','정책','경제','사회','직장','복지'];
  const rooms = window.MOCK.rooms.filter(r => {
    if (status && r.status !== status) return false;
    if (tag && !r.tags.some(t => t.name === tag)) return false;
    if (q && !r.title.includes(q)) return false;
    return true;
  });
  return (
    <MobileFrame screenLabel="M-홈">
      <MobileTopBar
        title="토론챗"
        leading={<button onClick={onLogout} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400"><I.LogOut size={18}/></button>}
        trailing={<button onClick={() => onTab('noti')} className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600">
          <I.Bell size={20}/>
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">2</span>
        </button>}
      />
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="pt-4 pb-3">
          <div className="text-xl font-bold text-gray-900">토론방 둘러보기</div>
          <div className="mt-0.5 text-xs text-gray-500">관심 있는 주제를 찾고 토론에 참여하세요</div>
        </div>
        <div className="relative mb-3">
          <I.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="토론 주제를 검색하세요..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
        </div>
        <div className="mb-3 flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
          {[{k:undefined,l:'전체'},{k:'OPEN',l:'진행 중'},{k:'CLOSED',l:'종료'}].map(o => (
            <button key={o.l} onClick={()=>setStatus(o.k)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${status===o.k?'bg-indigo-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>{o.l}</button>
          ))}
          <div className="mx-1 self-center h-4 w-px bg-gray-200"/>
          <button onClick={()=>setTag(undefined)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!tag?'bg-indigo-100 text-indigo-700':'bg-white text-gray-600 border border-gray-200'}`}>전체 태그</button>
          {tags.map(t => (
            <button key={t} onClick={()=>setTag(tag===t?undefined:t)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${tag===t?'bg-indigo-100 text-indigo-700':'bg-white text-gray-600 border border-gray-200'}`}>{t}</button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rooms.map(r => <MobileRoomCard key={r.id} room={r} onOpen={onOpenRoom}/>)}
          {rooms.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
              <I.MessageCircle size={32} className="mx-auto text-gray-300"/>
              <div className="mt-2 text-sm font-medium text-gray-700">검색 결과가 없습니다</div>
              <div className="mt-0.5 text-xs text-gray-400">다른 필터로 시도해보세요</div>
            </div>
          )}
        </div>
      </div>
      <button onClick={onCreate}
        className="absolute right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700"
        style={{ bottom: 92 }}>
        <I.Plus size={26}/>
      </button>
      <MobileTabBar tab={tab} onTab={onTab}/>
    </MobileFrame>
  );
}

function MobileRoomCard({ room, onOpen }) {
  const I = window.Icons;
  const total = room.proCount + room.conCount + (room.neutralCount || 0);
  const proPct = total ? Math.round((room.proCount / total) * 100) : 50;
  const conPct = total ? Math.round((room.conCount / total) * 100) : 50;
  return (
    <a onClick={() => onOpen(room.id)}
      className="block cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow active:shadow-md">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">{room.title}</h3>
        {room.status === 'CLOSED' && <span className="shrink-0 rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-white">종료</span>}
      </div>
      <p className="mb-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">{room.description}</p>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="flex h-full">
          <div className="bg-blue-500" style={{ width: `${proPct}%` }}/>
          <div className="bg-red-500" style={{ width: `${conPct}%` }}/>
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-600">찬성 {room.proCount}</span>
          <span className="text-gray-300">·</span>
          <span className="font-semibold text-red-600">반대 {room.conCount}</span>
          {room.neutralCount > 0 && <><span className="text-gray-300">·</span>
            <span className="text-gray-500">중립 {room.neutralCount}</span></>}
        </div>
        <span className="flex items-center gap-1 text-gray-400">
          <I.Users size={12}/>{room.participantCount}명
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {room.tags.map(t => (
          <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">#{t.name}</span>
        ))}
      </div>
    </a>
  );
}

// ===== Mobile Room Detail =====
function MobileRoom({ roomId, currentUser, onBack }) {
  const I = window.Icons;
  const room = window.MOCK.rooms.find(r => r.id === roomId);
  const [participants, setParticipants] = useStateM(window.MOCK.participants[roomId] || []);
  const [messages, setMessages] = useStateM(window.MOCK.messages[roomId] || []);
  const [tab, setTab] = useStateM('chat');
  const [input, setInput] = useStateM('');
  const [showJoin, setShowJoin] = useStateM(false);
  const [showInfo, setShowInfo] = useStateM(false);
  const me = participants.find(p => p.userId === currentUser?.id);
  const endRef = useRefM(null);
  useEffectM(() => { endRef.current?.scrollTo?.(0, 9999); }, [messages.length, tab]);

  const join = (side) => { setParticipants([...participants, { id:`p-${Date.now()}`, userId: currentUser.id, nickname: currentUser.nickname, side }]); setShowJoin(false); };
  const leave = () => setParticipants(participants.filter(p => p.userId !== currentUser.id));
  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id:`m-${Date.now()}`, authorId: currentUser.id, authorNickname: currentUser.nickname, sideAtSend: me?.side || 'NEUTRAL', content: input.trim(), createdAt: '방금' }]);
    setInput('');
  };
  if (!room) return <MobileFrame><div className="p-6 text-sm">존재하지 않는 토론방입니다.</div></MobileFrame>;

  const total = room.proCount + room.conCount + (room.neutralCount || 0);
  const proPct = total ? (room.proCount / total) * 100 : 50;
  const conPct = total ? (room.conCount / total) * 100 : 50;

  return (
    <MobileFrame screenLabel="M-토론방">
      <MobileTopBar
        title={room.title}
        subtitle={`참여자 ${participants.length}명`}
        leading={<button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700"><I.ArrowLeft size={20}/></button>}
        trailing={<button onClick={() => setShowInfo(true)} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500"><I.Users size={18}/></button>}
      />
      {/* stance summary bar */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-blue-600">찬성 {room.proCount}</span>
          <span className="text-gray-400">중립 {room.neutralCount}</span>
          <span className="font-semibold text-red-600">반대 {room.conCount}</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-blue-500" style={{ width: `${proPct}%` }}/>
          <div className="bg-red-500" style={{ width: `${conPct}%` }}/>
        </div>
      </div>
      {/* tab switcher */}
      <div className="shrink-0 flex items-stretch border-b border-gray-200 bg-white">
        {[{k:'chat',l:'실시간 채팅',i:I.MessageCircle},{k:'args',l:'논거 트리',i:I.TreePine}].map(t => {
          const Ico = t.i;
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={()=>setTab(t.k)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${active ? 'text-indigo-600' : 'text-gray-500'}`}>
              <Ico size={16}/>{t.l}
              {active && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-indigo-600"/>}
            </button>
          );
        })}
      </div>
      {/* body */}
      {tab === 'chat' ? (
        <>
          <div ref={endRef} className="flex-1 overflow-y-auto bg-gray-50 px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400">아직 메시지가 없습니다.<br/>첫 의견을 남겨보세요!</div>
            )}
            {messages.map(m => <ChatMessage key={m.id} message={m} isOwn={m.authorId === currentUser?.id}/>)}
          </div>
          <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2" style={{ paddingBottom: 22 }}>
            {me ? (
              <div className="flex items-end gap-2">
                <div className="flex-1 flex items-end gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <SideBadge side={me.side}/>
                  <textarea value={input} onChange={e=>setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..." rows={1}
                    className="flex-1 resize-none bg-transparent text-sm focus:outline-none"
                    style={{ maxHeight: 80 }}
                    onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){e.preventDefault(); send();}}}/>
                </div>
                <button onClick={send} disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors disabled:opacity-40">
                  <I.Send size={18}/>
                </button>
              </div>
            ) : (
              <button onClick={()=>setShowJoin(true)}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                토론에 참여하기
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-3">
            <ArgumentTree args={window.MOCK.argumentsByRoom[roomId] || []}/>
          </div>
          <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2" style={{ paddingBottom: 22 }}>
            {me ? (
              <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700">
                <I.Plus size={16}/>새 논거 작성
              </button>
            ) : (
              <button onClick={()=>setShowJoin(true)}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white">
                토론에 참여하기
              </button>
            )}
          </div>
        </>
      )}
      {/* Join sheet */}
      {showJoin && (
        <MobileSheet onClose={() => setShowJoin(false)} title="입장 선택">
          <p className="mb-4 text-sm text-gray-600">어떤 입장으로 참여하시겠습니까?</p>
          <div className="flex flex-col gap-2.5">
            <button onClick={()=>join('PRO')}
              className="flex items-center justify-between rounded-xl border-2 border-blue-100 bg-blue-50 p-4 transition-colors active:bg-blue-100">
              <div className="text-left">
                <div className="text-base font-bold text-blue-700">찬성 (PRO)</div>
                <div className="text-xs text-blue-600/80 mt-0.5">주제에 동의하는 입장에서 토론합니다</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                <I.ThumbsUp size={20}/>
              </div>
            </button>
            <button onClick={()=>join('CON')}
              className="flex items-center justify-between rounded-xl border-2 border-red-100 bg-red-50 p-4 transition-colors active:bg-red-100">
              <div className="text-left">
                <div className="text-base font-bold text-red-700">반대 (CON)</div>
                <div className="text-xs text-red-600/80 mt-0.5">주제에 반대하는 입장에서 토론합니다</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                <I.ThumbsDown size={20}/>
              </div>
            </button>
            <button onClick={()=>join('NEUTRAL')}
              className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-colors active:bg-gray-100">
              <div className="text-left">
                <div className="text-base font-bold text-gray-700">중립 (NEUTRAL)</div>
                <div className="text-xs text-gray-500 mt-0.5">관찰자로 참여하여 양쪽을 살펴봅니다</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white text-base font-bold">
                ―
              </div>
            </button>
          </div>
        </MobileSheet>
      )}
      {showInfo && (
        <MobileSheet onClose={() => setShowInfo(false)} title={`참여자 ${participants.length}명`}>
          <div className="space-y-4">
            {['PRO','CON','NEUTRAL'].map(side => {
              const ms = participants.filter(p => p.side === side);
              return (
                <div key={side}>
                  <div className="mb-2 flex items-center gap-2">
                    <SideBadge side={side}/>
                    <span className="text-xs text-gray-500">{ms.length}명</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ms.length === 0 && <div className="col-span-2 text-xs text-gray-400">아직 없습니다</div>}
                    {ms.map(p => (
                      <div key={p.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                        <Avatar name={p.nickname} size="sm"/>
                        <span className="text-sm text-gray-700">{p.nickname}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {me && (
              <button onClick={() => { leave(); setShowInfo(false); }}
                className="mt-2 w-full rounded-xl border border-red-200 bg-white py-2.5 text-sm font-medium text-red-600">
                토론방 나가기
              </button>
            )}
          </div>
        </MobileSheet>
      )}
    </MobileFrame>
  );
}

// ===== Notifications =====
function MobileNoti({ tab, onTab, onBack }) {
  const I = window.Icons;
  const items = window.MOCK.notifications;
  return (
    <MobileFrame screenLabel="M-알림">
      <MobileTopBar title="알림" leading={<button onClick={onBack} className="flex h-9 w-9 items-center justify-center text-gray-700"><I.ArrowLeft size={20}/></button>}
        trailing={<button className="text-[11px] font-medium text-indigo-600 px-2">모두 읽음</button>}/>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.map(n => (
          <div key={n.id} className={`flex items-start gap-3 rounded-xl border p-3 ${n.read ? 'border-gray-200 bg-white' : 'border-indigo-100 bg-indigo-50/40'}`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
              {n.type==='MENTION' ? <I.Bell size={16}/> : n.type==='REPLY' ? <I.MessageCircle size={16}/> : <I.Users size={16}/>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-800 leading-snug">{n.text}</div>
              <div className="mt-0.5 text-[11px] text-gray-400">{n.time}</div>
            </div>
            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500"/>}
          </div>
        ))}
      </div>
      <MobileTabBar tab={tab} onTab={onTab}/>
    </MobileFrame>
  );
}

// ===== Generic bottom sheet =====
function MobileSheet({ onClose, title, children }) {
  const I = window.Icons;
  return (
    <div className="absolute inset-0 z-30 flex flex-col">
      <div className="flex-1 bg-black/50" onClick={onClose}/>
      <div className="rounded-t-2xl bg-white px-5 pt-4 pb-8" style={{ paddingBottom: 32 }}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300"/>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400"><I.X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { MobileFrame, MobileTopBar, MobileTabBar, MobileLogin, MobileHome, MobileRoom, MobileNoti, MobileSheet, MobileRoomCard });
