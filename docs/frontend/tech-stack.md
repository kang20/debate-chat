# 프론트엔드 기술 구성

## 1. 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript 6 |
| 빌드 도구 | Vite 8 |
| CSS | Tailwind CSS 4 (`@tailwindcss/vite` 플러그인) |
| 라우팅 | react-router 7 |
| 상태 관리 | Zustand 5 |
| HTTP 클라이언트 | Axios |
| 아이콘 | lucide-react |
| 토스트 알림 | react-hot-toast |
| 날짜 유틸 | date-fns |
| CSS 유틸 | clsx + tailwind-merge (`cn()` 헬퍼) |
| 모킹 | MSW 2 (Service Worker 기반 API 모킹) |

## 2. 프로젝트 구조

```
frontend/
├── public/                  # 정적 에셋 (favicon, MSW worker)
├── src/
│   ├── components/
│   │   ├── ui/              # 공통 UI 컴포넌트 (Button, Input, Modal, Avatar, Spinner)
│   │   └── Header.tsx       # 글로벌 헤더 (네비게이션, 알림 팝오버)
│   ├── layouts/
│   │   └── AuthLayout.tsx   # 인증 페이지 레이아웃 (중앙 정렬)
│   ├── pages/
│   │   ├── auth/            # LoginPage, SignupPage
│   │   ├── home/            # HomePage + CreateRoomModal
│   │   └── room/            # RoomDetailPage + ChatPanel, ArgumentTree, ParticipantSidebar, RoomHeader
│   ├── stores/              # Zustand 스토어 (authStore, roomStore, notificationStore)
│   ├── types/               # TypeScript 타입 정의
│   ├── utils/               # 유틸리티 (cn, validation, date)
│   ├── index.css            # 글로벌 스타일 + Tailwind 테마 변수
│   └── main.tsx             # 앱 엔트리포인트
└── index.html               # HTML 템플릿 (Pretendard 폰트 CDN)
```

## 3. 알림 (Toast) 패턴

사용자 액션 결과를 `react-hot-toast`로 피드백:
- 로그인 성공 → `toast.success('로그인 성공!')`
- 회원가입 완료 → `toast.success('회원가입이 완료되었습니다! 로그인해주세요.')`
- 토론방 생성 → `toast.success('토론방이 생성되었습니다!')`
- 에러 발생 → `toast.error(...)` (각 상황별 메시지)
