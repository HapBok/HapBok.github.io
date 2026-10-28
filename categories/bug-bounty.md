---
layout: default
title: 버그 바운티
permalink: /bug-bounty/
category_key: bug-bounty
---

<a class="back-link" href="{{ '/' | relative_url }}">← 홈으로</a>
<header class="page-intro">
  <p class="eyebrow">03 · BUG BOUNTY</p>
  <h1>Bug Bounty</h1>
  <p>공개 취약점과 웹 보안 관점의 분석 과정을 차근히 정리합니다.</p>
</header>

{% assign category_posts = site.categories[page.category_key] %}
{% if category_posts.size > 0 %}
<ul class="post-list">
  {% for post in category_posts %}
  <li><a href="{{ post.url | relative_url }}"><p class="post-meta">{{ post.date | date: "%Y.%m.%d" }}</p><h3>{{ post.title }}</h3></a></li>
  {% endfor %}
</ul>
{% else %}
<p class="empty-state">버그 바운티 학습 기록을 준비하고 있습니다.</p>
{% endif %}
