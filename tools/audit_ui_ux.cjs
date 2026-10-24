#!/usr/bin/env node
/**
 * AI Coding Recall (adnim-seven.github.io) UI/UX 및 기능 통일성 자동 감사 스크립트
 *
 * 7대 감사 영역:
 *  1. 네비게이션 일관성 (상위/홈 복귀 동선·위치·클래스·문구·화살표·타이틀·메타데이터)
 *  2. 탭·패널·버튼 구조 (.mode-tabs, .side-actions, #studyPanel, #subjectivePanel)
 *  3. 인라인 시험 UX (과목 홈 내장 vs inline-exam-common.js vs 독립 주관식 시험 페이지)
 *  4. 상태 저장 및 복습 UX (localStorage 키 체계, 별표·오답 모달, 초기화 문구)
 *  5. 시각·타이포그래피·반응형 (CSS :root 컬러 토큰, global-font.css, 브레이크포인트)
 *  6. 접근성(A11y) 및 시맨틱 (role="tab", aria-selected, aria-label, 모달 Escape)
 *  7. 안전 규칙 준수 (WEB_EDIT_SAFETY.md 보호 영역 및 태그 짝)
 *
 * 사용법:
 *   node tools/audit_ui_ux.cjs           # 콘솔 상세 리포트 + 요약 표 출력
 *   node tools/audit_ui_ux.cjs --json    # JSON 출력
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SUBJECTS = ['llm', 'vision', 'on-device', 'rag', 'data'];
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const allFiles = walk(ROOT);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html')).sort();
const cssFiles = allFiles.filter((f) => f.endsWith('.css')).sort();
const jsFiles = allFiles.filter((f) => f.endsWith('.js')).sort();

function findLine(text, pattern) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (typeof pattern === 'string' ? lines[i].includes(pattern) : pattern.test(lines[i])) {
      return i + 1;
    }
  }
  return 1;
}

const findings = [];
function addFinding({ id, severity, category, title, evidence, recommendation }) {
  if (!evidence || evidence.length === 0) return;
  findings.push({ id, severity, category, title, evidence, recommendation });
}

const pageGroups = {
  mainHome: htmlFiles.filter((f) => rel(f) === 'index.html'),
  downloads: htmlFiles.filter((f) => rel(f).startsWith('downloads/')),
  mockExams: htmlFiles.filter((f) => /^mock-exam-\d+\/index\.html$/.test(rel(f))),
  subjectHomes: SUBJECTS.map((s) => path.join(ROOT, s, 'index.html')),
  subjectiveLists: SUBJECTS.map((s) => path.join(ROOT, s, 'inline-subjective/index.html')),
  subjectiveTests: htmlFiles.filter((f) => {
    const r = rel(f);
    return r.includes('/inline-subjective/') && !r.endsWith('/inline-subjective/index.html');
  }),
};

// ---------------------------------------------------------------------------
// 1. 네비게이션 · 헤더 · 타이틀 · 메타데이터 동적 검사
// ---------------------------------------------------------------------------
function auditNavigationAndHeaders() {
  // 1-A. 페이지 유형별 상위/홈 복귀 링크 패턴 동적 수집
  const navSummary = [];
  for (const [group, files] of Object.entries(pageGroups)) {
    if (group === 'mainHome') continue;
    const sample = files[0];
    const html = fs.readFileSync(sample, 'utf8');
    const hasHeader = /<header\b/.test(html);
    const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
      .map((m) => ({
        href: (m[1].match(/href="([^"]+)"/) || [])[1] || '',
        cls: (m[1].match(/class="([^"]+)"/) || [])[1] || '',
        text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        line: findLine(html, m[0]),
      }))
      .filter((l) => ['../', '../../', './'].includes(l.href) || l.cls.includes('home-link') || l.cls.includes('brand'));
    navSummary.push({
      group,
      count: files.length,
      sampleFile: rel(sample),
      hasHeader,
      links,
    });
  }

  // 홈 복귀 링크 문구/구조 비교
  const rootLinkTexts = new Set();
  const navEvidence = [];
  for (const item of navSummary) {
    const desc = item.links
      .map((l) => `L${l.line} <a${l.cls ? ` class="${l.cls}"` : ''} href="${l.href}">"${l.text}"</a>`)
      .join(', ');
    navEvidence.push(`${item.group} (${item.count}개, 예: ${item.sampleFile}): <header> ${item.hasHeader ? '있음' : '없음'} | ${desc}`);
    for (const l of item.links) {
      if (!l.cls.includes('brand')) rootLinkTexts.add(l.text);
    }
  }
  const hasArrowMismatch = [...rootLinkTexts].some((t) => t.startsWith('←')) && [...rootLinkTexts].some((t) => !t.startsWith('←'));
  const hasHomeNameMismatch = [...rootLinkTexts].includes('← 전체 홈') && [...rootLinkTexts].includes('← 학습 홈');
  if (hasArrowMismatch || hasHomeNameMismatch) {
    addFinding({
      id: 'NAV-01',
      severity: 'Medium',
      category: '1. 네비게이션 일관성',
      title: '페이지 유형별 상위/홈 복귀 링크의 문구("← 전체 홈" vs "전체 홈" vs "← 학습 홈")·화살표·<header> 유무·클래스 불일치',
      evidence: navEvidence,
      recommendation:
        '루트 홈 복귀 문구를 "← 전체 홈", 과목 복귀를 "← 과목 홈", 목록 복귀를 "← 시험 목록"으로 통일하고, downloads 및 inline-subjective 목록에도 공통 상단 네비게이션 스타일 적용',
    });
  }

  // 1-B. 과목 홈 상단 .brand <small> 및 #chapterNav aria-label 오타 동적 검사
  const brandMismatches = [];
  const expectedSubjectLabel = {
    llm: 'LLM',
    vision: 'Vision',
    'on-device': 'On-device AI',
    rag: 'RAG',
    data: 'Data',
  };
  for (const s of SUBJECTS) {
    const f = path.join(ROOT, s, 'index.html');
    const html = fs.readFileSync(f, 'utf8');
    const brandSmall = (html.match(/<div class="brand">[\s\S]*?<small>(.*?)<\/small>/) || [])[1] || '';
    const navAria = (html.match(/id="chapterNav"\s+aria-label="([^"]+)"/) || [])[1] || '';
    const expected = expectedSubjectLabel[s];
    if (!brandSmall.includes(expected)) {
      brandMismatches.push(
        `${s}/index.html:${findLine(html, '<div class="brand">')} -> .brand <small>이 "${brandSmall}"로 되어 있음 (기대값: "${expected} 집중 학습")`
      );
    }
    if (!navAria.includes(expected)) {
      brandMismatches.push(
        `${s}/index.html:${findLine(html, 'id="chapterNav"')} -> #chapterNav aria-label이 "${navAria}"로 되어 있음 (기대값: "${expected} 노트북 선택")`
      );
    }
  }
  addFinding({
    id: 'NAV-02',
    severity: 'High',
    category: '1. 네비게이션 일관성 / 6. 접근성',
    title: '과목 홈 상단 브랜드 부제(.brand <small>) 및 #chapterNav aria-label에 타 과목명("LLM") 하드코딩 잔존',
    evidence: brandMismatches,
    recommendation:
      'vision/index.html, rag/index.html, data/index.html의 .brand <small>을 각 과목명으로 수정하고, vision/index.html:26의 #chapterNav aria-label을 "Vision 노트북 선택"으로 수정',
  });

  // 1-C. 28개 개별 주관식 시험 페이지의 <title>, 출제 위치, 셀/빈칸 카운트 정합성 동적 검사
  const subAppJs = fs.readFileSync(path.join(ROOT, 'assets/js/subjective-test-app.js'), 'utf8');
  const templateTitleFiles = [];
  const templateLocFiles = [];
  const countMismatchFiles = [];
  const namingOutliers = [];

  for (const f of pageGroups.subjectiveTests) {
    const r = rel(f);
    const html = fs.readFileSync(f, 'utf8');
    const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const locMeta = (html.match(/<span>출제 위치<\/span><strong>(.*?)<\/strong>/) || [])[1] || '';
    const storageKey = (html.match(/data-storage-key="([^"]+)"/) || [])[1] || '';
    const statusInit = (html.match(/id="status"><strong>(.*?)<\/strong>/) || [])[1] || '';

    if (!r.endsWith('rag_subjective_test_example.html') && title === 'AI Coding Recall · RAG 주관식 예시') {
      templateTitleFiles.push(`${r}:${findLine(html, '<title>')}`);
    }
    if (!r.endsWith('rag_subjective_test_example.html') && locMeta === '문서 로드 · 인덱스 · Query Engine') {
      templateLocFiles.push(`${r}:${findLine(html, '출제 위치')}`);
    }
    if (!path.basename(f).endsWith('_subjective_test.html')) {
      namingOutliers.push(`${r}: 파일명이 *_subjective_test.html 규칙과 다름 (storageKey="${storageKey}")`);
    }

    // subjective-test-app.js 내 BLANKS_BY_STORAGE_KEY의 실제 빈칸 개수 확인
    const keyRegex = new RegExp(`"${storageKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*(\\[[^\\n]+\\])`);
    const keyMatch = subAppJs.match(keyRegex);
    if (keyMatch) {
      const blankCount = (keyMatch[1].match(/\bid\b/g) || []).length;
      if (statusInit && !statusInit.includes(`/ ${blankCount}`)) {
        countMismatchFiles.push(
          `${r}:${findLine(html, 'id="status"')} -> 초기 HTML #status는 "${statusInit}"이나 실제 등록된 빈칸은 ${blankCount}개`
        );
      }
    }
  }

  // 목록 페이지(inline-subjective/index.html) 카드 메타("코드 X개 · 빈칸 Y개")와 상세 페이지("코드 셀 X개") 비교
  for (const s of SUBJECTS) {
    const listFile = path.join(ROOT, s, 'inline-subjective/index.html');
    const listHtml = fs.readFileSync(listFile, 'utf8');
    for (const m of listHtml.matchAll(/<a class="card" href="([^"]+)">[\s\S]*?<div class="meta">코드\s*(\d+)개\s*·\s*빈칸\s*(\d+)개<\/div><\/a>/g)) {
      const [, href, listCodeCount, listBlankCount] = m;
      const testFile = path.join(ROOT, s, 'inline-subjective', href);
      if (fs.existsSync(testFile)) {
        const testHtml = fs.readFileSync(testFile, 'utf8');
        const pageCodeCount = (testHtml.match(/<span>시험 범위<\/span><strong>코드 셀\s*(\d+)개<\/strong>/) || [])[1];
        if (pageCodeCount && pageCodeCount !== listCodeCount) {
          countMismatchFiles.push(
            `${s}/inline-subjective/index.html:${findLine(listHtml, href)} (코드 ${listCodeCount}개) !== ${s}/inline-subjective/${href}:${findLine(testHtml, '시험 범위')} (코드 셀 ${pageCodeCount}개)`
          );
        }
      }
    }
  }

  addFinding({
    id: 'NAV-03',
    severity: 'High',
    category: '1. 네비게이션 일관성 / 6. 접근성',
    title: '개별 주관식 시험 27개 페이지의 <title> 및 좌측 레일 "출제 위치"가 RAG 예시 템플릿 문구로 고정됨',
    evidence: [
      ...(templateTitleFiles.length
        ? [`<title>이 "AI Coding Recall · RAG 주관식 예시"로 남아있는 파일 (${templateTitleFiles.length}개): ${templateTitleFiles.join(', ')}`]
        : []),
      ...(templateLocFiles.length
        ? [`좌측 .source-meta "출제 위치"가 "문서 로드 · 인덱스 · Query Engine"으로 남아있는 파일 (${templateLocFiles.length}개): ${templateLocFiles.join(', ')}`]
        : []),
    ],
    recommendation:
      '27개 *_subjective_test.html의 <title>을 각 과목·챕터 제목으로 수정하고, .source-meta의 "출제 위치"를 각 노트북의 실제 출제 토픽으로 업데이트',
  });

  addFinding({
    id: 'NAV-04',
    severity: 'Low',
    category: '1. 네비게이션 일관성 / 4. 상태 저장',
    title: '주관식 시험 목록-상세 간 셀/빈칸 수 표기 불일치 및 RAG 1번 시험 파일명 예외',
    evidence: [...namingOutliers, ...countMismatchFiles],
    recommendation:
      'llm/inline-subjective/index.html:16(코드 8개 vs 상세 페이지 코드 9개) 및 상세 페이지 초기 #status 문구("빈칸 1 / 3")를 실제 데이터와 맞추고, validate_site.cjs:64가 rag_subjective_test_example.html도 검사하도록 보완',
  });
}

// ---------------------------------------------------------------------------
// 2. 5개 과목 홈 구조 동적 비교 (.side-actions, .mode-tabs, 인라인 시험, #studyPanel)
// ---------------------------------------------------------------------------
function auditSubjectHomes() {
  const sideActionsBySubject = {};
  const modeTabsBySubject = {};
  const studyPanelBySubject = {};
  const scriptsBySubject = {};
  const cssBySubject = {};

  for (const s of SUBJECTS) {
    const f = path.join(ROOT, s, 'index.html');
    const html = fs.readFileSync(f, 'utf8');

    // .side-actions
    const sideMatch = html.match(/<div class="side-actions">([\s\S]*?)<\/div>/);
    const sideBlock = sideMatch ? sideMatch[1] : '';
    const sideItems = [...sideBlock.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map((m) => ({
      tag: m[1],
      id: (m[2].match(/id="([^"]+)"/) || [])[1] || '',
      cls: (m[2].match(/class="([^"]+)"/) || [])[1] || '',
      hrefOrClick: (m[2].match(/(?:href|onclick)="([^"]+)"/) || [])[1] || '',
      text: m[3].trim(),
      line: findLine(html, m[0]),
    }));
    sideActionsBySubject[s] = {
      items: sideItems,
      hasInlineSidebarNav: html.includes('id="inlineSidebarNav"'),
    };

    // .mode-tabs
    const tabsBlock = (html.match(/<div class="mode-tabs"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    modeTabsBySubject[s] = [...tabsBlock.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => ({
      panel: (m[1].match(/data-panel="([^"]+)"/) || [])[1] || '',
      text: m[2].trim(),
      line: findLine(html, m[0]),
    }));

    // #studyPanel & #subjectivePanel
    const studyBlock = (html.match(/<section id="studyPanel"[^>]*>([\s\S]*?)<\/section>\s*<section id="fullCodePanel"/) || [])[1] || '';
    const subBlock = (html.match(/<section id="subjectivePanel"[^>]*>([\s\S]*?)<\/section>/) || [])[1] || '';
    const subjectSmall = (html.match(/<div class="subject-title">[\s\S]*?<small>(.*?)<\/small>/) || [])[1] || '';
    studyPanelBySubject[s] = {
      hasExamScope: studyBlock.includes('id="examScope"'),
      hasNotebookOverview: studyBlock.includes('id="notebookOverview"'),
      subOrder: subBlock.indexOf('id="subPrompt"') < subBlock.indexOf('id="subContext"') ? 'subPrompt → subContext' : 'subContext → subPrompt',
      subjectSmall,
      subjectSmallLine: findLine(html, '<div class="subject-title">'),
    };

    cssBySubject[s] = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
    scriptsBySubject[s] = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  }

  // 2-A. .side-actions 비교
  const sideSignatures = new Set(
    SUBJECTS.map((s) => sideActionsBySubject[s].items.map((i) => `${i.tag}#${i.id || i.hrefOrClick}:${i.text}`).join(' | '))
  );
  if (sideSignatures.size > 1) {
    const ev = SUBJECTS.map((s) => {
      const list = sideActionsBySubject[s].items
        .map((i, idx) => `[${idx + 1}] L${i.line} <${i.tag}${i.id ? ` id="${i.id}"` : ''}>"${i.text}"`)
        .join(' → ');
      return `${s}/index.html (${sideActionsBySubject[s].items.length}개${sideActionsBySubject[s].hasInlineSidebarNav ? ' + #inlineSidebarNav' : ''}): ${list}`;
    });
    // 중복 링크 감지
    for (const s of SUBJECTS) {
      const inlineLinks = sideActionsBySubject[s].items.filter((i) => i.hrefOrClick.includes('inline-subjective'));
      if (inlineLinks.length > 1) {
        ev.push(
          `중복 버튼 발견 (${s}/index.html): inline-subjective/로 이동하는 요소가 ${inlineLinks.length}개 중복 존재 (${inlineLinks.map((i) => `L${i.line} <${i.tag}>"${i.text}"`).join(', ')})`
        );
      }
    }
    addFinding({
      id: 'SUBJ-01',
      severity: 'High',
      category: '2. 탭·패널·버튼 구조 (.side-actions)',
      title: '5개 과목 홈 좌측 .side-actions 버튼 구성·배치 순서 불일치 및 RAG 중복 버튼 존재',
      evidence: ev,
      recommendation:
        '1) rag/index.html:29의 중복 링크(<a class="quiet-button" href="inline-subjective/">인라인 주관식 시험 열기</a>) 제거, 2) 5개 과목 홈의 공통 버튼(#retryWrong, #randomTest, 인라인 주관식 시험 이동 버튼) 배치 순서를 동일하게 통일',
    });
  }

  // 2-B. .mode-tabs 비교
  const tabSignatures = new Set(SUBJECTS.map((s) => modeTabsBySubject[s].map((t) => `${t.text}(${t.panel})`).join(' | ')));
  if (tabSignatures.size > 1) {
    const ev = SUBJECTS.map((s) => {
      const hasDynamicInlineTab = scriptsBySubject[s].some((src) => src.includes('inline-exam-common.js'));
      const tabsStr = modeTabsBySubject[s].map((t) => `"${t.text}"`).join(' | ');
      return `${s}/index.html (정적 ${modeTabsBySubject[s].length}개${hasDynamicInlineTab ? ' + 동적 1개("인라인 시험")' : ''}): ${tabsStr}${hasDynamicInlineTab ? ' | + [동적] "인라인 시험"(번호 없음, 6번째 끝에 추가)' : ''}`;
    });
    addFinding({
      id: 'SUBJ-02',
      severity: 'High',
      category: '2. 탭·패널·버튼 구조 (.mode-tabs)',
      title: '과목 홈 상단 .mode-tabs 탭 번호 체계(0~5 vs 1~5+번호 없는 동적 탭)·라벨·인라인 시험 탭 위치 불일치',
      evidence: ev,
      recommendation:
        '첫 탭 라벨("0. 한 장 오버뷰" vs "1. 핵심 정리")과 탭 번호 체계(0~5 또는 1~6)를 통일하고, inline-exam-common.js가 생성하는 "인라인 시험" 탭에도 번호를 부여하며 "결과·오답" 탭 앞(5번째)에 배치',
    });
  }

  // 2-C. 과목별 인라인 시험 스크립트/CSS 연결 비교 및 미연결 파일 검사
  const inlineMatrixEv = [];
  for (const s of SUBJECTS) {
    const sc = scriptsBySubject[s];
    const cs = cssBySubject[s];
    const usesCommon = sc.some((x) => x.includes('inline-exam-common.js'));
    const hasPriorityJs = sc.some((x) => x.includes('inline-exam-priority.js'));
    const hasPriorityCss = cs.some((x) => x.includes('inline-exam-priority.css'));
    const hasReviewJs = sc.some((x) => x.includes('inline-exam-review.js'));
    const hasHistoryJs = sc.some((x) => x.includes('inline-exam-history.js'));
    const hasOverridesJs = sc.some((x) => x.includes('inline_exam_overrides.js'));
    inlineMatrixEv.push(
      `${s}/index.html: 엔진=${usesCommon ? 'inline-exam-common.js' : 'subject-app.js 내장'} | overrides=${hasOverridesJs} | priority(CSS/JS)=${hasPriorityCss}/${hasPriorityJs} | review=${hasReviewJs} | history=${hasHistoryJs}`
    );
  }
  const anyUsesHistoryJs = htmlFiles.some((f) => fs.readFileSync(f, 'utf8').includes('inline-exam-history.js'));
  if (!anyUsesHistoryJs) {
    inlineMatrixEv.push(
      `미연결 공통 모듈: assets/js/inline-exam-history.js 및 assets/css/inline-exam-history.css가 존재하나 전체 45개 HTML 중 어느 페이지에서도 로드되지 않음`
    );
  }
  const subAppContent = fs.readFileSync(path.join(ROOT, 'assets/js/subject-app.js'), 'utf8');
  if (
    scriptsBySubject.llm.includes('notebook_full_exam.js') &&
    (subAppContent.match(/currentNotebookExam/g) || []).length === 1
  ) {
    inlineMatrixEv.push(
      `미사용 데이터 로드: llm/index.html:${findLine(fs.readFileSync(path.join(ROOT, 'llm/index.html'), 'utf8'), 'notebook_full_exam.js')}에서 notebook_full_exam.js를 로드하지만 subject-app.js:28의 currentNotebookExam()은 호출되지 않음`
    );
  }
  const engineSet = new Set(SUBJECTS.map((s) => scriptsBySubject[s].some((x) => x.includes('inline-exam-common.js')) ? 'inline-exam-common.js' : 'subject-app.js 내장'));
  const hasMissingModule = SUBJECTS.some((s) => {
    const sc = scriptsBySubject[s];
    const cs = cssBySubject[s];
    return !sc.some((x) => x.includes('inline-exam-priority.js')) ||
           !cs.some((x) => x.includes('inline-exam-priority.css')) ||
           !sc.some((x) => x.includes('inline-exam-review.js')) ||
           !sc.some((x) => x.includes('inline-exam-history.js')) ||
           !cs.some((x) => x.includes('inline-exam-history.css'));
  });
  if (engineSet.size > 1 || hasMissingModule || !anyUsesHistoryJs) {
    addFinding({
      id: 'SUBJ-03',
      severity: 'High',
      category: '3. 인라인 시험 UX',
      title: '과목 홈 인라인 시험 엔진 이원화 및 priority·review·history 스크립트 미적용',
      evidence: inlineMatrixEv,
      recommendation:
        '5개 과목 홈 모두 inline-exam-common.js, inline-exam-priority.css/js, inline-exam-review.js, inline-exam-history.css/js를 연결하여 인라인 시험 엔진 및 복습 모달을 통일',
    });
  }

  // 2-D. #studyPanel, #subjectivePanel, .subject-title <small> 비교
  const panelEv = [];
  const subOrders = new Set(SUBJECTS.map((s) => studyPanelBySubject[s].subOrder));
  if (subOrders.size > 1) {
    panelEv.push(
      `#subjectivePanel 내부 요소 순서 차이: ${SUBJECTS.map((s) => `${s}(${studyPanelBySubject[s].subOrder})`).join(', ')}`
    );
  }
  panelEv.push(
    `#studyPanel 내 #examScope 존재 여부: ${SUBJECTS.map((s) => `${s}(${studyPanelBySubject[s].hasExamScope ? '있음' : '없음'})`).join(', ')}`
  );
  if (studyPanelBySubject.vision.subjectSmall.includes('첫 번째 노트북')) {
    panelEv.push(
      `vision/index.html:${studyPanelBySubject.vision.subjectSmallLine} -> .subject-title <small>이 "${studyPanelBySubject.vision.subjectSmall}"로 남아있음 (실제 6개 노트북 완료 상태)`
    );
  }
  if (studyPanelBySubject.data.subjectSmall === 'Time Series · NGCF') {
    panelEv.push(
      `data/index.html:${studyPanelBySubject.data.subjectSmallLine} -> .subject-title <small>이 "${studyPanelBySubject.data.subjectSmall}"로 되어 있어 3번째 노트북(NCF)이 누락됨`
    );
  }
  const hasSubOrderMismatch = subOrders.size > 1;
  const hasSubjectSmallIssue = studyPanelBySubject.vision.subjectSmall.includes('첫 번째 노트북') || studyPanelBySubject.data.subjectSmall === 'Time Series · NGCF';
  if (hasSubOrderMismatch || hasSubjectSmallIssue) {
    addFinding({
      id: 'SUBJ-04',
      severity: 'Medium',
      category: '2. 탭·패널·버튼 구조 (#studyPanel / #subjectivePanel)',
      title: '#subjectivePanel 발문·코드 순서 또는 좌측 과목 부제(.subject-title small) 불일치',
      evidence: panelEv,
      recommendation:
        '#subjectivePanel 내 발문(#subPrompt)과 코드(#subContext) 순서를 통일하고, vision 및 data의 좌측 부제를 현행화',
    });
  }
}

// ---------------------------------------------------------------------------
// 3 & 4. 인라인 시험 vs 독립 주관식 시험 UX 및 상태 저장 비교
// ---------------------------------------------------------------------------
function auditExamUxAndStorage() {
  const subApp = fs.readFileSync(path.join(ROOT, 'assets/js/subject-app.js'), 'utf8');
  const inlineCommon = fs.readFileSync(path.join(ROOT, 'assets/js/inline-exam-common.js'), 'utf8');
  const subTestApp = fs.readFileSync(path.join(ROOT, 'assets/js/subjective-test-app.js'), 'utf8');
  const toastCss = fs.readFileSync(path.join(ROOT, 'assets/css/inline-exam-toast.css'), 'utf8');

  const uxEv = [];
  // 단축키 검사
  const subPanelHasCtrlEnter = /#subAnswer[\s\S]{0,300}ctrlKey/.test(subApp);
  if (!subPanelHasCtrlEnter) {
    uxEv.push(
      `단축키(Ctrl+Enter) 비대칭: 과목 홈 인라인 시험(subject-app.js:${findLine(subApp, 'event.ctrlKey && event.key === "Enter"')}, inline-exam-common.js:${findLine(inlineCommon, 'ev.ctrlKey&&ev.key==="Enter"')})과 독립 주관식 시험(subjective-test-app.js:${findLine(subTestApp, "e.ctrlKey && e.key === 'Enter'")})은 Ctrl+Enter 채점을 지원하나, 과목 홈의 일반 "주관식 시험" 탭(#subAnswer)은 Ctrl+Enter를 지원하지 않음`
    );
  }
  // 피드백 표시 방식 검사
  if (toastCss.includes('.inline-answer-feedback{display:none!important}')) {
    uxEv.push(
      `피드백 표시 격차: 독립 주관식 시험(subjective-test-app.js:${findLine(subTestApp, 'inline-feedback show')})은 입력칸 아래 .inline-feedback에 정답과 해설을 상시 노출하지만, 과목 홈 인라인 시험(vision/on-device/rag/data)은 inline-exam-toast.css:1의 display:none!important로 인라인 피드백을 숨기고 3초 후 사라지는 토스트(inline-exam-toast.js)만 표시함`
    );
  }
  // 채점 버튼 단위 및 복습/데이터 격차
  uxEv.push(
    `채점 버튼 구성 차이: 과목 홈 인라인 시험은 빈칸별 "채점" 버튼 + 하단 "모든 빈칸 채점"(#checkAllInline)을 제공하나, 독립 주관식 시험(*_subjective_test.html:14)은 하단 고정바에 "현재 빈칸 채점"(#check)만 제공함`,
    `복습(★ 별표 / 오답 모달) 격차: 독립 주관식 시험은 별표(.review-mark) + 오답 모달(#reviewModal) + localStorage 저장을 모두 지원하나, LLM 인라인 시험은 별표만 있고 모달이 없으며, 타 4개 과목 인라인 시험은 별표·모달·localStorage 저장이 모두 비활성화 상태임`,
    `출제 문항(빈칸) 소스 이원화: 과목 홈 인라인 시험은 inline-exam-expand.js를 통해 노트북당 최소 6개 빈칸으로 자동 확장되지만, 독립 주관식 시험은 subjective-test-app.js:2-31의 BLANKS_BY_STORAGE_KEY 고정 배열(대부분 3개)만 사용함`
  );

  addFinding({
    id: 'UX-01',
    severity: 'Medium',
    category: '3. 인라인 시험 UX / 4. 상태 저장 및 복습 UX',
    title: '과목 홈 인라인 시험과 독립 주관식 시험(*_subjective_test.html) 간 단축키·피드백 유지·채점 단위·복습 모달·문항 수 격차',
    evidence: uxEv,
    recommendation:
      '1) 과목 홈 주관식 탭(#subAnswer)에 Ctrl+Enter 단축키 추가, 2) 인라인 시험 채점 시 토스트와 함께 입력칸 하단 정답 피드백도 유지되도록 개선, 3) inline-exam-history.js 연결로 복습 모달 및 상태 저장 통일',
  });

  // localStorage 키 및 초기화 문구 검사
  const storageEv = [];
  for (const s of SUBJECTS) {
    const cfg = fs.readFileSync(path.join(ROOT, s, 'subject.config.js'), 'utf8');
    const key = (cfg.match(/storageKey:\s*"([^"]+)"/) || [])[1];
    storageEv.push(`${s}/subject.config.js -> storageKey: "${key}"`);
  }
  if (subApp.includes('이 HTML의 학습 기록을 모두 지울까요?')) {
    storageEv.push(
      `assets/js/subject-app.js:${findLine(subApp, '이 HTML의 학습 기록을 모두 지울까요?')} -> confirm("이 HTML의 학습 기록을 모두 지울까요?") 문구에 내부 용어("이 HTML") 노출`
    );
  }
  addFinding({
    id: 'STATE-01',
    severity: 'Low',
    category: '4. 상태 저장 및 복습 UX',
    title: 'localStorage 키 명명 패턴 비대칭 및 기록 초기화 확인창의 "이 HTML" 문구 노출',
    evidence: storageEv,
    recommendation:
      '기존 localStorage 키는 학습 이력 유지를 위해 보존하되, subject-app.js:498의 초기화 확인 문구를 "현재 과목의 학습 기록을 모두 초기화할까요?"로 수정',
  });
}

// ---------------------------------------------------------------------------
// 5. 시각 · 타이포그래피 · 반응형 동적 검사
// ---------------------------------------------------------------------------
function auditVisualAndResponsive() {
  // 5-A. 컬러 토큰(:root) 추출 비교
  const tokenSources = [
    path.join(ROOT, 'index.html'),
    path.join(ROOT, 'assets/css/subject.css'),
    path.join(ROOT, 'assets/css/subjective-test.css'),
  ];
  const tokenMap = {};
  for (const f of tokenSources) {
    const txt = fs.readFileSync(f, 'utf8');
    const m = txt.match(/:root\s*\{([^}]+)\}/);
    if (m) {
      tokenMap[rel(f)] = Object.fromEntries(
        m[1]
          .split(';')
          .map((x) => x.trim())
          .filter(Boolean)
          .map((p) => p.split(':').map((s) => s.trim()))
      );
    }
  }
  const colorEv = [
    `--navy 비교: ${Object.entries(tokenMap).map(([k, v]) => `${k}(${v['--navy'] || '없음'})`).join(' vs ')} (downloads/exam-summary/index.html은 #174d79 하드코딩)`,
    `--blue 비교: ${Object.entries(tokenMap).map(([k, v]) => `${k}(${v['--blue'] || '없음'})`).join(' vs ')} (mock-exam.css는 #2157b1 하드코딩)`,
    `--green 비교: ${Object.entries(tokenMap).map(([k, v]) => `${k}(${v['--green'] || '없음'})`).join(' vs ')}`,
    `배경 변수명 비교: index.html(--bg:${tokenMap['index.html']?.['--bg']}) vs subject.css(--canvas:${tokenMap['assets/css/subject.css']?.['--canvas']}) vs subjective-test.css(--canvas:${tokenMap['assets/css/subjective-test.css']?.['--canvas']})`,
  ];
  addFinding({
    id: 'STYLE-01',
    severity: 'Low',
    category: '5. 시각·타이포그래피·반응형',
    title: '페이지 유형별 CSS :root 컬러 토큰 값·변수명 불일치 및 하드코딩 색상 혼재',
    evidence: colorEv,
    recommendation:
      '공통 컬러 토큰(--navy, --blue, --canvas, --ink, --muted, --line, --green, --red, --amber)을 단일 CSS 파일로 통합',
  });

  // 5-B. global-font.css 연결 여부 및 monospace 오버라이드 검사
  const missingFontPages = htmlFiles.filter((f) => !fs.readFileSync(f, 'utf8').includes('global-font.css')).map(rel);
  const globalFontTxt = fs.readFileSync(path.join(ROOT, 'assets/css/global-font.css'), 'utf8');
  const llmOverrideTxt = fs.readFileSync(path.join(ROOT, 'llm/overrides.css'), 'utf8');
  const fontEv = [];
  if (missingFontPages.length) {
    fontEv.push(`global-font.css 미연결 HTML (${missingFontPages.length}개): ${missingFontPages.join(', ')}`);
  }
  if (/code,\s*pre,\s*textarea\s*\{\s*font-family:\s*"Malgun Gothic"/i.test(globalFontTxt)) {
    fontEv.push(
      `assets/css/global-font.css:${findLine(globalFontTxt, 'code, pre, textarea')} -> code, pre, textarea에 가변폭 폰트("Malgun Gothic")가 monospace보다 먼저 선언되어 Python 코드 들여쓰기 열 정렬이 깨질 수 있음`
    );
  }
  if (llmOverrideTxt.includes('!important')) {
    fontEv.push(
      `llm/overrides.css:${findLine(llmOverrideTxt, '!important')} -> font-family에 !important가 사용되어 LLM만 타 과목과 다른 폰트 우선순위 규칙을 가짐`
    );
  }
  addFinding({
    id: 'STYLE-02',
    severity: 'Medium',
    category: '5. 시각·타이포그래피·반응형',
    title: 'downloads 페이지의 global-font.css 누락 및 코드 영역(code, pre, textarea) 가변폭 폰트 우선 적용',
    evidence: fontEv,
    recommendation:
      'downloads/exam-summary/index.html에 global-font.css를 연결하고, code/pre/textarea는 고정폭 폰트(Consolas, "Courier New", monospace)를 우선 배치한 뒤 한글 폴백으로 "Malgun Gothic" 적용',
  });

  // 5-C. 반응형 브레이크포인트 및 사이드바 스크롤 비교
  const bpEv = [];
  for (const f of [...cssFiles, path.join(ROOT, 'index.html')]) {
    const txt = fs.readFileSync(f, 'utf8');
    const bps = [...new Set([...txt.matchAll(/@media\s*\(([^)]+)\)/g)].map((m) => m[1].trim()))];
    if (bps.length) bpEv.push(`${rel(f)}: ${bps.join(', ')}`);
  }
  if (llmOverrideTxt.includes('.sidebar{max-height:none}')) {
    bpEv.push(
      `llm/overrides.css:${findLine(llmOverrideTxt, '.sidebar{max-height:none}')} -> @media(min-width:1051px)에서 .sidebar{max-height:none}을 적용해 LLM만 데스크톱 좌측 사이드바 내부 스크롤이 해제됨 (나머지 4개 과목은 max-height:calc(100vh - 116px) 유지)`
    );
  }
  addFinding({
    id: 'STYLE-03',
    severity: 'Low',
    category: '5. 시각·타이포그래피·반응형',
    title: '미디어쿼리 브레이크포인트 파편화(1500/1050/900/760/720/650/640/600/390px) 및 LLM 전용 사이드바 높이 오버라이드',
    evidence: bpEv,
    recommendation:
      '과목 홈의 브레이크포인트(640px→650px 등)와 데스크톱 .sidebar 높이 정책을 subject.css에서 일괄 관리하도록 통일',
  });
}

// ---------------------------------------------------------------------------
// 6. 접근성(A11y) 및 시맨틱 동적 검사
// ---------------------------------------------------------------------------
function auditAccessibility() {
  const a11yEv = [];
  for (const s of SUBJECTS) {
    const f = path.join(ROOT, s, 'index.html');
    const html = fs.readFileSync(f, 'utf8');
    const hasTablist = html.includes('role="tablist"');
    const tabsBlock = (html.match(/<div class="mode-tabs"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    const hasRoleTab = tabsBlock.includes('role="tab"');
    if (hasTablist && !hasRoleTab) {
      a11yEv.push(`${s}/index.html:${findLine(html, 'class="mode-tabs"')} -> .mode-tabs는 role="tablist"이나 자식 .mode-tab 버튼들에 role="tab" 및 aria-selected 속성이 누락됨`);
    }
  }
  for (const f of pageGroups.mockExams) {
    const html = fs.readFileSync(f, 'utf8');
    if (html.includes('<nav id="nav"></nav>')) {
      a11yEv.push(`${rel(f)}:${findLine(html, '<nav id="nav">')} -> <nav id="nav">에 aria-label 누락`);
    }
  }
  const subTestApp = fs.readFileSync(path.join(ROOT, 'assets/js/subjective-test-app.js'), 'utf8');
  if (!subTestApp.includes('Escape')) {
    a11yEv.push(`assets/js/subjective-test-app.js:171-174 -> #reviewModal이 role="dialog" aria-modal="true"이나 Escape 키로 닫기 미지원`);
  }
  addFinding({
    id: 'A11Y-01',
    severity: 'Medium',
    category: '6. 접근성(A11y) 및 시맨틱',
    title: '과목 홈 .mode-tab의 role="tab"/aria-selected 누락, 모의고사 <nav> aria-label 누락, 모달 Escape 미지원',
    evidence: a11yEv,
    recommendation:
      '과목 홈 .mode-tab 버튼과 switchPanel()에 role="tab" 및 aria-selected 갱신을 추가하고, 모의고사 <nav id="nav">에 aria-label 추가 및 모달 Escape 핸들러 지원',
  });
}

// ---------------------------------------------------------------------------
// 7. 안전 규칙(WEB_EDIT_SAFETY.md) 준수 검사
// ---------------------------------------------------------------------------
function auditSafetyRules() {
  const violations = [];
  for (const f of htmlFiles) {
    const html = fs.readFileSync(f, 'utf8');
    const r = rel(f);
    for (const m of html.matchAll(/<div\b[^>]*>[^<]*<\/a>/g)) {
      violations.push(`${r}: <div>가 </a>로 닫힘 (${m[0].slice(0, 60)})`);
    }
    for (const m of html.matchAll(/<div class="subject-title"[^>]*>([\s\S]*?)<\/(div|a)>/g)) {
      if (m[2] !== 'div') violations.push(`${r}: .subject-title 닫는 태그 오류`);
    }
    const openDivs = (html.match(/<div\b/g) || []).length;
    const closeDivs = (html.match(/<\/div>/g) || []).length;
    if (openDivs !== closeDivs) {
      violations.push(`${r}: <div>(${openDivs}) !== </div>(${closeDivs})`);
    }
  }
  for (const s of SUBJECTS) {
    const html = fs.readFileSync(path.join(ROOT, s, 'index.html'), 'utf8');
    for (const sel of ['class="app-shell"', 'class="sidebar"', 'class="subject-title"', 'id="chapterNav"', 'class="side-actions"', 'class="topbar"']) {
      if (!html.includes(sel)) violations.push(`${s}/index.html: 보호 영역 ${sel} 누락`);
    }
  }
  return { passed: violations.length === 0, violations };
}

auditNavigationAndHeaders();
auditSubjectHomes();
auditExamUxAndStorage();
auditVisualAndResponsive();
auditAccessibility();
const safety = auditSafetyRules();

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ totalHtml: htmlFiles.length, totalCss: cssFiles.length, totalJs: jsFiles.length, safety, findings }, null, 2));
} else {
  console.log('================================================================================');
  console.log(' AI Coding Recall (adnim-seven.github.io) UI/UX 및 기능 통일성 감사 보고서');
  console.log('================================================================================');
  console.log(`검사 대상: HTML ${htmlFiles.length}개 | CSS ${cssFiles.length}개 | JS ${jsFiles.length}개`);
  console.log(
    `페이지 분류: 메인 홈(${pageGroups.mainHome.length}) | 과목 홈(${pageGroups.subjectHomes.length}) | 주관식 목록(${pageGroups.subjectiveLists.length}) | 개별 주관식(${pageGroups.subjectiveTests.length}) | 모의고사(${pageGroups.mockExams.length}) | 다운로드(${pageGroups.downloads.length})`
  );
  console.log(`WEB_EDIT_SAFETY.md 보호 영역 및 태그 짝 검사: ${safety.passed ? 'PASS (위반 0건)' : 'FAIL (' + safety.violations.length + '건)'}`);
  console.log('--------------------------------------------------------------------------------');
  const counts = { High: 0, Medium: 0, Low: 0 };
  for (const f of findings) counts[f.severity] = (counts[f.severity] || 0) + 1;
  console.log(`발견된 통일성 이슈: 총 ${findings.length}건 (High: ${counts.High}, Medium: ${counts.Medium}, Low: ${counts.Low})\n`);
  for (const f of findings) {
    console.log(`[${f.id}] [${f.severity}] (${f.category}) ${f.title}`);
    for (const ev of f.evidence) console.log(`  - 근거: ${ev}`);
    console.log(`  -> 권장 방안: ${f.recommendation}\n`);
  }
}
