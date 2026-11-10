"""Validate generated Jekyll routes, local assets, anchors and search data."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
routes = ["/", "/home/", "/notes/", "/about/", "/development/", "/ctf-wargame/",
          "/bug-bounty/", "/blog-docs/", "/analysis-conference/",
          "/contest-certificate/", "/posts/github-pages-blog-structure/", "/404.html"]

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], []
        self.h1 = 0
        self.font_preload = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "h1":
            self.h1 += 1
        for name in ("href", "src"):
            if attrs.get(name):
                self.links.append(attrs[name])
        if tag == "link" and attrs.get("as") == "font":
            self.font_preload = True

def path_for(url, current):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        return None, ""
    raw = unquote(parsed.path)
    target = root / raw.lstrip("/") if raw.startswith("/") else current.parent / raw
    if not raw:
        target = current
    if target.is_dir() or raw.endswith("/"):
        target /= "index.html"
    return target.resolve(), unquote(parsed.fragment)

failures = []
pages = {}
for file in root.rglob("*.html"):
    parser = Page()
    parser.feed(file.read_text(encoding="utf-8"))
    pages[file.resolve()] = parser
    if parser.h1 != 1:
        failures.append(f"{file.relative_to(root)}: expected one h1, found {parser.h1}")
    if len(set(parser.ids)) != len(parser.ids):
        failures.append(f"{file.relative_to(root)}: duplicate ids")
    if not parser.font_preload:
        failures.append(f"{file.relative_to(root)}: font preload missing")
for route in routes:
    target, _ = path_for(route, root / "index.html")
    if not target.is_file():
        failures.append(f"Missing route: {route}")
for file, page in pages.items():
    for url in page.links:
        target, fragment = path_for(url, file)
        if target is None:
            continue
        if not target.is_file():
            failures.append(f"{file.relative_to(root)}: missing {url}")
        elif fragment and target in pages and fragment not in pages[target].ids:
            failures.append(f"{file.relative_to(root)}: missing anchor {url}")
for css in (root / "assets/css").glob("*.css"):
    for url in re.findall(r'url\(["\']?([^"\')]+)', css.read_text(encoding="utf-8")):
        target, _ = path_for(url, css)
        if target and not target.is_file():
            failures.append(f"{css.relative_to(root)}: missing asset {url}")
posts = json.loads((root / "search.json").read_text(encoding="utf-8"))
for post in posts:
    target, _ = path_for(post["url"], root / "index.html")
    if not target.is_file() or not post["title"] or not post["content"]:
        failures.append(f"Invalid search entry: {post['url']}")
if not posts:
    failures.append("Existing post missing from search index")
font = root / "assets/fonts/pretendard/PretendardVariable.woff2"
if font.read_bytes()[:4] != b"wOF2":
    failures.append("Invalid Pretendard WOFF2")
for name in ["happy-sprite", "boksoon-sprite", "happy-neutral", "boksoon-neutral", "coding", "reading", "research",
             "resting", "terminal", "celebrating", "empty"]:
    if not (root / f"assets/images/characters/{name}.png").is_file():
        failures.append(f"Missing character: {name}")
if failures:
    print("\n".join(failures))
    sys.exit(1)
print(f"PASS: {len(pages)} pages; {len(routes)} required routes; {len(posts)} search entries; assets and anchors.")
