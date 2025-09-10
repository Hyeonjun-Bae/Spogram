# Spogram 📸

Next.js로 만든 인스타그램 스타일 소셜 미디어 플랫폼

## 주요 기능

- 📱 **소셜 로그인**: GitHub OAuth를 통한 간편 로그인
- 📷 **이미지 업로드**: 드래그 앤 드롭으로 쉬운 사진 업로드
- ❤️ **좋아요 & 댓글**: 실시간 상호작용 기능
- 👥 **팔로우 시스템**: 사용자 간 팔로우/언팔로우
- 🔍 **실시간 검색**: 사용자 및 해시태그 검색
- 📱 **반응형 디자인**: 모바일 최적화 UI

## 기술 스택

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL, Prisma ORM
- **File Upload**: UploadThing
- **Authentication**: NextAuth.js (GitHub Provider)

## 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/spogram.git
cd spogram
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DATABASE_URL="your-postgresql-url"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### 4. 데이터베이스 설정
```bash
# Prisma 마이그레이션 실행
npx prisma generate
npx prisma db push

# (선택사항) Prisma Studio로 데이터베이스 확인
npx prisma studio
```

### 5. 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000에서 확인하세요!

## 프로젝트 구조

```
spogram/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── create/            # 게시글 작성 페이지
│   ├── profile/           # 프로필 관련 페이지
│   └── search/            # 검색 페이지
├── components/            # 재사용 가능한 컴포넌트
├── actions/               # 서버 액션 (데이터 처리)
├── lib/                   # 유틸리티 및 설정
├── prisma/                # 데이터베이스 스키마
└── public/                # 정적 파일
```

## 주요 컴포넌트

- **PostCard**: 게시글 카드 (좋아요, 댓글 기능 포함)
- **CommentSystem**: 댓글 작성 및 관리
- **FollowButton**: 팔로우/언팔로우 버튼
- **SearchInput**: 실시간 검색 입력창
- **ImageUpload**: 드래그 앤 드롭 이미지 업로드

## 데이터베이스 스키마

- **User**: 사용자 정보
- **Post**: 게시글 (이미지, 캡션)
- **Like**: 좋아요 관계
- **Comment**: 댓글
- **Follow**: 팔로우 관계

## 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버 실행
npm run lint      # 코드 린팅
```

## 환경 설정 가이드

### GitHub OAuth 설정
1. GitHub Settings > Developer settings > OAuth Apps
2. New OAuth App 생성
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### UploadThing 설정
1. [uploadthing.com](https://uploadthing.com) 가입
2. 새 앱 생성 후 API 키 복사

### PostgreSQL 설정
- 로컬: PostgreSQL 설치 후 데이터베이스 생성
- 클라우드: Supabase, Neon, PlanetScale 등 사용 가능

## 배포

### Vercel 배포 (권장)
1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 완료

### 기타 플랫폼
- Netlify, Railway, Render 등에서도 배포 가능

## 문제 해결

### 자주 발생하는 오류

**데이터베이스 연결 오류**
```bash
# 연결 테스트
node test-connection.js
```

**환경 변수 문제**
```bash
# 환경 변수 확인
node test-env.js
```

**Prisma 스키마 동기화**
```bash
npx prisma generate
npx prisma db push
```

## 개발자

- **이름**: [배현준]
- **이메일**: [bhj000712@gmail.com]
- **GitHub**: [Hyeonjun-Bae]

---
