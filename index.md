---
layout: default
title: HAPBOK Security Blog
---

<section class="hero" aria-labelledby="home-title">
  <p class="eyebrow">KNIGHTS FRONTIER · 3기</p>
  <h1 id="home-title">HAPBOK<br><span>SECURITY LOG</span></h1>
  <p class="hero-copy">공격자 관점에서 시스템의 약점을 이해하고,<br>분석의 근거와 시행착오를 기록합니다.</p>
  <div class="hero-actions">
    <a class="button button-primary" href="{{ '/ctf-wargame/' | relative_url }}">학습 기록 둘러보기 <span>→</span></a>
    <a class="button button-secondary" href="https://github.com/HapBok" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
  </div>
</section>

<section class="dashboard-grid" aria-label="학습 개요">
  <article class="status-card">
    <p class="eyebrow">FOCUS</p>
    <h2>Offensive Security</h2>
    <p>취약점 분석과 공격자 관점의 시스템 이해를 중심으로 학습합니다.</p>
  </article>
  <article class="status-card">
    <p class="eyebrow">METHOD</p>
    <h2>Understand · Verify · Record</h2>
    <p>한 주제를 깊게 이해하고, 안전한 실습과 기록으로 다음 단계로 나아갑니다.</p>
  </article>
</section>

<section class="section-block" aria-labelledby="archive-title">
  <div class="section-heading">
    <div>
      <p class="eyebrow">ARCHIVE</p>
      <h2 id="archive-title">학습 카테고리</h2>
    </div>
    <p>기록을 시작할 분야를 선택하세요.</p>
  </div>

  <div class="category-grid">
    <a class="category-card" href="{{ '/development/' | relative_url }}"><span>01</span><strong>개발</strong><small>기초와 구현 기록</small><b>↗</b></a>
    <a class="category-card" href="{{ '/ctf-wargame/' | relative_url }}"><span>02</span><strong>CTF / Wargame</strong><small>문제 풀이와 복기</small><b>↗</b></a>
    <a class="category-card" href="{{ '/bug-bounty/' | relative_url }}"><span>03</span><strong>Bug Bounty</strong><small>취약점 분석 학습</small><b>↗</b></a>
    <a class="category-card" href="{{ '/blog-docs/' | relative_url }}"><span>04</span><strong>블로그 / 기술문서</strong><small>도구와 기술 기록</small><b>↗</b></a>
    <a class="category-card" href="{{ '/analysis-conference/' | relative_url }}"><span>05</span><strong>논문 / 컨퍼런스</strong><small>읽고 정리한 인사이트</small><b>↗</b></a>
    <a class="category-card" href="{{ '/contest-certificate/' | relative_url }}"><span>06</span><strong>공모전 / 자격증</strong><small>프로젝트와 성장 기록</small><b>↗</b></a>
  </div>
</section>

<section class="section-block latest-notes" aria-labelledby="notes-title">
  <div class="section-heading">
    <div>
      <p class="eyebrow">LATEST NOTES</p>
      <h2 id="notes-title">최근 기록</h2>
    </div>
  </div>

  {% if site.posts.size > 0 %}
  <div class="note-list">
    {% for post in site.posts limit: 3 %}
    <a class="note-item" href="{{ post.url | relative_url }}">
      <span>{{ post.date | date: "%Y.%m.%d" }}</span>
      <strong>{{ post.title }}</strong>
      <b>읽기 →</b>
    </a>
    {% endfor %}
  </div>
  {% else %}
  <div class="empty-note">
    <span class="terminal-mark">$</span>
    <p>첫 학습 기록을 준비하고 있습니다. 곧 이곳에 분석 과정과 배운 점을 남기겠습니다.</p>
  </div>
  {% endif %}
</section>

<section class="principle-card">
  <p class="eyebrow">LEARNING PRINCIPLE</p>
  <h2>이해 → 실습 → 기록</h2>
  <p>문제를 빠르게 소비하기보다, 왜 취약한지와 어떻게 보완됐는지 설명할 수 있을 때까지 확인합니다.</p>
</section>
