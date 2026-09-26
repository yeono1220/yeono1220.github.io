// 60년짜리 시계와 작은 행성.
// 생일은 index.html의 data-birth="YYYY-MM-DD"에서 바꾸세요. 수명은 data-span (기본 60).
(function () {
  const SVG = "http://www.w3.org/2000/svg";
  const DAY = 86400000;
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

  function lifeStats(birth, span) {
    const b = new Date(birth + "T00:00:00");
    const end = new Date(b);
    end.setFullYear(b.getFullYear() + span);
    const total = end - b;
    const elapsed = Math.min(Math.max(Date.now() - b, 0), total);
    const left = total - elapsed;
    return {
      fraction: elapsed / total,
      yearsElapsed: (elapsed / total) * span,
      yearsLeft: Math.floor((left / total) * span),
      daysLeft: Math.floor(left / DAY),
      h: Math.floor((left % DAY) / 3600000),
      m: Math.floor((left % 3600000) / 60000),
      s: Math.floor((left % 60000) / 1000),
    };
  }

  const pad = (n) => String(n).padStart(2, "0");

  // ---------- life clock ----------
  const clock = document.getElementById("life-clock");
  if (clock) {
    const birth = clock.dataset.birth;
    const span = Number(clock.dataset.span) || 60;
    const cx = 160, cy = 160, R = 140;
    const root = svg("svg", { viewBox: "0 0 320 320", role: "img" });
    clock.prepend(root);

    svg("circle", { cx, cy, r: R, class: "clock-track" }, root);
    const arc = svg("path", { class: "clock-elapsed" }, root);
    for (let i = 0; i < span; i++) {
      const decade = i % 10 === 0;
      const [x1, y1] = polar(cx, cy, R - (decade ? 14 : 7), i / span);
      const [x2, y2] = polar(cx, cy, R - 2, i / span);
      svg("line", { x1, y1, x2, y2, class: decade ? "clock-tick is-decade" : "clock-tick" }, root);
      if (decade) {
        const [x, y] = polar(cx, cy, R - 28, i / span);
        svg("text", { x, y, class: "clock-num", "text-anchor": "middle", "dominant-baseline": "central" }, root).textContent = i;
      }
    }
    const hand = svg("line", { x1: cx, y1: cy, class: "clock-hand" }, root);
    svg("circle", { cx, cy, r: 3, class: "clock-pin" }, root);

    const years = clock.querySelector(".clock-years");
    const live = clock.querySelector(".clock-live");
    const grid = document.getElementById("life-grid");
    const gridLabel = document.getElementById("life-grid-label");

    function draw() {
      const st = lifeStats(birth, span);
      const f = Math.min(st.fraction, 0.99999);
      const [ax, ay] = polar(cx, cy, R, 0);
      const [bx, by] = polar(cx, cy, R, f);
      arc.setAttribute("d", `M${ax} ${ay} A${R} ${R} 0 ${f > 0.5 ? 1 : 0} 1 ${bx} ${by}`);
      const [hx, hy] = polar(cx, cy, R - 44, f);
      hand.setAttribute("x2", hx);
      hand.setAttribute("y2", hy);
      years.textContent = st.yearsLeft;
      live.textContent = `${st.daysLeft.toLocaleString("ko-KR")}일 ${pad(st.h)}:${pad(st.m)}:${pad(st.s)}`;
      root.setAttribute("aria-label", `${span}년 중 ${st.yearsElapsed.toFixed(1)}년 지남`);
      return st;
    }

    const st = draw();
    setInterval(draw, reduceMotion ? 60000 : 1000);

    // ---------- life grid: 60 years, ten to a row ----------
    if (grid) {
      const now = Math.floor(st.yearsElapsed);
      for (let i = 0; i < span; i++) {
        const cell = document.createElement("span");
        if (i < now) cell.className = "is-spent";
        else if (i === now) cell.className = "is-now";
        grid.appendChild(cell);
      }
      grid.setAttribute("aria-label", `${span}년 중 ${now}년 지남`);
      if (gridLabel) gridLabel.textContent = `YEAR ${now + 1} / ${span}`;
    }
  }

  // ---------- planet horizon ----------
  document.querySelectorAll(".planet").forEach((root) => {
    const W = 960, H = 320;
    root.setAttribute("viewBox", `0 0 ${W} ${H}`);
    root.setAttribute("preserveAspectRatio", "xMidYMid slice");
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 28; i++) {
      svg("circle", { cx: rnd() * W, cy: rnd() * H, r: 0.6 + rnd() * 0.9, class: "star" }, root);
    }
    svg("circle", { cx: W * 0.78, cy: H * 0.22, r: 2.5, class: "star is-bright" }, root);

    // 작은 행성 하나가 통째로 떠 있다. 사람은 꼭대기에, 장미는 조금 옆 비탈에.
    const pcx = W / 2, pcy = 200, pr = 80;
    svg("circle", { cx: pcx, cy: pcy, r: pr, class: "planet-body" }, root);
    const onPlanet = (dx) => {
      const deg = (Math.asin(dx / pr) * 180) / Math.PI;
      return `rotate(${deg} ${pcx} ${pcy}) translate(${pcx} ${pcy - pr})`;
    };

    const g = svg("g", { class: "figure", transform: onPlanet(-14) }, root);
    svg("circle", { cx: 0, cy: -31, r: 4.5, class: "solid" }, g);
    svg("path", { class: "solid", d: "M-3.5 -25 L3.5 -25 L7 -7 L-7 -7 Z" }, g);
    svg("path", { d: "M-2.5 -7 L-2.5 0 M2.5 -7 L2.5 0" }, g);
    svg("path", { class: "scarf", d: "M2 -25 C 10 -27, 15 -22, 24 -27" }, g);

    const r = svg("g", { transform: onPlanet(36) }, root);
    svg("path", { class: "rose-stem", d: "M0 0 L0 -14 M0 -7 L4 -9" }, r);
    svg("circle", { cx: 0, cy: -17, r: 3.5, class: "rose-bloom" }, r);
  });
})();
