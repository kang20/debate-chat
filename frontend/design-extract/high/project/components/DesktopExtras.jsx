/* eslint-disable */
// Extra desktop pages/modals that compose the existing UI kit:
// - CreateRoomModal: working modal that adds a room to MOCK.rooms
// - NotificationsPanel: dropdown panel
const { useState: useStateD } = React;

function CreateRoomModal({ open, onClose, onCreate }) {
  const I = window.Icons;
  const [title, setTitle] = useStateD('');
  const [desc, setDesc] = useStateD('');
  const [tagInput, setTagInput] = useStateD('');
  const [tags, setTags] = useStateD([]);
  const [visibility, setVisibility] = useStateD('PUBLIC');
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]); setTagInput('');
  };
  const submit = () => {
    if (!title.trim() || !desc.trim()) return;
    onCreate({ title: title.trim(), description: desc.trim(), tags, visibility });
    setTitle(''); setDesc(''); setTags([]); setTagInput('');
  };
  const popularTags = ['기술','정책','경제','사회','직장','복지','라이프스타일'];
  return (
    <Modal open={open} onClose={onClose} title="새 토론방 만들기">
      <div className="space-y-4">
        <Input label="토론 주제" value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="예: AI 규제, 지금 당장 필요한가?" maxLength={100}/>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
            placeholder="토론 주제에 대한 배경과 쟁점을 간단히 설명해주세요"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">태그</label>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault(); addTag();}}}
              placeholder="태그 입력 후 Enter"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            <Button variant="secondary" size="md" onClick={addTag}>추가</Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  #{t}
                  <button onClick={()=>setTags(tags.filter(x=>x!==t))} className="text-indigo-400 hover:text-indigo-700"><I.X size={12}/></button>
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[11px] text-gray-400 mr-1 self-center">자주 쓰는 태그:</span>
            {popularTags.filter(t=>!tags.includes(t)).slice(0,5).map(t => (
              <button key={t} onClick={()=>setTags([...tags, t])}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 hover:bg-gray-200">#{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">공개 범위</label>
          <div className="flex gap-2">
            {[{k:'PUBLIC',l:'공개',d:'누구나 참여 가능'},{k:'PRIVATE',l:'비공개',d:'초대받은 사람만'}].map(o => (
              <button key={o.k} onClick={()=>setVisibility(o.k)}
                className={`flex-1 rounded-lg border-2 p-3 text-left transition-colors ${visibility===o.k?'border-indigo-600 bg-indigo-50/50':'border-gray-200 bg-white hover:border-gray-300'}`}>
                <div className="flex items-center gap-1.5">
                  {o.k==='PRIVATE' && <I.Lock size={14} className="text-gray-500"/>}
                  <span className="text-sm font-semibold text-gray-900">{o.l}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500">{o.d}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>취소</Button>
          <Button className="flex-1" onClick={submit} disabled={!title.trim() || !desc.trim()}>토론방 생성</Button>
        </div>
      </div>
    </Modal>
  );
}

function NotificationsPopover({ open, onClose, items }) {
  const I = window.Icons;
  if (!open) return null;
  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl z-50">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="text-sm font-bold text-gray-900">알림</div>
        <button className="text-[11px] font-medium text-indigo-600">모두 읽음</button>
      </div>
      <div className="max-h-96 overflow-y-auto py-1">
        {items.map(n => (
          <div key={n.id} className={`flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-indigo-50/30' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.read ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
              {n.type==='MENTION' ? <I.Bell size={14}/> : n.type==='REPLY' ? <I.MessageCircle size={14}/> : <I.Users size={14}/>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-gray-800 leading-snug">{n.text}</div>
              <div className="mt-0.5 text-[11px] text-gray-400">{n.time}</div>
            </div>
            {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"/>}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 p-2">
        <button className="w-full rounded-lg py-2 text-center text-xs font-medium text-gray-600 hover:bg-gray-50">모든 알림 보기</button>
      </div>
    </div>
  );
}

Object.assign(window, { CreateRoomModal, NotificationsPopover });
