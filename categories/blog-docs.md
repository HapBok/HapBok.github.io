---
layout: default
title: 블로그 & 문서
permalink: /blog-docs/
category_key: blog-docs
---

<a class="back-link" href="{{ '/' | relative_url }}">← 홈으로</a>
<header class="page-intro">
  <p class="eyebrow">04 · BLOG / DOCS</p>
  <h1>블로그 / 기술문서</h1>
  <p>학습에 활용한 도구, 문서, 작업 방식을 정리합니다.</p>
</header>

{% assign category_posts = site.categories[page.category_key] %}
{% if category_posts.size > 0 %}
<ul class="post-list">
  {% for post in category_posts %}
  <li><a href="{{ post.url | relative_url }}"><p class="post-meta">{{ post.date | date: "%Y.%m.%d" }}</p><h3>{{ post.title }}</h3></a></li>
  {% endfor %}
</ul>
{% else %}
<p class="empty-state">블로그와 기술문서 기록을 준비하고 있습니다.</p>
{% endif %}
