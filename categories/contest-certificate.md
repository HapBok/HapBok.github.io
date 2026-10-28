---
layout: default
title: 공모전 & 자격증
permalink: /contest-certificate/
category_key: contest-certificate
---

<a class="back-link" href="{{ '/' | relative_url }}">← 홈으로</a>
<header class="page-intro">
  <p class="eyebrow">06 · PROJECT / CERTIFICATE</p>
  <h1>공모전 / 자격증</h1>
  <p>프로젝트의 문제 해결 과정과 자격증 학습 여정을 남깁니다.</p>
</header>

{% assign category_posts = site.categories[page.category_key] %}
{% if category_posts.size > 0 %}
<ul class="post-list">
  {% for post in category_posts %}
  <li><a href="{{ post.url | relative_url }}"><p class="post-meta">{{ post.date | date: "%Y.%m.%d" }}</p><h3>{{ post.title }}</h3></a></li>
  {% endfor %}
</ul>
{% else %}
<p class="empty-state">공모전과 자격증 기록을 준비하고 있습니다.</p>
{% endif %}
