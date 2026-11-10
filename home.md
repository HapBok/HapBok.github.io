---
layout: default
title: 홈
permalink: /home/
description: 보안과 개발을 공부하며 배운 내용과 시행착오를 남기는 HapBok의 기록 공간입니다.
---

{% include home/intro.html %}
{% include home/latest-notes.html %}
<section class="home-topics" aria-labelledby="topics-title">
<h2 id="topics-title">주제별로</h2>
<nav class="home-topic-links" aria-label="주제별 기록">
{% for category in site.data.categories %}<a href="{{ category.url | relative_url }}">{{ category.title }}</a>{% endfor %}
</nav>
</section>
<section class="home-about" id="about" aria-labelledby="about-title">
<div><p class="eyebrow">이 공간에 대해</p><h2 id="about-title">결과보다, 이해한 과정을 남깁니다.</h2>
<p>취약점 분석과 Offensive Security에 관심을 두고 보안과 개발을 공부하고 있습니다. 문제를 풀며 막힌 지점, 구현하면서 배운 점, 읽고 이해한 내용을 정리합니다.</p>
<p>무엇을 했는지뿐 아니라 왜 그렇게 동작하는지, 어떤 방법으로 확인했는지를 설명하려 합니다. 처음 접하는 사람도 따라갈 수 있는 글을 쓰는 것이 목표입니다.</p></div>
<div class="home-about-pets"><h3>Happy + Boksoon = HapBok</h3><p>함께하는 두 강아지, 해피와 복순이의 이름을 합쳤습니다. 흰 말티즈 해피는 H, 큰 귀가 매력인 요크셔테리어 복순이는 B입니다.</p>{% include character.html name="reading" class="about-character" %}</div>
</section>
