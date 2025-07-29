// GitBook 시장 뉴스 크롤링 - 청사진 방법론 적용
// h2 태그를 헤드라인으로, 그 다음 p/ul 태그들을 본문으로 정확히 매칭

import { JSDOM } from 'jsdom';

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
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// 헤드라인 유효성 검사 (안내/소개/섹션명/중복/불필요 키워드 제외)
function isValidHeadlineTitle(title: string): boolean {
  if (!title) return false;
  if (title.length < 5 || title.length > 200) return false;
  
  const exclude = [
    '목차', '페이지', '메뉴', '홈', 'login', 'signup', '검색', '설정',
    '오선', '라이브 리포트', '전일 요약', '실적 발표', '주요일정', '오늘의 소식',
    'greeting', 'news', 'summary', 'more', 'prev', 'next', '더보기'
  ];
  
  const lower = title.toLowerCase();
  for (const word of exclude) {
    if (lower.includes(word)) return false;
  }
  
  // 숫자만 있는 경우 제외
  if (/^[0-9]+$/.test(title)) return false;
  
  // 특수문자만 있는 경우 제외
  if (/^[^\w가-힣]+$/.test(title)) return false;
  
  return true;
}

// DOM 노드에서 텍스트 추출 (재귀적으로 모든 텍스트 노드 수집)
function extractTextFromNode(node: Node): string {
  if (node.nodeType === 3) { // Text node
    return node.textContent || '';
  }
  
  if (node.nodeType === 1) { // Element node
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    // script, style 태그는 제외
    if (tagName === 'script' || tagName === 'style') {
      return '';
    }
    
    let text = '';
    for (const child of Array.from(node.childNodes)) {
      text += extractTextFromNode(child);
    }
    
    // p, li 태그 뒤에는 줄바꿈 추가
    if (tagName === 'p' || tagName === 'li') {
      text += '\n';
    }
    
    return text;
  }
  
  return '';
}

// 청사진 방법론에 따른 핵심 파싱 로직 구현
export function parseGitBookNews(html: string, baseUrl: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // body 내의 모든 h2 태그 찾기
    const h2Elements = document.querySelectorAll('h2');
    
    h2Elements.forEach((h2: Element) => {
      // 헤드라인 텍스트 추출
      const headlineText = extractTextFromNode(h2).trim();
      const headline = decodeHtmlEntities(headlineText);
      
      if (!isValidHeadlineTitle(headline)) {
        return; // continue
      }
      
      // 본문 수집을 위한 버퍼
      let contentBuffer = '';
      
      // 현재 h2의 다음 형제 노드부터 순회
      let currentNode = h2.nextElementSibling;
      
      while (currentNode) {
        const tagName = currentNode.tagName.toLowerCase();
        
        // 다음 h2를 만나면 본문 수집 중단
        if (tagName === 'h2') {
          break;
        }
        
        // p, ul 태그인 경우 본문으로 수집
        if (tagName === 'p' || tagName === 'ul') {
          const text = extractTextFromNode(currentNode);
          if (text.trim()) {
            contentBuffer += text;
          }
        }
        
        // li 태그가 직접 형제로 있는 경우도 처리 (일부 HTML에서 발생)
        if (tagName === 'li') {
          const text = extractTextFromNode(currentNode);
          if (text.trim()) {
            contentBuffer += '• ' + text;
          }
        }
        
        currentNode = currentNode.nextElementSibling;
      }
      
      // 본문 정리
      const content = decodeHtmlEntities(contentBuffer.trim());
      
      // 본문이 없는 경우 헤드라인만이라도 저장
      const finalContent = content || headline;

    articles.push({
      title: headline,
      url: baseUrl,
      publishedAt: new Date().toISOString(),
      source: '오선 (Osen)',
      language: 'kr',
        summary: finalContent.substring(0, 200) + (finalContent.length > 200 ? '...' : ''),
        content: finalContent,
        category: 'market-news',
      isGeminiGenerated: false
      });
    });

  } catch (error) {
    console.error('GitBook 뉴스 파싱 오류:', error);
  }
  
  return articles;
}

// 메인 함수 - GitBook에서 최신 뉴스 추출
export async function extractGitBookNews(html: string, url: string): Promise<NewsArticle[]> {
  return parseGitBookNews(html, url);
}

// 월가의 말말말 관련 콘텐츠 필터링
export function filterWallStreetComments(articles: NewsArticle[]): {
  marketNews: NewsArticle[];
  wallStreetComments: NewsArticle[];
} {
  const marketNews: NewsArticle[] = [];
  const wallStreetComments: NewsArticle[] = [];
  
  articles.forEach(article => {
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();
    
    // 월가 관련 키워드 체크
    const wallStreetKeywords = ['월가', 'wall street', 'wallstreet', 'wsb', '월스트리트'];
    const isWallStreetRelated = wallStreetKeywords.some(keyword => 
      titleLower.includes(keyword) || contentLower.includes(keyword)
    );
    
    if (isWallStreetRelated) {
      wallStreetComments.push({
        ...article,
        category: 'wall-street-comments'
      });
    } else {
      marketNews.push(article);
    }
  });
  
  return { marketNews, wallStreetComments };
} 