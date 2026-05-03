/* eslint-disable */
const { useState: useStateA } = React;

function ArgumentNode({ argument, depth = 0 }) {
  const I = window.Icons;
  const [expanded, setExpanded] = useStateA(true);
  const [vote, setVote] = useStateA(argument.myVote);
  const isPro = argument.stance === 'PRO';
  const has = argument.children && argument.children.length > 0;
  return (
    <div className={`rounded-lg border-l-4 p-3 ${isPro?'border-l-blue-500 bg-blue-50/50':'border-l-red-500 bg-red-50/50'} ${depth>0?'ml-4':''}`}>
      <div className="flex items-start gap-2">
        {has && (
          <button onClick={() => setExpanded(!expanded)} className="mt-0.5 text-gray-400 hover:text-gray-600">
            {expanded ? <I.ChevronDown size={16}/> : <I.ChevronRight size={16}/>}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isPro?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>
              {isPro?'찬성':'반대'}
            </span>
            <span className="text-xs font-medium text-gray-600">{argument.authorNickname}</span>
            <span className="text-[10px] text-gray-400">{argument.createdAt}</span>
          </div>
          <p className="text-sm text-gray-800 mb-2">{argument.content}</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setVote(vote==='AGREE'?null:'AGREE')}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${vote==='AGREE'?'bg-green-100 text-green-700':'text-gray-400 hover:text-green-600'}`}>
              <I.ThumbsUp size={12}/>{argument.agreeCount + (vote==='AGREE' && argument.myVote!=='AGREE' ? 1 : 0)}
            </button>
            <button onClick={() => setVote(vote==='DISAGREE'?null:'DISAGREE')}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${vote==='DISAGREE'?'bg-red-100 text-red-700':'text-gray-400 hover:text-red-600'}`}>
              <I.ThumbsDown size={12}/>{argument.disagreeCount}
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600">
              <I.Plus size={12}/>답글
            </button>
          </div>
        </div>
      </div>
      {has && expanded && (
        <div className="mt-2 space-y-2">
          {argument.children.map(c => <ArgumentNode key={c.id} argument={c} depth={depth+1}/>)}
        </div>
      )}
    </div>
  );
}

function ArgumentTree({ args }) {
  if (!args || args.length === 0) {
    return <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">아직 논거가 없습니다.</div>;
  }
  return <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
    {args.map(a => <ArgumentNode key={a.id} argument={a}/>)}
  </div>;
}

Object.assign(window, { ArgumentNode, ArgumentTree });
