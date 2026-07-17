# 학원 숙제 관리 웹앱 (Homework Manager)

setlog 스타일의 학원 숙제 관리 애플리케이션입니다. 학생, 선생님, 학부모가 숙제를 관리하고 추적할 수 있습니다.

## 기능

- **인증**: 회원가입, 로그인 (학생/선생님/학부모)
- **숙제 관리**: 숙제 생성, 조회, 수정, 삭제
- **진행도 추적**: 숙제 상태 (대기 중, 완료, 기한 초과) 추적
- **우선순위 표시**: 높음/중간/낮음 우선순위 설정
- **제출 시스템**: 학생이 숙제 제출 표시

## 기술 스택

### 백엔드
- **Node.js + Express**: REST API 서버
- **MongoDB**: NoSQL 데이터베이스
- **JWT**: 인증 토큰
- **bcryptjs**: 비밀번호 해싱

### 프론트엔드
- **React**: UI 라이브러리
- **Vite**: 빌드 도구
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트

## 설치 및 실행

### 1. MongoDB 설치
로컬 머신에 MongoDB를 설치하고 실행합니다.

```bash
# Windows
mongod

# macOS/Linux
mongod
```

### 2. 백엔드 설정
```bash
cd homework-manager
npm install
npm run dev
```

서버는 `http://localhost:5000`에서 실행됩니다.

### 3. 프론트엔드 설정
```bash
cd client
npm install
npm run dev
```

클라이언트는 `http://localhost:5173`에서 실행됩니다.

## 환경 변수 설정

`homework-manager/.env` 파일을 수정합니다:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/homework-manager
JWT_SECRET=your_jwt_secret_key_change_this
```

## 프로젝트 구조

```
homework-manager/
├── server/                 # 백엔드
│   ├── models/            # MongoDB 모델
│   ├── routes/            # API 라우트
│   ├── middleware/        # 미들웨어 (인증 등)
│   └── index.js           # 서버 진입점
├── client/                 # 프론트엔드
│   ├── src/
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── services/      # API 서비스
│   │   ├── styles/        # CSS 파일
│   │   └── App.jsx        # 메인 앱 컴포넌트
│   └── package.json
└── package.json
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 숙제
- `POST /api/homework` - 숙제 생성 (선생님만)
- `GET /api/homework/academy/:academyId` - 숙제 목록 조회
- `PUT /api/homework/:id` - 숙제 수정
- `POST /api/homework/:id/submit` - 숙제 제출

## 역할 (Role)

- **student**: 숙제 조회 및 제출
- **teacher**: 숙제 생성 및 관리
- **parent**: 자녀의 숙제 조회

## 앞으로 추가할 기능

- [ ] 다중 학원 지원
- [ ] 댓글 및 피드백
- [ ] 알림 시스템
- [ ] 통계 대시보드
- [ ] 파일 업로드
- [ ] 모바일 앱
