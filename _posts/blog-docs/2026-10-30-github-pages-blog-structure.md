---
layout: post
title: "GitHub Pages 블로그 구조 설계"
date: 2026-10-30
categories: [blog-docs]
tags: [jekyll, github-pages]
description: "Markdown 기록을 위한 Jekyll 블로그의 기본 구조와 작성 흐름을 정리했다."
file_name: github-pages-blog-structure.md
directory_label: posts
outline:
  - 목적
  - 폴더 구조
  - 작성 흐름
---

## 목적

KNIGHTS FRONTIER 활동과 보안 학습 과정을 꾸준히 남길 수 있도록 GitHub Pages 기반의 개인 블로그를 구성했다. 글은 Markdown으로 작성하고, 카테고리와 태그는 글 상단의 Front Matter에서 관리한다.

## 폴더 구조

공통 화면은 `_layouts`와 `_includes`에서 관리하고, 실제 기록은 `_posts` 아래에 작성한다. 디자인은 `assets/css/style.scss`를 시작점으로 하며, 세부 스타일은 `_sass` 폴더에 나누어 관리한다.

```text
_layouts/   # 공통 화면 뼈대
_includes/  # 탐색기, 탭, 목차 같은 재사용 요소
_posts/     # 날짜와 제목을 가진 실제 학습 기록
_sass/      # 색상, 레이아웃, 본문 스타일
```

## 작성 흐름

새 글을 작성할 때는 `_posts`의 해당 카테고리 폴더에 날짜와 제목을 포함한 Markdown 파일을 만든다. 이후 `categories`, `tags`, `description`을 입력하면 홈의 최신 기록과 해당 카테고리 목록에 자동으로 표시된다.

> 기록은 많이 쌓는 것보다, 학습한 내용과 확인한 과정을 나중에 다시 설명할 수 있도록 남기는 것을 우선으로 한다.
