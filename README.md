# 🍳 Recipick - AI 기반 재료 맞춤형 레시피 추천 서비스

> **"냉장고 속 남은 재료, 고민하지 마세요. AI 셰프가 당신만을 위한 요리를 제안합니다."**

**Recipick**은 사용자가 가진 재료를 바탕으로 업스테이지(Upstage) Solar LLM과 구글 Gemini AI를 활용해 최적의 레시피를 생성하고 시각화해주는 스마트 요리 가이드 플랫폼입니다.

---

## ✨ 주요 기능 (Key Features)

### 1️⃣ 회원가입 및 아이디 찾기
*   안전한 사용자 인증 및 간편한 계정 관리
*   비밀번호 보안 저장 및 아이디 찾기 기능을 통한 사용자 편의성 제공
*   ![회원가입](./Recipe%20Recommendation/assets/01_auth.gif)

### 2️⃣ AI 레시피 추천 기능
*   보유 중인 재료와 선호도를 분석하여 최적의 요리법 제안
*   Upstage Solar LLM을 이용한 정교한 조리 단계 생성 및 Gemini 기반 음식 이미지 시퀀스 제공
*   ![AI추천](./Recipe%20Recommendation/assets/02_ai_recommend.gif)

### 3️⃣ 요리 필터 패널 기능
*   조리 시간, 난이도, 음식 카테고리별 맞춤 필터링
*   설거지 양, 야식 적합 여부 등 사용자 환경에 맞춘 세부 검색 기능
*   ![필터패널](./Recipe%20Recommendation/assets/03_filter_panel.gif)

### 4️⃣ 요리 상세 페이지 및 댓글 기능
*   상세한 조리 단계, 팁, 영양 성분 정보 제공
*   요리에 대한 만족도 별점 평가 및 유저 간 의견 공유를 위한 댓글 시스템
*   ![상세페이지](./Recipe%20Recommendation/assets/04_recipe_detail.gif)

### 5️⃣ 개인 레시피 등록 및 레시피 커뮤니티
*   나만의 특별한 레시피를 사진과 함께 등록 및 공유
*   커뮤니티를 통한 다른 유저들과의 레시피 소통 시스템
*   ![커뮤니티](./Recipe%20Recommendation/assets/05_community.gif)

### 6️⃣ 사용자 프로필 및 즐겨찾기 목록
*   개인별 맞춤 프로필 관리 및 활동 내역 확인
*   선호 레시피 보관함(즐겨찾기) 기능
*   ![프로필](./Recipe%20Recommendation/assets/06_profile_favorites.gif)

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **API Communication**: Axios

### Backend
- **Framework**: Django 4.2, Django REST Framework (DRF)
- **Database**: SQLite (Development)
- **AI Integration**: 
  - Upstage Solar API (Text Generation)
  - Google Gemini API (Image Generation)
- **Utilities**: python-dotenv, django-cors-headers

---

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론 & 의존성 설치
```bash
# Frontend
cd "Recipe Recommendation"
npm install

# Backend
# (필요 시 venv 활성화)
pip install -r requirements.txt
```

### 2. 환경 변수 설정
프로젝트 루트의 `.env.example` 파일을 복사하여 `.env` 파일을 생성하고 API 키를 입력하세요.

```bash
# ./Recipe Recommendation/.env
GEMINI_API_KEY=your_key_here
UPSTAGE_API_KEY=your_key_here
DJANGO_SECRET_KEY=your_secret_key
```

### 3. 서버 실행
```bash
# Frontend
npm run dev

# Backend
python manage.py run server
```

---

## 📁 폴더 구조 (Project Structure)

```text
Recipick/
├── Recipe Recommendation/
│   ├── src/                # React 소스 코드
│   │   ├── components/     # UI 컴포넌트
│   │   ├── utils/          # 공통 유틸리티 (normalizeRecipe 등)
│   │   └── api.ts          # API 통신 모듈
│   ├── backend_dj/         # Django 설정 폴더
│   ├── api/                # AI 및 핵심 비즈니스 로직 앱
│   ├── recipes/            # 레시피 데이터 및 모델 관리 앱
│   └── assets/             # README용 이미지 및 GIF 저장
└── .gitignore              # Git 제외 설정
```
