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

  // innerverse의 7분기 행성 색 (glass-momo/constants.ts BRANCH 와 같은 값)
  const BRANCH = {
    bloom: { tint: "#5fc88a", soul: "#7fe0a8" },
    calm: { tint: "#6f9ae8", soul: "#9ec8ff" },
    love: { tint: "#e87fb8", soul: "#f7b0d4" },
    wither: { tint: "#8a6f6a", soul: "#b08a82" },
    rage: { tint: "#e8744e", soul: "#f0946a" },
    tense: { tint: "#d99a4e", soul: "#f0b46a" },
    void: { tint: "#8a82a0", soul: "#b0aac4" },
  };
  const MOOD = BRANCH[body.dataset.mood] || BRANCH.calm;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

  // 글래스 모모: 달걀형 유리 바디 + 안에서 빛나는 영혼 코어 + 검은 점 눈. 발이 (0,0).
  function drawMomo(parent, transform) {
    const g = svg("g", { class: "momo", transform }, parent);
    const b = svg("g", { class: "momo-bob" }, g);
    svg("circle", { cx: 0, cy: -16, r: 22, class: "momo-aura" }, b);
    svg("ellipse", { cx: 0, cy: -16, rx: 12.5, ry: 15.5, class: "momo-body" }, b);
    svg("circle", { cx: 0, cy: -15, r: 9, class: "momo-soul" }, b);
    svg("ellipse", { cx: -4.5, cy: -24, rx: 3.2, ry: 4.6, class: "momo-shine" }, b);
    svg("circle", { cx: -4.2, cy: -14, r: 1.5, class: "momo-eye" }, b);
    svg("circle", { cx: 4.2, cy: -14, r: 1.5, class: "momo-eye" }, b);
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
    const defs = svg("defs", {}, root);
    const soulG = svg("radialGradient", { id: "soulG" }, defs);
    svg("stop", { offset: "0", "stop-color": MOOD.soul, "stop-opacity": 0.95 }, soulG);
    svg("stop", { offset: "0.55", "stop-color": MOOD.soul, "stop-opacity": 0.35 }, soulG);
    svg("stop", { offset: "1", "stop-color": MOOD.soul, "stop-opacity": 0 }, soulG);
    const shineG = svg("radialGradient", { id: "shineG", cx: "0.35", cy: "0.28", r: "0.6" }, defs);
    svg("stop", { offset: "0", "stop-color": "#ffffff", "stop-opacity": 0.55 }, shineG);
    svg("stop", { offset: "0.45", "stop-color": "#ffffff", "stop-opacity": 0.08 }, shineG);
    svg("stop", { offset: "1", "stop-color": "#ffffff", "stop-opacity": 0 }, shineG);
    const momoG = svg("radialGradient", { id: "momoSoulG" }, defs);
    svg("stop", { offset: "0", "stop-color": MOOD.soul, "stop-opacity": 1 }, momoG);
    svg("stop", { offset: "1", "stop-color": MOOD.soul, "stop-opacity": 0 }, momoG);

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
    // ---------- 행성: 정20면체를 한 번 나눈 80면, flat shading, 기울어진 축으로 천천히 돈다 ----------
    const globe = svg("g", { class: "globe", transform: `translate(${cx} ${cy})` }, root);
    svg("circle", { cx: 0, cy: 0, r: 104, class: "globe-atmo" }, globe);
    const soul = svg("circle", { cx: 0, cy: 0, r: 70, fill: "url(#soulG)", class: "globe-soul" }, globe);
    const faceLayer = svg("g", { class: "globe-faces" }, globe);
    svg("circle", { cx: 0, cy: 0, r: 92, fill: "url(#shineG)", class: "globe-shine" }, globe);
    (function () {
      const t = (1 + Math.sqrt(5)) / 2;
      let verts = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
      let faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
      const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
      verts = verts.map(norm);
      // 한 번 세분: 각 변의 중점을 구면으로 밀어낸다
      const mid = {}, next = [];
      const midpoint = (a, b) => {
        const k = a < b ? a + ":" + b : b + ":" + a;
        if (mid[k] == null) { mid[k] = verts.length; verts.push(norm([(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2, (verts[a][2] + verts[b][2]) / 2])); }
        return mid[k];
      };
      faces.forEach(([a, b, c]) => { const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a); next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); });
      faces = next;
      // 면마다 아주 약간 다른 높이 — 지형 같은 울퉁불퉁함
      let seed = 612;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const bump = faces.map(() => 0.992 + rnd() * 0.016);

      const RAD = 92, TILT = 0.42, LIGHT = norm([-0.55, -0.7, 0.45]);
      const polys = faces.map(() => svg("polygon", { class: "globe-face" }, faceLayer));
      // 면마다 감정색: 원래 법선 방향에 따라 세 가지 틴트(만개·평온·애정)가 대륙처럼 섞인다
      const TINTS = [hex(BRANCH.calm.tint), hex(BRANCH.bloom.tint), hex(BRANCH.love.tint), hex(BRANCH.tense.tint)];
      const faceTint = faces.map((f) => {
        const [a, b2, c2] = f.map((k) => verts[k]);
        const n = norm([a[0] + b2[0] + c2[0], a[1] + b2[1] + c2[1], a[2] + b2[2] + c2[2]]);
        const w = Math.sin(n[0] * 2.1 + 0.4) * Math.cos(n[1] * 2.6 - 0.3) + Math.sin(n[2] * 3.1 + n[0]) * 0.6;
        const k = ((w + 1.6) / 3.2) * (TINTS.length - 1);
        const i = Math.max(0, Math.min(TINTS.length - 2, Math.floor(k))), t2 = k - i;
        return TINTS[i].map((v, j) => v + (TINTS[i + 1][j] - v) * t2);
      });
      const mix = (a, b, k) => Math.round(a + (b - a) * k);
      function shade(tint, l) {
        const k = Math.max(0, Math.min(1, l));
        // 어두운 면은 틴트의 35%, 밝은 면은 흰색 쪽으로 30%
        const f = (v) => (k < 0.5 ? v * (0.35 + 0.65 * k * 2) : v + (255 - v) * ((k - 0.5) * 2) * 0.3);
        return `rgb(${Math.round(f(tint[0]))},${Math.round(f(tint[1]))},${Math.round(f(tint[2]))})`;
      }
      function frame(angle) {
        const ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(TILT), st = Math.sin(TILT);
        const rot = verts.map(([x, y, z]) => {
          const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; // y축 자전
          return [x1, y * ct - z1 * st, y * st + z1 * ct]; // 축 기울임
        });
        const order = [];
        faces.forEach((f, i) => {
          const [a, b, c] = f.map((k) => rot[k]);
          const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]);
          const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
          const nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
          const nl = Math.hypot(nx, ny, nz);
          if (nz <= 0) { polys[i].setAttribute("points", ""); return; }
          const light = 0.18 + 0.82 * Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / nl);
          const r = RAD * bump[i];
          polys[i].setAttribute("points", [a, b, c].map((v) => (v[0] * r).toFixed(1) + "," + (v[1] * r).toFixed(1)).join(" "));
          const col = shade(faceTint[i], light);
          polys[i].setAttribute("fill", col);
          polys[i].setAttribute("stroke", col);
          order.push([a[2] + b[2] + c[2], polys[i]]);
        });
        order.sort((p, q) => p[0] - q[0]).forEach(([, el]) => faceLayer.appendChild(el));
      }
      frame(0.6);
      if (!reduceMotion) {
        let last = 0;
        (function tick(now) {
          if (now - last > 40) { last = now; frame(0.6 + now / 60000); soul.setAttribute("opacity", 0.75 + 0.25 * Math.sin(now / 900)); } // 한 바퀴에 약 6분
          requestAnimationFrame(tick);
        })(0);
      }
    })();

    drawRose(root, `translate(${cx} ${cy - R})`);
    const momo = drawMomo(root, "");

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
      momo.setAttribute("transform", `rotate(${f * 360} ${cx} ${cy}) translate(${cx} ${cy - R})`);
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
  window.ivLabelDates = function (scope) {
    (scope || document).querySelectorAll(".post-header time[datetime]").forEach((t) => {
      if (t.nextElementSibling && t.nextElementSibling.classList.contains("life-year")) return;
      const at = new Date(t.getAttribute("datetime") + "T00:00:00").getTime();
      const year = Math.floor(lifeStats(at).yearsElapsed) + 1;
      const s = document.createElement("span");
      s.className = "life-year";
      s.textContent = ` · ${year}번째 해`;
      t.after(s);
    });
  };
  window.ivLabelDates();

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
