---
layout: default
title: 개발
permalink: /development/
category_key: development
---

<a class="back-link" href="{{ '/' | relative_url }}">← 홈으로</a>
<header class="page-intro">
  <p class="eyebrow">01 · DEVELOPMENT</p>
  <h1>개발</h1>
  <p>보안 학습을 뒷받침하는 개발 기초와 구현 과정을 기록합니다.</p>
</header>

{% assign category_posts = site.categories[page.category_key] %}
{% if category_posts.size > 0 %}
<ul class="post-list">
  {% for post in category_posts %}
  <li><a href="{{ post.url | relative_url }}"><p class="post-meta">{{ post.date | date: "%Y.%m.%d" }}</p><h3>{{ post.title }}</h3></a></li>
  {% endfor %}
</ul>
{% else %}
<p class="empty-state">개발 학습 기록을 준비하고 있습니다.</p>
{% endif %}
