# Supabase 권한 문제 해결 가이드

## 🚨 현재 문제
- MCP 사용자: `supabase_read_only_user` (읽기 전용)
- 테이블 생성 권한 없음: `permission denied for schema public`

## ✅ 해결 방법들

### 방법 1: Supabase 대시보드에서 직접 SQL 실행 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 방문
   - 프로젝트 `nzcsyflhkpcugbcewzcj` 선택

2. **SQL Editor 사용**
   - 좌측 메뉴에서 **"SQL Editor"** 클릭
   - **"New query"** 버튼 클릭
   - `ui_database_design.sql` 파일의 SQL 복사하여 붙여넣기
   - **"Run"** 버튼 클릭하여 실행

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (한 번만)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref nzcsyflhkpcugbcewzcj

# 마이그레이션 파일 생성
supabase migration new ui_tables

# 마이그레이션 적용
supabase db push
```

### 방법 3: 서비스 키 사용 (위험 - 프로덕션에서 사용 금지)

**⚠️ 주의**: 서비스 키는 모든 권한을 가지므로 개발 환경에서만 사용하세요.

1. Supabase 대시보드 → **Settings** → **API**
2. **service_role** 키 복사
3. MCP 설정에서 키 교체 (임시로만 사용)

### 방법 4: 권한 있는 사용자로 MCP 재연결

현재 MCP 연결을 확인해보겠습니다:

```bash
# MCP 상태 확인
curl -X GET "https://nzcsyflhkpcugbcewzcj.supabase.co/rest/v1/" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🎯 권장 방법: 대시보드 SQL Editor

**가장 안전하고 쉬운 방법**은 Supabase 대시보드의 SQL Editor를 사용하는 것입니다:

1. **단계별 실행**:
   ```sql
   -- 1단계: 뉴스 테이블
   -- (database_setup.sql 내용)
   
   -- 2단계: UI 테이블들
   -- (ui_database_design.sql 내용)
   ```

2. **실행 후 확인**:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

## 🔍 현재 MCP 권한 확인

MCP에서 현재 권한을 확인해보겠습니다. 