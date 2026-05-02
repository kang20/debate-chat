// Mock seed data lifted directly from
// debate-chat/frontend/src/mocks/data/{rooms,messages,users,arguments}.ts

window.MOCK = {
  users: [
    { id: 'user-1', nickname: '김토론', email: 'kim@example.com' },
    { id: 'user-2', nickname: '이논리', email: 'lee@example.com' },
    { id: 'user-3', nickname: '박반박', email: 'park@example.com' },
    { id: 'user-4', nickname: '최찬반', email: 'choi@example.com' },
    { id: 'user-5', nickname: '정중립', email: 'jung@example.com' },
  ],

  // status: OPEN (debate live) | VOTING (timer ended, neutrals voting) | CLOSED (results revealed)
  // timeLimitMin: total debate length in minutes
  // endsAt: ISO; if past + status OPEN, app auto-flips to VOTING
  // maxDebaters: per-side cap (PRO/CON each); maxNeutrals: total neutrals cap
  // voteResult: { proVotes, conVotes, abstain } | null
  rooms: [
    { id: 'room-1', title: 'AI 규제, 지금 당장 필요한가?',
      description: '인공지능 기술의 급속한 발전에 따라 선제적 규제가 필요하다는 의견과, 혁신을 저해할 수 있으므로 신중해야 한다는 의견이 대립하고 있습니다.',
      ownerId: 'user-1', ownerNickname: '김토론',
      visibility: 'PUBLIC', status: 'OPEN',
      tags: [{id:'tag-1',name:'기술'},{id:'tag-2',name:'정책'}],
      participantCount: 4, proCount: 2, conCount: 1, neutralCount: 1,
      timeLimitMin: 60, maxDebaters: 3, maxNeutrals: 5,
      createdAt: '2026-04-30T09:00:00Z', startedAt: '2026-04-30T09:00:00Z',
      endsAt: '2026-12-31T23:59:00Z', // far future so countdown stays alive in mock
      closedAt: null, voteResult: null },
    { id: 'room-2', title: '원격근무 vs 사무실 출근, 어떤 것이 더 효율적인가?',
      description: '코로나 이후 원격근무가 보편화되었지만, 대면 협업의 가치를 강조하는 기업도 늘고 있습니다.',
      ownerId: 'user-2', ownerNickname: '이논리',
      visibility: 'PUBLIC', status: 'VOTING',
      tags: [{id:'tag-3',name:'직장'},{id:'tag-4',name:'라이프스타일'}],
      participantCount: 3, proCount: 1, conCount: 1, neutralCount: 1,
      timeLimitMin: 30, maxDebaters: 2, maxNeutrals: 3,
      createdAt: '2026-04-29T14:00:00Z', startedAt: '2026-04-29T14:00:00Z',
      endsAt: '2026-04-29T14:30:00Z',
      closedAt: null, voteResult: null },
    { id: 'room-3', title: '기본소득제 도입, 찬성하시나요?',
      description: '모든 국민에게 조건 없이 일정 금액을 지급하는 기본소득제. 경제적 안정을 보장하는 혁신적 복지인지, 재정 부담만 가중시키는 포퓰리즘인지 토론합니다.',
      ownerId: 'user-3', ownerNickname: '박반박',
      visibility: 'PUBLIC', status: 'OPEN',
      tags: [{id:'tag-5',name:'경제'},{id:'tag-6',name:'복지'}],
      participantCount: 5, proCount: 2, conCount: 2, neutralCount: 1,
      timeLimitMin: 90, maxDebaters: 3, maxNeutrals: 8,
      createdAt: '2026-04-28T10:00:00Z', startedAt: '2026-04-28T10:00:00Z',
      endsAt: '2026-12-31T23:59:00Z',
      closedAt: null, voteResult: null },
    { id: 'room-4', title: '소셜미디어가 민주주의에 미치는 영향',
      description: '소셜미디어는 시민 참여를 촉진하는가, 아니면 여론을 왜곡하고 분열을 심화시키는가?',
      ownerId: 'user-4', ownerNickname: '최찬반',
      visibility: 'PUBLIC', status: 'CLOSED',
      tags: [{id:'tag-7',name:'사회'},{id:'tag-1',name:'기술'}],
      participantCount: 6, proCount: 2, conCount: 2, neutralCount: 2,
      timeLimitMin: 60, maxDebaters: 2, maxNeutrals: 4,
      createdAt: '2026-04-22T08:00:00Z', startedAt: '2026-04-22T08:00:00Z',
      endsAt: '2026-04-22T09:00:00Z',
      closedAt: '2026-04-22T09:05:00Z',
      voteResult: { proVotes: 1, conVotes: 1, abstain: 0, winner: 'TIE' } },
  ],

  participants: {
    'room-1': [
      { id:'p-1', userId:'user-1', nickname:'김토론', side:'PRO' },
      { id:'p-2', userId:'user-2', nickname:'이논리', side:'PRO' },
      { id:'p-3', userId:'user-3', nickname:'박반박', side:'CON' },
      { id:'p-4', userId:'user-5', nickname:'정중립', side:'NEUTRAL' },
    ],
    'room-2': [
      { id:'p-5', userId:'user-2', nickname:'이논리', side:'PRO' },
      { id:'p-6', userId:'user-4', nickname:'최찬반', side:'CON' },
      { id:'p-7', userId:'user-5', nickname:'정중립', side:'NEUTRAL' },
    ],
    'room-3': [
      { id:'p-8', userId:'user-3', nickname:'박반박', side:'PRO' },
      { id:'p-9', userId:'user-1', nickname:'김토론', side:'PRO' },
      { id:'p-10', userId:'user-4', nickname:'최찬반', side:'CON' },
      { id:'p-11', userId:'user-2', nickname:'이논리', side:'CON' },
      { id:'p-12', userId:'user-5', nickname:'정중립', side:'NEUTRAL' },
    ],
    'room-4': [
      { id:'p-13', userId:'user-4', nickname:'최찬반', side:'PRO' },
      { id:'p-14', userId:'user-1', nickname:'김토론', side:'PRO' },
      { id:'p-15', userId:'user-3', nickname:'박반박', side:'CON' },
      { id:'p-16', userId:'user-2', nickname:'이논리', side:'CON' },
      { id:'p-17', userId:'user-5', nickname:'정중립', side:'NEUTRAL' },
      { id:'p-18', userId:'user-6', nickname:'한관찰', side:'NEUTRAL' },
    ],
  },

  messages: {
    'room-1': [
      { id:'m1', authorId:'user-1', authorNickname:'김토론', sideAtSend:'PRO', content:'AI 기술이 너무 빠르게 발전하고 있어서, 지금 규제 프레임워크를 만들지 않으면 늦습니다.', createdAt:'09:05' },
      { id:'m2', authorId:'user-3', authorNickname:'박반박', sideAtSend:'CON', content:'하지만 기술의 방향성도 모르는 상태에서 성급한 규제는 혁신을 죽일 수 있어요.', createdAt:'09:08' },
      { id:'m3', authorId:'user-2', authorNickname:'이논리', sideAtSend:'PRO', content:'EU의 AI Act 사례를 보면, 위험 등급별로 규제하는 것이 가능합니다. 완전한 자유방임은 위험하죠.', createdAt:'09:12' },
      { id:'m4', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'양쪽 말 다 일리가 있는데, 규제의 범위와 시점이 핵심인 것 같습니다.', createdAt:'09:15' },
      { id:'m5', authorId:'user-1', authorNickname:'김토론', sideAtSend:'PRO', content:'자율규제는 기업의 이익과 충돌할 때 무력해집니다. 독립적인 감독 기구가 필요해요.', createdAt:'09:22' },
    ],
    'room-2': [
      { id:'m6', authorId:'user-2', authorNickname:'이논리', sideAtSend:'PRO', content:'원격근무는 통근 시간 절약, 집중력 향상 등 생산성 측면에서 확실히 우위입니다.', createdAt:'14:05' },
      { id:'m7', authorId:'user-4', authorNickname:'최찬반', sideAtSend:'CON', content:'하지만 팀 협업과 창의적 아이디어 교환은 대면에서 훨씬 효과적이에요.', createdAt:'14:10' },
      { id:'m8', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'하이브리드 근무가 두 장점을 모두 살릴 수 있는 방법 아닐까요?', createdAt:'14:15' },
    ],
    'room-3': [],
    'room-4': [
      { id:'m20', authorId:'user-4', authorNickname:'최찬반', sideAtSend:'PRO', content:'소셜미디어 덕분에 시민들이 직접 정치인을 검증하고 사회 의제를 설정할 수 있게 됐습니다.', createdAt:'08:05' },
      { id:'m21', authorId:'user-3', authorNickname:'박반박', sideAtSend:'CON', content:'반대로 알고리즘이 만든 필터버블이 양극화를 심화시켰다는 연구가 더 많아요.', createdAt:'08:11' },
      { id:'m22', authorId:'user-1', authorNickname:'김토론', sideAtSend:'PRO', content:'아랍의 봄, 미투 운동 등 시민 동원의 효과는 명백합니다.', createdAt:'08:18' },
      { id:'m23', authorId:'user-2', authorNickname:'이논리', sideAtSend:'CON', content:'그 운동들의 결과가 모두 긍정적이었나요? 동원의 부작용도 함께 봐야 합니다.', createdAt:'08:25' },
    ],
  },

  // Neutral-only group chat (separate channel — debaters cannot see during OPEN status)
  neutralMessages: {
    'room-1': [
      { id:'nm1', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'양쪽 다 합리적이긴 한데, 김토론님 논거가 좀 더 구체적이네요.', createdAt:'09:18' },
      { id:'nm2', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'EU AI Act 사례는 처음 들어봤어요. 찾아봐야겠습니다.', createdAt:'09:21' },
    ],
    'room-2': [
      { id:'nm3', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'하이브리드가 답인 것 같지만, 둘 중 하나 골라야 한다면…', createdAt:'14:20' },
    ],
    'room-3': [],
    'room-4': [
      { id:'nm4', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'양쪽 모두 일리 있는데, 결국 플랫폼 책임의 문제 같아요.', createdAt:'08:30' },
      { id:'nm5', authorId:'user-6', authorNickname:'한관찰', sideAtSend:'NEUTRAL', content:'저는 반대 측 논거가 통계 기반이라 더 설득력 있어 보였어요.', createdAt:'08:42' },
      { id:'nm6', authorId:'user-5', authorNickname:'정중립', sideAtSend:'NEUTRAL', content:'그럼 곧 투표인데 어느 쪽 가시나요?', createdAt:'08:55' },
    ],
  },

  argumentsByRoom: {
    'room-1': [
      { id:'a1', stance:'PRO', authorNickname:'김토론', content:'EU의 AI Act는 위험 등급별 규제로 혁신을 죽이지 않으면서도 명확한 가드레일을 제공합니다.',
        createdAt:'2시간 전', agreeCount:12, disagreeCount:2, myVote:'AGREE',
        children: [
          { id:'a1-1', stance:'CON', authorNickname:'박반박', content:'하지만 EU는 미국과 중국에 비해 AI 산업 자체가 위축되고 있다는 통계가 있습니다.',
            createdAt:'1시간 전', agreeCount:5, disagreeCount:3, myVote:null, children:[] },
        ] },
      { id:'a2', stance:'CON', authorNickname:'박반박', content:'자율규제와 산업 가이드라인으로도 충분히 대응 가능합니다. 자율주행처럼 사고가 발생한 영역만 사후 규제하면 됩니다.',
        createdAt:'30분 전', agreeCount:6, disagreeCount:8, myVote:null, children:[] },
    ],
  },

  notifications: [
    { id:'n1', type:'MENTION', text:'@김토론 님이 회원님을 언급했습니다.', read:false, time:'5분 전' },
    { id:'n2', type:'REPLY', text:'박반박 님이 회원님의 논거에 답글을 남겼습니다.', read:false, time:'1시간 전' },
    { id:'n3', type:'JOIN', text:'정중립 님이 토론방에 참여했습니다.', read:true, time:'어제' },
  ],
};
