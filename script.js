// 60년짜리 시계 = 작은 행성. 어린왕자는 살아온 만큼 테두리를 돌고, 장미는 12시에 있다.
// 생일과 수명은 <body data-birth="YYYY-MM-DD" data-span="60">에서 바꾼다.
(function () {
  const SVG = "http://www.w3.org/2000/svg";
  const DAY = 86400000;
  const body = document.body;
  const BIRTH = body.dataset.birth || "2000-01-01";
  const SPAN = Number(body.dataset.span) || 60;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function svg(tag, attrs, parent) {
    const n = document.createElementNS(SVG, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function polar(cx, cy, r, frac) {
    const a = frac * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (n) => n.toLocaleString("ko-KR");

  function lifeStats(at) {
    const b = new Date(BIRTH + "T00:00:00");
    const end = new Date(b);
    end.setFullYear(b.getFullYear() + SPAN);
    const total = end - b;
    const elapsed = Math.min(Math.max((at || Date.now()) - b, 0), total);
    const left = total - elapsed;
    return {
      fraction: elapsed / total,
      yearsElapsed: (elapsed / total) * SPAN,
      yearsLeft: Math.floor((left / total) * SPAN),
      daysLived: Math.floor(elapsed / DAY),
      daysLeft: Math.floor(left / DAY),
      h: Math.floor((left % DAY) / 3600000),
      m: Math.floor((left % 3600000) / 60000),
      s: Math.floor((left % 60000) / 1000),
    };
  }

  // 어린왕자: 발이 (0,0), 머리는 -y 방향. 목도리는 +x로 날린다.
  function drawPrince(parent, transform) {
    const g = svg("g", { class: "figure", transform }, parent);
    svg("circle", { cx: 0, cy: -31, r: 4.5, class: "solid" }, g);
    svg("path", { class: "solid", d: "M-3.5 -25 L3.5 -25 L7 -7 L-7 -7 Z" }, g);
    svg("path", { d: "M-2.5 -7 L-2.5 0 M2.5 -7 L2.5 0" }, g);
    svg("path", { class: "scarf", d: "M2 -25 C 10 -27, 15 -22, 24 -27" }, g);
    return g;
  }

  function drawRose(parent, transform) {
    const g = svg("g", { class: "rose", transform }, parent);
    svg("path", { class: "rose-stem", d: "M0 0 L0 -14 M0 -7 L4 -9" }, g);
    svg("circle", { cx: 0, cy: -17, r: 3.5, class: "rose-bloom" }, g);
    return g;
  }

  // ---------- 하늘: 페이지 전체에 고정된 별. 반짝이지 않는다. ----------
  const sky = document.querySelector("canvas.sky");
  if (sky) {
    const ctx = sky.getContext("2d");
    function paint() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth, h = Math.max(window.innerHeight, document.documentElement.scrollHeight);
      sky.width = w * dpr;
      sky.height = h * dpr;
      sky.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      let seed = 20041220;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const faint = getComputedStyle(body).getPropertyValue("--ink-faint").trim();
      const bright = getComputedStyle(body).getPropertyValue("--star").trim();
      const count = Math.floor((w * h) / 14000);
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, 0.5 + rnd() * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = faint;
        ctx.fill();
      }
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = bright;
        ctx.fill();
      }
    }
    paint();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(paint, 150); });
  }

  // ---------- 인생 시계 ----------
  const clock = document.getElementById("life-clock");
  if (clock) {
    const cx = 160, cy = 160, R = 140;
    const root = svg("svg", { viewBox: "0 0 320 320", role: "img" });
    clock.prepend(root);

    svg("circle", { cx, cy, r: R, class: "clock-track" }, root);
    const arc = svg("path", { class: "clock-elapsed" }, root);
    for (let i = 0; i < SPAN; i++) {
      const decade = i % 10 === 0;
      const [x1, y1] = polar(cx, cy, R - (decade ? 14 : 7), i / SPAN);
      const [x2, y2] = polar(cx, cy, R - 2, i / SPAN);
      svg("line", { x1, y1, x2, y2, class: decade ? "clock-tick is-decade" : "clock-tick" }, root);
      if (decade) {
        const [x, y] = polar(cx, cy, R - 28, i / SPAN);
        svg("text", { x, y, class: "clock-num", "text-anchor": "middle", "dominant-baseline": "central" }, root).textContent = i;
      }
    }
    drawRose(root, `translate(${cx} ${cy - R})`);
    const prince = drawPrince(root, "");

    const years = clock.querySelector(".clock-years");
    const live = clock.querySelector(".clock-live");
    const range = document.getElementById("life-range");
    if (range) {
      const b = new Date(BIRTH + "T00:00:00");
      const d = (y) => `${y.getFullYear()}.${pad(y.getMonth() + 1)}.${pad(y.getDate())}`;
      const end = new Date(b);
      end.setFullYear(b.getFullYear() + SPAN);
      range.textContent = `${d(b)} — ${d(end)}`;
    }

    function draw() {
      const st = lifeStats();
      const f = Math.min(st.fraction, 0.99999);
      const [ax, ay] = polar(cx, cy, R, 0);
      const [bx, by] = polar(cx, cy, R, f);
      arc.setAttribute("d", `M${ax} ${ay} A${R} ${R} 0 ${f > 0.5 ? 1 : 0} 1 ${bx} ${by}`);
      prince.setAttribute("transform", `rotate(${f * 360} ${cx} ${cy}) translate(${cx} ${cy - R})`);
      years.textContent = st.yearsLeft;
      live.textContent = `${fmt(st.daysLeft)}일 ${pad(st.h)}:${pad(st.m)}:${pad(st.s)}`;
      root.setAttribute("aria-label", `${SPAN}년 중 ${st.yearsElapsed.toFixed(1)}년 지남, ${st.yearsLeft}년 남음`);
      return st;
    }

    const st = draw();
    setInterval(draw, reduceMotion ? 60000 : 1000);

    // 처음 한 번, 지나온 호가 그려진다.
    if (reduceMotion) {
      clock.classList.add("is-ready");
    } else {
      const len = arc.getTotalLength();
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        arc.style.strokeDashoffset = 0;
        clock.classList.add("is-ready");
        setTimeout(() => { arc.style.strokeDasharray = ""; arc.style.strokeDashoffset = ""; }, 2000);
      }));
    }

    // ---------- 60년, 한 줄에 열 개 ----------
    const grid = document.getElementById("life-grid");
    if (grid) {
      const now = Math.floor(st.yearsElapsed);
      for (let i = 0; i < SPAN; i++) {
        const cell = document.createElement("span");
        if (i < now) cell.className = "is-spent";
        else if (i === now) cell.className = "is-now";
        grid.appendChild(cell);
      }
      grid.setAttribute("aria-label", `${SPAN}년 중 ${now}년 지남`);
      const label = document.getElementById("life-grid-label");
      if (label) label.textContent = `YEAR ${now + 1} / ${SPAN}`;
      const stat = document.getElementById("life-grid-stat");
      if (stat) stat.textContent = `${fmt(st.daysLived)}일 살았고, ${fmt(st.daysLeft)}일 남았다. ${(st.fraction * 100).toFixed(1)}%.`;
    }
  }

  // ---------- 글 날짜 옆에: 인생 몇 번째 해에 쓴 글인지 ----------
  document.querySelectorAll(".post-header time[datetime]").forEach((t) => {
    const at = new Date(t.getAttribute("datetime") + "T00:00:00").getTime();
    const year = Math.floor(lifeStats(at).yearsElapsed) + 1;
    const s = document.createElement("span");
    s.className = "life-year";
    s.textContent = ` · ${year}번째 해`;
    t.after(s);
  });

  // ---------- 땅: 페이지 끝의 행성 지평선, 장미 하나 ----------
  document.querySelectorAll("svg.horizon").forEach((root) => {
    function paint() {
      root.innerHTML = "";
      const W = root.clientWidth || 960, H = root.clientHeight || 240;
      root.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const pr = Math.max(W * 0.8, 480), crest = H - 96;
      svg("circle", { cx: W / 2, cy: crest + pr, r: pr, class: "planet-body" }, root);
      const dx = 72;
      const y = crest + pr - Math.sqrt(pr * pr - dx * dx);
      drawRose(root, `translate(${W / 2 + dx} ${y + 1})`);
    }
    paint();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(paint, 150); });
  });
})();
