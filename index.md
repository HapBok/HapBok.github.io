---
layout: default
title: HapBok
description: 직접 확인한 과정과 이해한 내용을 나의 언어로 정리하는 보안·개발 학습 블로그입니다.
---

{% include home/intro.html %}
{% include home/latest-notes.html %}
<section class="home-topics" aria-labelledby="topics-title">
<h2 id="topics-title">주제별로</h2>
<nav class="home-topic-links" aria-label="주제별 기록">
{% for category in site.data.categories %}<a href="{{ category.url | relative_url }}">{{ category.title }}</a>{% endfor %}
</nav>
</section>
