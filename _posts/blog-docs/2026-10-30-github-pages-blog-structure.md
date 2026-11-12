---
layout: post
title: "GitHub Pages와 Jekyll로 구성한 HapBok 블로그 구조"
nav_title: "블로그 구조"
date: 2026-10-30
categories: [blog-docs]
tags: [jekyll, github-pages]
description: "표지부터 게시글까지 이어지는 HapBok의 페이지 구성과 파일별 역할, Markdown 글이 목록과 검색에 반영되는 흐름을 정리했다."
---

## 활동과 학습을 기록할 공간

KNIGHTS FRONTIER 활동과 보안·개발 학습 과정을 남기기 위해 개인 블로그 HapBok을 구성했다. 프로젝트 결과뿐 아니라 직접 수행한 과정, 막혔던 부분, 결과를 해석하며 배운 내용을 기록할 공간이다.

글이 늘어날 때마다 페이지를 새로 꾸미거나 목록을 수정하기보다는, Markdown으로 글을 작성하면 공통 화면에 반영되는 구조가 필요했다. 현재 블로그는 GitHub Pages와 Jekyll을 사용하고, 화면 구성·디자인·상호작용·게시글을 각각 나누어 관리한다.

이 글은 **2026년 11월 12일 기준 저장소 구조**를 정리한 것이다.

## 표지에서 게시글까지

현재 페이지는 다음 흐름으로 연결된다.

```text
표지 / → 홈 /home/ → 모든 기록 /notes/ 또는 카테고리 → 게시글 /posts/slug/
```

| 화면 | 역할 | 담당 파일 |
| --- | --- | --- |
| 표지 `/` | 블로그 소개 문구와 입장 버튼을 보여 주는 첫 화면 | `index.md`, `_layouts/cover.html` |
| 홈 `/home/` | 소개, 최근 기록, 주제별 링크, HapBok 이야기를 모은 화면 | `home.md`, `_includes/home/` |
| 모든 기록 `/notes/` | 전체 글을 최신순으로 보여 주고 검색하는 화면 | `notes.md`, `_layouts/archive.html` |
| 카테고리 | 해당 주제의 글 목록과 검색을 제공하는 화면 | `categories/`, `_layouts/category.html`, `_layouts/archive.html` |
| 게시글 | 제목·날짜·태그·본문·목차·이전/다음 글을 보여 주는 화면 | `_layouts/post.html` |

소개는 홈의 `/home/#about`에 통합했다. 이전 `/about/` 주소로 접근하면 이 영역으로 이동한다.

사이드바에는 홈, 모든 기록, 여섯 개 카테고리가 있다. **카테고리 이름이나 화살표를 누르면 하위 글 목록을 접고 펼치고**, **폴더 아이콘을 누르면 카테고리 전체 기록으로 이동**한다. 하위 목록은 짧은 대표 제목으로 표시한다. 큰 화면에서는 사이드바를 접을 수 있고, 작은 화면에서는 메뉴 서랍으로 탐색한다.

## Jekyll이 글과 화면을 연결하는 방식

Jekyll은 Markdown 글과 템플릿을 조합해 정적 HTML을 생성한다. GitHub Pages는 이렇게 생성된 페이지를 공개 주소에서 제공한다. 현재 블로그에는 React나 TypeScript, 별도의 프런트엔드 빌드 도구를 사용하지 않는다.

| 구성 요소 | 현재 블로그에서 맡은 역할 |
| --- | --- |
| Markdown | 게시글 본문 작성 |
| YAML | 글의 제목·날짜·분류와 사이트 설정·공통 데이터 관리 |
| Liquid·HTML | 글 데이터를 읽어 공통 화면과 목록 구성 |
| SCSS | 색상·글꼴·본문·반응형 배치 관리 |
| JavaScript | 검색·목차·메뉴·코드 복사·이미지 확대·캐릭터 반응 |

예를 들어 게시글 하나를 추가하면 Jekyll이 `_posts`의 글을 읽고, 지정된 레이아웃에 본문을 넣는다. 홈과 목록 템플릿도 같은 글 데이터를 읽기 때문에 글마다 목록 HTML을 따로 작성할 필요가 없다.

## 파일 구조와 수정 위치

