/* eslint-disable */
const { useState: useStateApp, useRef: useRefApp, useEffect: useEffectApp } = React;

// ===== Desktop App (composes existing UI kit + adds working create-room/noti) =====
function DesktopApp({ initialPage = 'login', initialUser = null, initialRoomId = null }) {
  const I = window.Icons;
  const [page, setPage] = useStateApp(initialPage);
  const [user, setUser] = useStateApp(initialUser);
  const [roomId, setRoomId] = useStateApp(initialRoomId);
  const [authMode, setAuthMode] = useStateApp('login');
  const [createOpen, setCreateOpen] = useStateApp(false);
  const [notiOpen, setNotiOpen] = useStateApp(false);
  const [, force] = useStateApp(0);

  const onLogin = (u) => { setUser({ id:'me', ...u }); setPage('home'); };
  const onLogout = () => { setUser(null); setPage('login'); };
  const openRoom = (id) => { setRoomId(id); setPage('room'); };
  const onCreate = (data) => {
    const tagObjs = data.tags.map((n,i)=>({ id:`tag-new-${i}`, name:n }));
    const newRoom = {
      id: `room-${Date.now()}`,
      title: data.title, description: data.description,
      ownerId: user.id, ownerNickname: user.nickname,
      visibility: data.visibility, status: 'OPEN',
      tags: tagObjs,
      participantCount: 1, proCount: 0, conCount: 0, neutralCount: 0,
      createdAt: new Date().toISOString(), closedAt: null
    };
    window.MOCK.rooms = [newRoom, ...window.MOCK.rooms];
    window.MOCK.participants[newRoom.id] = [];
    window.MOCK.messages[newRoom.id] = [];
    window.MOCK.argumentsByRoom[newRoom.id] = [];
    setCreateOpen(false);
    force(n=>n+1);
    setRoomId(newRoom.id); setPage('room');
  };

  return (
    <div className="min-h-full" data-screen-label={`Desktop — ${page}`}>
      <DesktopHeader user={user} onNav={setPage} onLogout={onLogout}
        onOpenCreate={()=>setCreateOpen(true)}
        notiOpen={notiOpen} setNotiOpen={setNotiOpen}/>
      {page === 'login' && (
        <LoginPage mode={authMode} onLogin={onLogin}
          onSwitchToRegister={() => setAuthMode('register')}
          onSwitchToLogin={() => setAuthMode('login')}/>
      )}
      {page === 'home' && user && (
        <HomePageV2 onOpenRoom={openRoom} onCreateRoom={() => setCreateOpen(true)}/>
      )}
      {page === 'room' && user && roomId && (
        <RoomDetailPage roomId={roomId} currentUser={user} onBack={() => setPage('home')}/>
      )}
      <CreateRoomModal open={createOpen} onClose={()=>setCreateOpen(false)} onCreate={onCreate}/>
    </div>
  );
}

// Custom desktop header (forks the kit's Header to add notification popover + create-room)
function DesktopHeader({ user, onNav, onLogout, onOpenCreate, notiOpen, setNotiOpen }) {
  const I = window.Icons;
  const ref = useRefApp(null);
  useEffectApp(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setNotiOpen(false); };
    if (notiOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [notiOpen]);
  const unread = window.MOCK.notifications.filter(n=>!n.read).length;
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a onClick={() => onNav(user ? 'home' : 'login')} className="flex cursor-pointer items-center gap-2 text-xl font-bold text-indigo-600">
          <I.MessageSquare size={24}/>
          <span>토론챗</span>
        </a>
        <nav className="flex items-center gap-2">
          {user ? <>
            <Button size="sm" variant="ghost" onClick={onOpenCreate}>
              <I.Plus size={16}/>새 토론
            </Button>
            <div ref={ref} className="relative">
              <button onClick={() => setNotiOpen(!notiOpen)}
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100">
                <I.Bell size={20}/>
                {unread>0 && <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unread}</span>}
              </button>
              <NotificationsPopover open={notiOpen} onClose={()=>setNotiOpen(false)} items={window.MOCK.notifications}/>
            </div>
            <a className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 cursor-pointer">
              <Avatar name={user.nickname} size="sm"/>
              <span className="text-sm font-medium">{user.nickname}</span>
            </a>
            <button onClick={onLogout} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><I.LogOut size={18}/></button>
          </> : <>
            <Button variant="ghost" size="sm" onClick={() => onNav('login')}>로그인</Button>
            <Button size="sm" onClick={() => onNav('login')}>회원가입</Button>
          </>}
        </nav>
      </div>
    </header>
  );
}

// ===== Mobile App =====
function MobileApp({ initialPage = 'login', initialUser = null, initialRoomId = null, initialJoined = null }) {
  const [page, setPage] = useStateApp(initialPage); // login | home | room | noti
  const [user, setUser] = useStateApp(initialUser);
  const [roomId, setRoomId] = useStateApp(initialRoomId);
  const [tab, setTab] = useStateApp('home');
  const [authMode, setAuthMode] = useStateApp('login');

  // If initialJoined is set, ensure currentUser is in that room's participants
  useEffectApp(() => {
    if (initialJoined && initialUser && initialRoomId) {
      const ps = window.MOCK.participants[initialRoomId] || [];
      if (!ps.some(p => p.userId === initialUser.id)) {
        window.MOCK.participants[initialRoomId] = [...ps, { id:`p-init-${initialRoomId}`, userId: initialUser.id, nickname: initialUser.nickname, side: initialJoined }];
      }
    }
  }, []);

  const onLogin = (u) => { setUser({ id:'me', ...u }); setPage('home'); setTab('home'); };
  const onLogout = () => { setUser(null); setPage('login'); };

  return (
    <div className="h-full w-full bg-gray-50 relative overflow-hidden" data-screen-label={`Mobile — ${page}`}>
      {page === 'login' && (
        <MobileLogin mode={authMode} onLogin={onLogin}
          onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}/>
      )}
      {page === 'home' && user && tab === 'home' && (
        <MobileHome user={user} onOpenRoom={(id)=>{ setRoomId(id); setPage('room'); }}
          onCreate={() => alert('모바일 생성 모달 — 데스크탑에서 시도해보세요')}
          tab={tab} onTab={(t)=>{ setTab(t); if(t==='noti') setPage('noti'); else if(t==='home') setPage('home'); }}
          onLogout={onLogout}/>
      )}
      {page === 'room' && user && roomId && (
        <MobileRoom roomId={roomId} currentUser={user} onBack={()=>{ setPage('home'); setTab('home'); }}/>
      )}
      {page === 'noti' && user && (
        <MobileNoti tab="noti" onTab={(t)=>{ setTab(t); if(t==='home') setPage('home'); else if(t==='noti') setPage('noti'); }}
          onBack={()=>{ setPage('home'); setTab('home'); }}/>
      )}
    </div>
  );
}

Object.assign(window, { DesktopApp, DesktopHeader, MobileApp });
