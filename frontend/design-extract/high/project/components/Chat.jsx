/* eslint-disable */
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

function ChatMessage({ message, isOwn }) {
  return (
    <div className={`flex gap-2 ${isOwn?'flex-row-reverse':''}`}>
      <Avatar name={message.authorNickname} size="sm" className="shrink-0 mt-1"/>
      <div className={`max-w-[70%] ${isOwn?'items-end':''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn?'flex-row-reverse':''}`}>
          <span className="text-xs font-medium text-gray-700">{message.authorNickname}</span>
          <SideBadge side={message.sideAtSend}/>
          <span className="text-[10px] text-gray-400">{message.createdAt}</span>
        </div>
        <div className={`rounded-xl px-3 py-2 text-sm ${isOwn?'bg-indigo-600 text-white rounded-tr-sm':'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ messages, currentUserId, isParticipant, onSend }) {
  const I = window.Icons;
  const [input, setInput] = useStateC('');
  const endRef = useRefC(null);
  useEffectC(() => { endRef.current?.scrollTo?.(0, 9999); }, [messages.length]);
  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };
  return (
    <div className="flex h-[500px] flex-col rounded-xl border border-gray-200 bg-white">
      <div ref={endRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => <ChatMessage key={m.id} message={m} isOwn={m.authorId === currentUserId}/>)}
      </div>
      <div className="border-t border-gray-200 p-3">
        {isParticipant ? (
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){e.preventDefault(); send();} }}
              placeholder="메시지를 입력하세요..." rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            <button onClick={send} disabled={!input.trim()}
              className="rounded-lg bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
              <I.Send size={18}/>
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">토론에 참여해야 메시지를 보낼 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}

window.ChatPanel = ChatPanel;
window.ChatMessage = ChatMessage;
