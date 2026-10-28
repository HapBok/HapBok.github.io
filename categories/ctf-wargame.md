---
layout: default
title: CTF & Wargame
permalink: /ctf-wargame/
category_key: ctf
---

<a class="back-link" href="{{ '/' | relative_url }}">← 홈으로</a>
<header class="page-intro">
  <p class="eyebrow">02 · CTF / WARGAME</p>
  <h1>CTF / Wargame</h1>
  <p>문제 풀이의 흐름, 막힌 지점, 새로 이해한 개념을 복기합니다.</p>
</header>

{% assign category_posts = site.categories[page.category_key] %}
{% if category_posts.size > 0 %}
<ul class="post-list">
  {% for post in category_posts %}
  <li><a href="{{ post.url | relative_url }}"><p class="post-meta">{{ post.date | date: "%Y.%m.%d" }}</p><h3>{{ post.title }}</h3></a></li>
  {% endfor %}
</ul>
{% else %}
<p class="empty-state">첫 CTF / Wargame 풀이 기록을 준비하고 있습니다.</p>
{% endif %}
