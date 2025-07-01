# 임시 Supabase Service Key 설정

## 🔑 Service Role 키 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard/project/nzcsyflhkpcugbcewzcj
   - **Settings** → **API** 메뉴 클릭

2. **Service Role 키 복사**
   - **Project API keys** 섹션에서
   - `service_role` 키 찾아서 **Copy** 클릭
   - 이 키는 모든 권한을 가지므로 조심스럽게 사용

## ⚠️ 보안 주의사항

- **개발 환경에서만 사용**
- **절대 GitHub에 커밋하지 말 것**
- **프로덕션에서는 anon 키 사용**
- **작업 완료 후 anon 키로 되돌릴 것**

## 🔧 MCP 설정 업데이트 필요

Service Role 키를 얻은 후:

1. **MCP 설정 파일 위치**: `C:\Users\Administrator\.cursor\mcp.json`
2. **Supabase 섹션 찾기**
3. **API 키 임시 교체**

또는 코드에서 직접 수정:
- `src/lib/supabase.ts` 파일의 `supabaseAnonKey` 값 임시 교체

## 📋 다음 단계

1. Service Role 키 획득
2. 키 임시 교체
3. 테이블 생성 실행
4. anon 키로 복구 