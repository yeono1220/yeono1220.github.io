// 글 목록과 본문. posts/index.json + posts/<slug>.md 를 읽어 그린다.
// 편집은 write.html 에서 (GitHub API로 저장).
window.Posts = (function () {
  const REPO = { owner: "yeono1220", repo: "yeono1220.github.io", branch: "main" };
  const base = document.body.dataset.root || "";

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtDate = (iso) => iso.replace(/-/g, ".");

  // 작은 마크다운: 문단, #/## 제목, > 인용, - 목록, **굵게**, *기울임*, `코드`, [링크](url), 빈 줄로 문단 구분.
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function markdown(md) {
    const out = [];
    md.replace(/\r/g, "").split(/\n{2,}/).forEach((block) => {
      const b = block.trim();
      if (!b) return;
      if (/^#{1,3} /.test(b)) { const n = b.match(/^#+/)[0].length + 1; out.push(`<h${n}>${inline(b.replace(/^#+ /, ""))}</h${n}>`); }
      else if (/^> /.test(b)) out.push(`<blockquote>${inline(b.replace(/^> ?/gm, "").replace(/\n/g, " "))}</blockquote>`);
      else if (/^- /.test(b)) out.push(`<ul>${b.split("\n").map((l) => `<li>${inline(l.replace(/^- /, ""))}</li>`).join("")}</ul>`);
      else if (/^---+$/.test(b)) out.push("<hr>");
      else out.push(`<p>${inline(b).replace(/\n/g, "<br>")}</p>`);
    });
    return out.join("\n");
  }

  async function list() {
    const r = await fetch(base + "posts/index.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("index.json " + r.status);
    const posts = await r.json();
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function row(p) {
    return `<a class="post-row" href="${base}post.html?p=${encodeURIComponent(p.slug)}">
  <time datetime="${p.date}">${fmtDate(p.date)}</time>
  <h3>${esc(p.title)}</h3>${p.excerpt ? `\n  <p>${esc(p.excerpt)}</p>` : ""}
</a>`;
  }

  async function renderList(el, limit) {
    try {
      const posts = await list();
      el.innerHTML = (limit ? posts.slice(0, limit) : posts).map(row).join("\n");
    } catch (e) {
      el.innerHTML = `<p class="lead-text">글을 불러오지 못했다. ${esc(e.message)}</p>`;
    }
  }

  async function renderPost(el) {
    const slug = new URLSearchParams(location.search).get("p");
    const posts = await list();
    const p = posts.find((x) => x.slug === slug);
    if (!p) { el.innerHTML = '<p class="lead-text">그런 글은 없다.</p>'; return null; }
    const r = await fetch(`${base}posts/${encodeURIComponent(slug)}.md`, { cache: "no-cache" });
    const md = r.ok ? await r.text() : "";
    document.title = `${p.title} · 고연오`;
    el.innerHTML = `<header class="post-header">
  <time datetime="${p.date}">${fmtDate(p.date)}</time>
  <h1>${esc(p.title)}</h1>
</header>
<div class="post-body">${markdown(md)}</div>
<p class="post-edit"><a class="label" href="${base}write.html?p=${encodeURIComponent(slug)}">수정</a></p>`;
    if (window.ivLabelDates) window.ivLabelDates(el);
    return p;
  }

  return { REPO, list, markdown, renderList, renderPost, fmtDate, esc };
})();
