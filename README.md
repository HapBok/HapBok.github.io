# HapBok

보안과 개발을 공부하며 직접 확인한 과정과 배운 내용을 남기는 개인 블로그입니다.

- 운영 주소: https://hapbok.github.io/
- GitHub Pages + Jekyll + Markdown
- Pretendard Variable / 밝은 중성색 + 절제된 블루
- 해피(H, 말티즈)와 복순이(B, 요크셔테리어)

## 페이지 흐름

표지 `/` → 블로그 홈 `/home/` → 전체 기록 `/notes/` 또는 카테고리 → 게시글.
표지는 입장 화면만 보여 주며, 기존 홈과 소개는 `/home/`에 모았습니다.
별도의 소개 메뉴는 없습니다. 이전 `/about/` 주소는 `/home/#about`으로 이동합니다.

기록·게시글 화면의 상단 메뉴 버튼으로 데스크톱 사이드바를 접고 펼칠 수 있습니다.
카테고리 이름·화살표는 하위 글 목록 토글이고, **폴더 아이콘**은 해당 카테고리 전체 기록으로 이동하는 링크입니다.
데스크톱 사이드바의 접힘 상태는 브라우저에 저장하며 모바일 서랍과는 별도로 관리합니다.

## 글을 쓰는 방법

1. `_posts/` 아래 원하는 폴더에 `YYYY-MM-DD-slug.md`를 만듭니다.
2. 파일 첫 부분에 아래 Front Matter를 작성합니다.
3. 빈 줄 아래에 Markdown 본문을 씁니다. `##`, `###`는 목차에 자동 반영됩니다.
4. 로컬 미리보기에서 확인한 뒤 커밋·푸시합니다.

~~~yaml
---
layout: post
title: "글 제목"
date: 2026-11-10
categories: [development]
tags: [python, linux]
description: "이 글에서 다루는 내용을 한두 문장으로 적습니다."
---

## 문제 상황

처음 접하는 사람도 이해할 수 있도록 배경과 용어를 설명합니다.

## 직접 확인한 과정

명령어, 코드, 결과와 그 이유를 함께 설명합니다.

## 배운 점

확인한 내용, 남은 의문과 참고 자료를 구분합니다.
~~~

폴더 이름이 분류를 결정하지 않습니다. 실제 분류는 `categories`로 결정됩니다.
현재 화면은 첫 번째 카테고리를 기본 분류로 사용하므로 글마다 하나를 지정하는 방식을 권장합니다.
사이드바에서 짧게 표시할 제목은 Front Matter에 `nav_title: "대표 제목"`으로 지정합니다. 생략하면 원래 제목을 표시하며, 본문 제목·목록·검색 제목은 바뀌지 않습니다.

| 카테고리 키 | 화면 이름 | 주소 |
| --- | --- | --- |
| development | 개발 | /development/ |
| ctf | CTF · Wargame | /ctf-wargame/ |
| bug-bounty | Bug Bounty | /bug-bounty/ |
| blog-docs | 블로그 · 기술문서 | /blog-docs/ |
| analysis-conference | 논문 · 컨퍼런스 | /analysis-conference/ |
| contest-certificate | 공모전 · 자격증 | /contest-certificate/ |

CTF 글에는 필요할 때만 `platform`, `field`, `difficulty`를 추가합니다.
글 주소는 기존과 같이 `/posts/파일명의-slug/`입니다. 폴더를 옮겨도 slug가 같으면 주소는 유지됩니다.
날짜가 미래이면 Jekyll 기본 동작에 따라 공개 목록에 나오지 않을 수 있습니다.
태그는 화면에 표시하는 메타데이터이며 별도의 태그 필터 기능은 없습니다.

## 로컬 미리보기

Docker Desktop을 실행한 뒤 저장소 루트에서 실행합니다.

~~~powershell
docker build -t hapbok-jekyll:local .
docker run --rm --name hapbok-preview -p 127.0.0.1:4000:4000 -v "${PWD}:/site" hapbok-jekyll:local
~~~

브라우저에서 http://127.0.0.1:4000/ 을 엽니다.
파일을 저장하면 Jekyll이 다시 빌드합니다. 브라우저는 새로고침해야 합니다.
설정 파일을 바꾼 경우 서버를 다시 시작합니다.

Ruby가 이미 설치되어 있으면 `bundle install` 후 `bundle exec jekyll serve`도 가능합니다.
Dockerfile·Gemfile·잠금 파일은 미리보기 의존성을 관리하며 프런트엔드 프레임워크가 아닙니다.

## 어디를 수정하나요?

| 바꾸려는 것 | 수정 위치 | 역할 |
| --- | --- | --- |
| 표지 문구·입장 버튼 | `index.md`, `_layouts/cover.html` | 첫 접속 화면과 홈으로의 연결 |
| 표지 H·크기·배치 | `assets/images/cover/`, `_sass/_cover.scss` | 표지 조형물과 반응형 구성 |
| 홈 소개 | `_includes/home/intro.html` | 문구, 캐릭터 버튼과 소개 배치 |
| 홈의 소개 영역 | `home.md` | 관심 분야와 두 아이의 이름 이야기 |
| 홈 최신 글 | `_includes/home/latest-notes.html` | 실제 최근 글 최대 5개 표시 |
| 색상·글꼴 | `_sass/_tokens.scss`, `_sass/_base.scss` | 전체 색상 변수·웹폰트·기본 글자 |
| 상단 메뉴·사이드바 | `_includes/header.html`, `_includes/navigation.html` | 공통 탐색 마크업 |
| 카테고리 이름·주소·캐릭터 | `_data/categories.yml` | 모든 화면의 공통 분류 정보 |
| 카테고리 설명·빈 상태 | `categories/*.md` | 해당 주제의 안내 문구 |
| 목록과 검색창 배치 | `_layouts/archive.html`, `_sass/_archive.scss` | 전체 기록·카테고리 공통 화면 |
| 글 본문 화면 | `_layouts/post.html`, `_sass/_post.scss` | 제목·메타정보·목차·코드·하단 |
| 모바일 배치 | `_sass/_responsive.scss` | 화면 너비별 메뉴·본문 크기 |
| 넓은 화면·폴더·버튼 보완 | `_sass/_refinements.scss` | 전체 폭, 사이드바 토글, 반응 모션 |
| 캐릭터 그림 | `assets/images/characters/` | 투명 PNG와 홈 프레임 atlas |
| 캐릭터 크기·프레임 표시 | `_sass/_characters.scss` | 프레임을 한 장씩 표시 |
| 실제 상호작용 | `assets/js/modules/` | 아래 모듈별 동작 |

