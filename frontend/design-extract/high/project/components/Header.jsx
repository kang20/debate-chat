/* eslint-disable */
const { useState: useStateH } = React;
function Header({ user, onNav, unread = 2, onLogout }) {
  const I = window.Icons;
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <a onClick={() => onNav('home')} className="flex cursor-pointer items-center gap-2 text-xl font-bold text-indigo-600">
          <I.MessageSquare size={24}/>
          <span>토론챗</span>
        </a>
        <nav className="flex items-center gap-3">
          {user ? <>
            <Button size="sm" variant="ghost" onClick={() => onNav('home')}>
              <I.Plus size={16}/>새 토론
            </Button>
            <a className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 cursor-pointer">
              <I.Bell size={20}/>
              {unread>0 && <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unread}</span>}
            </a>
            <a className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 cursor-pointer">
              <Avatar name={user.nickname} size="sm"/>
              <span className="text-sm font-medium">{user.nickname}</span>
            </a>
            <button onClick={onLogout} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><I.LogOut size={18}/></button>
          </> : <>
            <Button variant="ghost" size="sm" onClick={() => onNav('login')}>로그인</Button>
            <Button size="sm" onClick={() => onNav('login')}>회원가입</Button>
          </>}
        </nav>
      </div>
    </header>
  );
}
window.Header = Header;
