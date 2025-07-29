// GitBook 시장 뉴스 크롤링/매칭/정제 AI용 샘플 코드
// 실제 서비스와 분리된 AI 실험/테스트용

export interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  language: string;
  summary: string;
  content: string;
  category?: string;
  isGeminiGenerated?: boolean;
}

// HTML 엔티티 디코딩 (간단 버전)
function decodeHtmlEntities(text: string): string {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// 헤드라인 유효성 검사 (안내/소개/섹션명/중복/불필요 키워드 제외)
function isValidHeadlineTitle(title: string): boolean {
  if (!title) return false;
  if (title.length < 5 || title.length > 60) return false;
  const exclude = [
    '목차', '페이지', '메뉴', '홈', 'login', 'signup', '검색', '설정',
    '오선', '라이브 리포트', '전일 요약', '실적 발표', '주요일정', '오늘의 소식',
    'greeting', 'news', 'summary', 'more', 'prev', 'next', '더보기'
  ];
  const lower = title.toLowerCase();
  for (const word of exclude) if (lower.includes(word)) return false;
  if (/^[0-9]+$/.test(title)) return false;
  if (/^[^\w가-힣]+$/.test(title)) return false;
  return true;
}

// 1. 헤드라인만 추출 (5~60자)
export function extractGitBookHeadlines(html: string, baseUrl: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const pattern = /<(span|li)[^>]*>([^<]{5,60})<\/\1>/gi;
  let match;
  const seen = new Set();
  while ((match = pattern.exec(html)) !== null) {
    let title = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    title = decodeHtmlEntities(title);
    if (!isValidHeadlineTitle(title)) continue;
    if (seen.has(title)) continue;
    seen.add(title);
    articles.push({
      title,
      url: baseUrl,
      publishedAt: new Date().toISOString(),
      source: '오선 (Osen)',
      language: 'kr',
      summary: '',
      content: '',
      category: 'headline',
      isGeminiGenerated: false
    });
  }
  return articles;
}

// 2. 본문만 추출 (60~500자)
export function extractDetailedNewsContent(html: string): { articles: {title: string, content: string, summary: string}[] } {
  const articles: {title: string, content: string, summary: string}[] = [];
  const pattern = /<(p|div)[^>]*>([^<]{60,500})<\/\1>/gi;
  let match;
  const seen = new Set();
  while ((match = pattern.exec(html)) !== null) {
    let content = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    content = decodeHtmlEntities(content);
    if (content.length < 60 || content.length > 500) continue;
    if (seen.has(content)) continue;
    seen.add(content);
    const title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    articles.push({ title, content, summary: content });
    if (articles.length >= 30) break;
  }
  return { articles };
}

// 3. 헤드라인-본문 쌍 매칭
export function matchHeadlinesWithContent(headlines: NewsArticle[], details: {title: string, content: string, summary: string}[]): NewsArticle[] {
  return headlines.map(headline => {
    let matched = details.find(d => headline.title.includes(d.title.substring(0, 10)) || d.title.includes(headline.title.substring(0, 10)));
    if (!matched && details.length > 0) matched = details[0];
    return {
      ...headline,
      summary: matched ? matched.summary : '',
      content: matched ? matched.content : ''
    };
  });
}

// 4. 전체 흐름 샘플 (최신 날짜, 크롤링, 매칭)
// 실제 fetch/날짜 판별은 서비스 코드에 맞게 구현 필요
export async function getGitBookLatestNewsAI(html: string, baseUrl: string): Promise<NewsArticle[]> {
  // 실제 서비스에서는 최신 날짜 URL/HTML을 받아와야 함
  const headlines = extractGitBookHeadlines(html, baseUrl);
  const { articles: details } = extractDetailedNewsContent(html);
  return matchHeadlinesWithContent(headlines, details);
} 