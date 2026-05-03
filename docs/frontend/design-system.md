# 디자인 시스템

## 1. 입장(Stance) 색상 체계

서비스 전체에서 일관되게 사용되는 시각적 규칙:

| 입장 | 한국어 | 색상 | CSS 변수 | Tailwind 클래스 | 사용 위치 |
|------|--------|------|----------|----------------|-----------|
| PRO | 찬성 | 파란색 | `--color-pro: #3b82f6` | `blue-500/600/700` | 메시지 배지, 논거 보더, 참여자 목록, 입장 선택, 스탠스 바 |
| CON | 반대 | 빨간색 | `--color-con: #ef4444` | `red-500/600/700` | 메시지 배지, 논거 보더, 참여자 목록, 입장 선택, 스탠스 바 |
| NEUTRAL | 중립 | 회색 | `--color-neutral: #6b7280` | `gray-300/500` | 메시지 배지, 참여자 목록, 입장 선택, 스탠스 바 |

## 2. 브랜드 컬러

| 용도 | 색상 | Tailwind |
|------|------|----------|
| 주요 액션(Primary) | 인디고 | `indigo-600` / `indigo-700` |
| 보조 액션(Secondary) | 화이트 + 그레이 보더 | `white` + `gray-200` |
| 위험 액션(Danger) | 레드 | `red-600` / `red-700` |
| 고스트(Ghost) | 투명 + 그레이 텍스트 | `gray-600` + `hover:bg-gray-100` |

## 3. 타이포그래피

- **기본 폰트**: Pretendard Variable (CDN), 폴백: Apple SD Gothic Neo, Noto Sans KR, system-ui
- **텍스트 위계**: `gray-900`(제목) → `gray-700`(라벨) → `gray-500`(본문 보조) → `gray-400`(플레이스홀더/힌트)

## 4. 공통 UI 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| `Button` | `components/ui/Button.tsx` | variant(primary/secondary/danger/ghost/pro/con), size(sm/md/lg) |
| `Input` | `components/ui/Input.tsx` | label, error 메시지, 포커스 링 지원 |
| `Modal` | `components/ui/Modal.tsx` | 오버레이 + 중앙 카드, 바깥 클릭 닫기, 스크롤 잠금 |
| `Avatar` | `components/ui/Avatar.tsx` | 이미지 또는 이니셜 폴백, size(sm/md/lg) |
| `Spinner` | `components/ui/Spinner.tsx` | 로딩 애니메이션, `PageSpinner`(전체 높이) 변형 |

## 5. 스탠스 바(Stance Bar)

찬성/중립/반대 비율을 수평 바로 시각화하는 컴포넌트:
- 파란색(찬성) → 회색(중립) → 빨간색(반대) 순으로 표시
- 토론방 카드, Featured 카드, 토론방 상세 헤더에서 일관 사용