```text
HapBok.github.io/
├─ index.md                 # 표지
├─ home.md                  # 홈과 통합 소개
├─ notes.md                 # 모든 기록
├─ about.md                 # 이전 소개 주소 연결
├─ categories/              # 카테고리별 설명과 목록 설정
├─ _posts/                  # Markdown 게시글
├─ _data/
│  ├─ categories.yml        # 분류 키·이름·주소·캐릭터
│  └─ characters.yml        # 캐릭터 이미지 크기
├─ _layouts/                # 공통 화면 뼈대
├─ _includes/               # 메뉴·글 목록·캐릭터 등 재사용 요소
├─ _sass/                   # 역할별 스타일
├─ assets/
│  ├─ css/style.scss        # SCSS 진입점
│  ├─ js/main.js            # 기능별 JavaScript 모듈 로딩
│  ├─ js/modules/           # 개별 상호작용 기능
│  ├─ images/               # 표지·캐릭터·게시글 이미지
│  └─ fonts/pretendard/     # 폰트 파일과 라이선스
├─ search.json              # 검색 데이터 생성용 Liquid 템플릿
├─ _config.yml              # 사이트 설정과 게시글 URL 규칙
├─ Dockerfile               # 로컬 Jekyll 미리보기 환경
├─ README.md                # 작성·수정·미리보기 안내
├─ docs/                    # 이미지 생성 정보
└─ scripts/                 # 빌드 결과 검사와 기능 테스트
```

`_layouts`는 화면의 뼈대이고, `_includes`는 여러 화면에서 반복 사용하는 부분이다. 게시글 화면을 바꾸려면 `_layouts/post.html`, 사이드바를 바꾸려면 `_includes/navigation.html`, 홈의 최근 글을 바꾸려면 `_includes/home/latest-notes.html`을 확인한다. 최근 글은 날짜순으로 최대 5개를 표시한다.

디자인은 `assets/css/style.scss`가 `_sass`의 파일들을 순서대로 불러오는 방식이다. 색상·글꼴 변수는 `_tokens.scss`, 본문은 `_post.scss`, 반응형 규칙은 `_responsive.scss`에서 관리한다. 마지막에는 `_refinements.scss`가 적용되므로, 화면을 수정할 때는 한 파일의 규칙뿐 아니라 뒤에서 덮어쓰는 규칙도 확인해야 한다.

현재 디자인은 밝은 배경과 Pretendard 글꼴을 사용한다. 본문은 화면 너비와 메뉴 상태에 따라 폭이 조정되고, 넓은 화면의 목차는 본문과 분리해 화면 오른쪽에 고정한다. 화면이 좁아지면 목차는 본문 위 접이식 메뉴로 전환한다.

## 새 글 작성과 카테고리 분류

새 글은 `_posts/` 아래 관리하기 편한 폴더에 `YYYY-MM-DD-slug.md` 이름으로 작성한다. 파일 맨 위에는 글의 설정인 **Front Matter**를 넣는다.

```yaml
---
layout: post
title: "PE 파일 이미지 분류 모델 개발 기록"
date: 2026-11-12
categories: [development]
tags: [python, malware, cnn]
description: "PE 파일을 이미지로 변환하고 분류 모델을 개발한 과정을 정리합니다."
---
```

`layout: post`는 게시글용 화면을 사용한다는 뜻이다. `categories`는 글의 분류를 정하고, `tags`는 글에 표시할 관련 키워드다. 현재 태그는 표시용이며 별도의 태그 필터는 없다.

**폴더 이름만으로 분류를 지정했다고 생각하면 안 된다.** 현재 블로그에서는 Front Matter의 `categories`에 원하는 분류 키를 명시한다. 글의 대표 분류 표시와 검색 데이터는 첫 번째 카테고리를 사용하므로, 글마다 대표 분류 하나를 지정하는 방식으로 관리한다.

| 분류 키 | 표시 이름 | 목록 주소 |
| --- | --- | --- |
| `development` | 개발 | `/development/` |
| `ctf` | CTF · Wargame | `/ctf-wargame/` |
| `bug-bounty` | Bug Bounty | `/bug-bounty/` |
| `blog-docs` | 블로그 · 기술문서 | `/blog-docs/` |
| `analysis-conference` | 논문 · 컨퍼런스 | `/analysis-conference/` |
| `contest-certificate` | 공모전 · 자격증 | `/contest-certificate/` |

공통 분류 정보는 `_data/categories.yml`, 카테고리별 설명과 목록 설정은 `categories/`에서 관리한다. 카테고리 페이지의 `permalink`는 목록 주소이며, 개별 글에 같은 주소를 지정하지 않는다.

게시글 주소는 `_config.yml`의 `/posts/:title/` 규칙을 따른다. 별도의 주소 설정이 없는 `2026-11-12-pe-image-classifier.md`는 `/posts/pe-image-classifier/`로 연결된다.

본문에서는 `##`, `###` 제목을 사용하면 JavaScript가 목차를 자동 생성한다. 수동으로 `outline`을 작성할 필요는 없다. 새 게시글 이미지의 저장 경로는 `assets/images/posts/글-slug/`로 통일한다.

```markdown
![모델 학습 결과를 보여 주는 화면](/assets/images/posts/pe-image-classifier/training-result.png)
```

위 코드는 이미지 삽입 형식의 예시다. 실제 글에서는 해당 경로에 이미지를 저장하고, 대체 텍스트에 화면에서 확인할 핵심 내용을 적는다.

