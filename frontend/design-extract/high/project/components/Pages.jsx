/* eslint-disable */
const { useState: useStateP } = React;

function LoginPage({ onLogin, onSwitchToRegister, mode = 'login', onSwitchToLogin }) {
  const I = window.Icons;
  const [email, setEmail] = useStateP('demo@example.com');
  const [pw, setPw] = useStateP('password');
  const [nick, setNick] = useStateP('');
  const isRegister = mode === 'register';
  const submit = (e) => { e.preventDefault(); onLogin({ email, nickname: nick || '데모 사용자' }); };
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-indigo-600">
          <I.MessageSquare size={32}/>
          <h1 className="text-2xl font-bold">토론챗</h1>
        </div>
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          {isRegister ? '회원가입' : '다시 오신 것을 환영합니다'}
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {isRegister ? '새 계정을 만들고 토론에 참여하세요' : '계정에 로그인하여 토론에 참여하세요'}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="이메일" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          {isRegister && <Input label="닉네임" value={nick} onChange={e=>setNick(e.target.value)} placeholder="3-20자 한글/영문/숫자"/>}
          <Input label="비밀번호" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••"/>
          <Button type="submit" className="w-full">{isRegister ? '가입하기' : '로그인'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          {isRegister ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
          <a onClick={isRegister ? onSwitchToLogin : onSwitchToRegister}
            className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700">
            {isRegister ? '로그인' : '회원가입'}
          </a>
        </p>
      </div>
    </div>
  );
}

function HomePage({ onOpenRoom, onCreateRoom }) {
  const I = window.Icons;
  const [status, setStatus] = useStateP(undefined);
  const [tag, setTag] = useStateP(undefined);
  const rooms = window.MOCK.rooms.filter(r => {
    if (status && r.status !== status) return false;
    if (tag && !r.tags.some(t => t.name === tag)) return false;
    return true;
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">토론방 둘러보기</h1>
          <p className="mt-1 text-sm text-gray-500">관심 있는 주제를 찾고 토론에 참여하세요</p>
        </div>
        <Button onClick={onCreateRoom}><I.Plus size={16}/>새 토론방 만들기</Button>
      </div>
      <RoomFilters status={status} setStatus={setStatus} tag={tag} setTag={setTag}/>
      {rooms.length === 0
        ? <EmptyState icon={<I.MessageCircle size={48}/>} title="검색 결과가 없습니다" description="다른 필터로 시도해보세요"/>
        : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map(r => <RoomCard key={r.id} room={r} onOpen={onOpenRoom}/>)}
          </div>}
    </div>
  );
}

function RoomDetailPage({ roomId, currentUser, onBack }) {
  const I = window.Icons;
  const room = window.MOCK.rooms.find(r => r.id === roomId);
  const [participants, setParticipants] = useStateP(window.MOCK.participants[roomId] || []);
  const [messages, setMessages] = useStateP(window.MOCK.messages[roomId] || []);
  const [tab, setTab] = useStateP('chat');
  const me = participants.find(p => p.userId === currentUser?.id);
  const join = (side) => setParticipants([...participants, { id:`p-new-${Date.now()}`, userId: currentUser.id, nickname: currentUser.nickname, side }]);
  const leave = () => setParticipants(participants.filter(p => p.userId !== currentUser.id));
  const send = (txt) => setMessages([...messages, {
    id:`m-${Date.now()}`, authorId: currentUser.id, authorNickname: currentUser.nickname,
    sideAtSend: me?.side || 'NEUTRAL', content: txt, createdAt: '방금'
  }]);
  if (!room) return <div className="p-8">존재하지 않는 토론방입니다.</div>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <RoomHeader room={room} isParticipant={!!me} mySide={me?.side} onJoin={join} onLeave={leave} onBack={onBack}/>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            <button onClick={()=>setTab('chat')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab==='chat'?'bg-indigo-600 text-white':'text-gray-600 hover:bg-gray-50'}`}>
              <I.MessageCircle size={16}/>실시간 채팅
            </button>
            <button onClick={()=>setTab('args')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab==='args'?'bg-indigo-600 text-white':'text-gray-600 hover:bg-gray-50'}`}>
              <I.TreePine size={16}/>논거 트리
            </button>
          </div>
          {tab === 'chat'
            ? <ChatPanel messages={messages} currentUserId={currentUser?.id} isParticipant={!!me} onSend={send}/>
            : <ArgumentTree args={window.MOCK.argumentsByRoom[roomId] || []}/>}
        </div>
        <ParticipantSidebar participants={participants}/>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, HomePage, RoomDetailPage });