## JavaScript의 역할

- `navigation.js`: 모바일 메뉴, 닫기·Esc·포커스 순환.
- 데스크톱 접기·펼치기와 카테고리별 하위 글 토글도 `navigation.js`에서 관리합니다.
- `search.js`: 생성된 `search.json`에서 제목·설명·본문 검색. 전체 기록은 전체, 카테고리는 해당 분류만 검색.
- `toc.js`: 실제 h2/h3에서 목차와 고유 앵커 생성, 스크롤 위치 표시.
- `reading-tools.js`: 코드 복사, 표 가로 스크롤, 이미지 확대와 포커스 복귀.
- `companions.js`: 홈 캐릭터 프레임·인사·시선·깜빡임·화면 밖 일시정지.
- `motion.js`: 페이지별 캐릭터의 hover·클릭·키보드 반응, 표지 H의 가벼운 포인터 반응.
- `main.js`: 각 모듈을 불러옵니다. 배포 버전을 모듈 URL에도 전달합니다.

JavaScript가 없어도 본문과 정적 목록·홈의 분류 링크를 읽을 수 있습니다.
검색·자동 목차·캐릭터 반응·모바일 서랍은 JavaScript 기능입니다.

## 캐릭터 교체와 모션 수정

홈은 캐릭터마다 5열 × 2행의 10프레임 atlas를 사용합니다.

| 프레임(0부터) | 의미 |
| --- | --- |
| 0 | 기본 자세 |
| 1, 2 | 좌우 시선 |
| 3 | 눈 감기 |
| 4~9 | 인사 동작 |

교체할 때는 동일한 칸 크기·정렬·바닥 기준선을 유지해야 합니다.
전체 PNG를 흔드는 효과가 아니라 이미지 프레임을 전환합니다.
현재 인사는 프레임당 135ms, 깜빡임은 약 8초 간격입니다.
`companions.js`에서 숫자를 수정할 수 있습니다.
화면 밖·비활성 탭·동작 줄이기 설정에서는 자동 동작을 멈춥니다.
표지와 홈의 두 아이는 마우스를 올리거나 키보드로 선택해도 인사합니다.
그 밖의 캐릭터는 상황별 그림에 짧은 들썩임·기울임 반응을 더했습니다.
캐릭터가 포함된 페이지마다 별도 애니메이션 파일을 만들 필요 없이 공통 include가 반응을 연결합니다.
글 하단에는 처음 도착할 때 한 번의 가벼운 등장 효과도 있습니다.

현재 사용 자산은 승인된 캐릭터 시트를 바탕으로 내장 이미지 생성 도구로 제작했습니다.
생성 프롬프트·원본 식별자는 `docs/asset-sources.json`에 정리했습니다.
현재 사용하는 이미지와 생성 정보를 보관합니다.
Pretendard v1.3.9와 OFL 라이선스는 `assets/fonts/pretendard/`에 있습니다.

## 검증과 배포

~~~powershell
docker run --rm -v "${PWD}:/site" hapbok-jekyll:local bundle exec jekyll build
python scripts/check_site.py
node --test scripts/companions.test.mjs scripts/reading-tools.test.mjs scripts/navigation.test.mjs scripts/motion.test.mjs scripts/toc.test.mjs
~~~

추가 브라우저 검증용 글은 `python scripts/make_qa_fixture.py`로 `tmp/`에 별도 생성합니다.
이 자료를 실제 `_posts`로 복사하지 않습니다. `tmp`와 빌드 산출물은 Git·Jekyll에서 제외됩니다.

운영 배포는 기존과 같이 `main` 푸시 → GitHub Pages 빌드입니다.
GitHub Pages 반영 후 새로고침하고, Actions 빌드 결과를 확인합니다.

## 큰 화면 정렬과 표지 H 교체

- 게시글 폭은 화면 너비와 사이드바 상태에 맞춰 늘고 줄어듭니다. 매우 넓은 화면에서는 가독성을 위해 최대 1600px로 제한합니다. `_sass/_refinements.scss`에서 본문·여백·목차 공간을 조정합니다.
- 화면 너비가 1280 CSS px 이상이면 목차를 화면 오른쪽에 고정하고, 그보다 좁아지면 본문 위 접이식 목차로 전환합니다. 브라우저 확대·축소에 따라 가용 CSS 너비도 바뀝니다.
- 목차가 없거나 본문 위로 이동한 화면에는 오른쪽 공간을 따로 남기지 않습니다.
- 표지 H는 `assets/images/cover/h-emblem-illustrated.png`입니다. `index.md`의 `.cover-emblem`이 불러옵니다.
- 새 H는 캐릭터와 맞춘 크림·청록·보라 패브릭 일러스트입니다. 생성 도구와 전체 프롬프트는 `docs/asset-sources.json`의 `coverRefresh`에서 확인할 수 있습니다.