## 목록·검색과 읽기 기능

글이 빌드 대상에 포함되면 홈의 최근 기록, 모든 기록, 해당 카테고리, 사이드바 하위 목록과 검색 데이터에 반영된다.

검색은 저장소의 `search.json` 템플릿이 빌드 시 생성한 데이터를 사용한다. 이 데이터에는 글의 제목·설명·본문·주소·분류 등이 들어간다. `search.js`는 이를 불러와 **제목·설명·본문**에서 입력한 단어를 찾는다. 모든 기록에서는 전체 글을, 카테고리에서는 해당 분류의 글을 검색한다.

읽기와 탐색 기능은 다음 모듈로 나누었다.

| 모듈 | 기능 |
| --- | --- |
| `navigation.js` | 데스크톱 사이드바, 카테고리 접기·펼치기, 모바일 메뉴 |
| `search.js` | 검색 데이터 로딩, 검색 범위 제한, 결과 표시 |
| `toc.js` | 본문의 h2·h3에서 목차 생성, 현재 절 강조 |
| `reading-tools.js` | 코드 복사, 표 가로 스크롤, 이미지 확대 |
| `companions.js` | 표지·홈 캐릭터의 프레임 전환·인사·시선·깜빡임 |
| `motion.js` | 다른 페이지의 캐릭터와 표지 H 반응 |

이 모듈들은 `assets/js/main.js`에서 불러온다. JavaScript 기능이 동작하지 않아도 본문과 정적 글 목록은 읽을 수 있다.

HapBok은 두 강아지 Happy와 Boksoon의 이름을 합친 이름이다. 흰 말티즈 해피에는 H, 큰 귀의 요크셔테리어 복순이에는 B를 사용했다. 캐릭터는 마우스와 키보드에 반응하며, 자동 움직임은 동작 줄이기 설정·화면 밖·비활성 탭 상태를 고려한다. 현재 표지 H는 `assets/images/cover/h-emblem-illustrated.png`의 크림·청록·보라 패브릭 일러스트다.

## 로컬 확인과 공개 배포

Docker는 로컬에서 Jekyll을 실행하는 미리보기 환경이다. Docker Desktop을 실행한 뒤 저장소 루트의 PowerShell에서 다음 명령을 사용한다.

```powershell
docker build -t hapbok-jekyll:local .
docker run --rm --name hapbok-preview -p 127.0.0.1:4000:4000 -v "${PWD}:/site" hapbok-jekyll:local
```

첫 명령은 필요한 Ruby·Jekyll 의존성을 갖춘 이미지를 만들고, 두 번째 명령은 현재 폴더를 연결해 미리보기 서버를 실행한다. 이미지가 이미 있고 의존성이 바뀌지 않았다면 매번 다시 빌드할 필요는 없다.

브라우저에서 `http://127.0.0.1:4000/`을 연다. 파일을 저장하면 Jekyll이 다시 빌드하고, 변경 화면은 브라우저를 새로고침해 확인한다. `_config.yml` 같은 설정을 바꾸면 서버를 다시 시작한다.

수정 범위에 따라 Jekyll 빌드와 생성 결과 검사, 관련 기능 테스트를 수행한다.

```powershell
docker run --rm -v "${PWD}:/site" hapbok-jekyll:local bundle exec jekyll build
python scripts/check_site.py
node --test scripts/companions.test.mjs scripts/reading-tools.test.mjs scripts/navigation.test.mjs scripts/motion.test.mjs scripts/toc.test.mjs
```

`check_site.py`는 생성된 페이지의 경로·로컬 자산·앵커·검색 데이터를 검사한다. Node 테스트는 캐릭터·읽기 도구·탐색·모션 관련 동작을 검사한다. 이 명령 목록은 검증 방법을 설명한 것이며, 개별 변경의 검증 결과는 실제 실행 결과로 확인한다.

공개할 때는 `git status`와 diff로 변경을 검토하고 필요한 파일만 커밋한 뒤 `main`에 반영해 푸시한다. 이후 GitHub Pages 빌드·배포 성공과 공개 화면의 글·목록·검색 반영을 확인한다. 미래 날짜의 글은 기본 빌드에서 제외될 수 있으므로 날짜도 점검한다.

공개 블로그는 GitHub Pages에서 제공하므로 로컬 Docker Desktop을 계속 켜 둘 필요는 없다. FRONTIER 미션 제출은 별도 절차이며, 해당 미션에서 요구하는 게시글 링크를 제출해야 한다.

## 관련 자료

- [HapBok 블로그](https://hapbok.github.io/)
- [블로그 저장소와 README](https://github.com/HapBok/HapBok.github.io)
- 저장소의 `docs/asset-sources.json`: 이미지 생성 정보와 프롬프트
