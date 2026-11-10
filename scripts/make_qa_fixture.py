"""Build an isolated content fixture; never adds test posts to the real _posts."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
target = root / "tmp" / "qa-site"
if target.exists():
    raise SystemExit("Fixture already exists; keep it for inspection or choose a new tmp directory.")
shutil.copytree(root, target, ignore=shutil.ignore_patterns(".git", "_site", "tmp", "docs", "tmp-*.log"))
post = target / "_posts/development/2026-11-01-interaction-fixture.md"
post.parent.mkdir(parents=True, exist_ok=True)
text = """---
layout: post
title: "브라우저 검증용 글"
date: 2026-11-01
categories: [development]
tags: [qa]
description: "공개하지 않는 임시 검증 자료"
---
## 같은 제목
긴 한글 문단과 목차를 검증하는 임시 글입니다.

"""
text += ("내용과 설명이 충분히 긴 상태에서도 가독성과 스크롤 위치 표시를 확인합니다. " * 22 + "\n\n") * 5
text += """### 하위 제목
본문 전용 검색어 ONLYINBODY.

~~~js
const hello = "<script>alert('not executed')</script>";
console.log(hello);
~~~

| 항목 | 설명 |
| --- | --- |
| 표 | 가로 넘침 확인 |

![노트를 보는 두 아이](/assets/images/characters/reading.png)

## 같은 제목
중복 제목의 고유 앵커를 확인합니다.

"""
text += ("다른 절에서도 목차가 해당 제목에 맞게 바뀌어야 합니다. " * 22 + "\n\n") * 4
text += """## 마지막 제목
마지막 절을 확인합니다.
"""
post.write_text(text, encoding="utf-8")
(target / "_posts/development/2026-11-02-short-fixture.md").write_text("""---
layout: post
title: 제목 없는 짧은 글
date: 2026-11-02
categories: [development]
---
목차에 들어갈 소제목이 없는 글입니다.
""", encoding="utf-8")
print(target)
