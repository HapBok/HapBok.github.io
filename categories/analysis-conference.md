---
layout: default
title: 논문 & 컨퍼런스
permalink: /analysis-conference/
category_key: analysis-conference
---

<a class="back-link" href="{{ '/' | relative_url }}">← 홈으로</a>
<header class="page-intro">
  <p class="eyebrow">05 · PAPER / CONFERENCE</p>
  <h1>논문 / 컨퍼런스</h1>
  <p>읽은 자료와 발표에서 얻은 보안 관점의 인사이트를 기록합니다.</p>
</header>

{% assign category_posts = site.categories[page.category_key] %}
{% if category_posts.size > 0 %}
<ul class="post-list">
  {% for post in category_posts %}
  <li><a href="{{ post.url | relative_url }}"><p class="post-meta">{{ post.date | date: "%Y.%m.%d" }}</p><h3>{{ post.title }}</h3></a></li>
  {% endfor %}
</ul>
{% else %}
<p class="empty-state">논문과 컨퍼런스 기록을 준비하고 있습니다.</p>
{% endif %}
