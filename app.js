(async () => {
  const data = await (await fetch("assets/datos.json")).json();
  const $ = id => document.getElementById(id);
  const temas = data.temas, root = document.documentElement.style, A = "assets/";
  const allLogos = temas.flatMap(t => t.logos.map(l => `${A}logo/${t.k}__${l}.webp`));
  const allLados = temas.flatMap(t => t.lados.map(l => `${A}lado/${t.k}__${l}.webp`));
  let iL = 0, iR = 0;

  // destinos del flujo
  $("destinos").innerHTML = ["barra y widgets", "bordes de Hyprland", "kitty", "starship", "fastfetch", "rofi", "bloqueo", "login (SDDM)",
    "VS Code", "Spotify", "Obsidian", "Vesktop", "GTK / Qt", "carpetas Papirus", "Brave", "bot de Discord", "avatar"].map(d => `<span>${d}</span>`).join("");

  // probador
  const chips = $("chips");
  temas.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "chip"; b.type = "button"; b.id = "tema-" + t.k;
    b.innerHTML = `<i style="background:${t.c.blue}"></i>${t.n}`;
    b.onclick = () => pintar(i, true);
    chips.append(b);
  });

  function pintar(i, scroll) {
    const t = temas[i], c = t.c;
    const set = { "--base": c.base, "--mantle": c.mantle, "--crust": c.crust, "--text": c.text, "--sub": c.subtext0,
      "--s0": c.surface0, "--s1": c.surface1, "--acc": c.blue, "--mauve": c.mauve, "--pink": c.pink };
    for (const k in set) root.setProperty(k, set[k]);
    chips.querySelectorAll(".chip").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
    if (scroll) chips.children[i].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    const f = $("fondo"); f.src = `${A}clip/${t.k}.mp4`; f.poster = `${A}poster/${t.k}.webp`; f.play().catch(() => {});
    $("lockBg").src = `${A}poster/${t.k}.webp`;
    $("nomTema").textContent = t.n + (t.serie ? ` · ${t.serie}` : ""); $("ffTema").textContent = t.n;
    $("paleta").innerHTML = ["base", "surface1", "blue", "sapphire", "mauve", "pink", "peach", "yellow", "green", "teal", "red", "text"]
      .map(k => `<i style="background:${c[k]}" data-hex="${c[k]}" title="${k} ${c[k]}"></i>`).join("");
    $("ffDots").innerHTML = ["red", "green", "yellow", "blue", "mauve", "teal", "pink", "text"].map(k => `<span style="color:${c[k]}">●</span>`).join(" ");
    const propio = t.logos.length ? `${A}logo/${t.k}__${t.logos[0]}.webp` : null;
    const lado = t.lados.find(l => l !== "video") || "video";
    iL = Math.max(0, allLogos.indexOf(propio)); $("ffLogo").src = propio || allLogos[0];
    $("rofiImg").src = `${A}lado/${t.k}__${lado}.webp`; iR = Math.max(0, allLados.indexOf($("rofiImg").getAttribute("src")));
    const av = propio || `${A}lado/${t.k}__video.webp`;
    ["lockAv", "dcAv", "dcIcon", "rpImg"].forEach(id => $(id).src = av);
    $("dcTitulo").textContent = `✦ nuevo tema: ${t.n}`;
    $("rpDet").textContent = `${t.n} · Arch + Hyprland`;
    $("dcCard").src = t.tarjeta ? `${A}tarjeta/${t.k}.webp` : `${A}poster/${t.k}.webp`;
    try { localStorage.setItem("nuvix-tema", t.k) } catch (e) {}
  }
  $("ffLogo").onclick = () => { iL = (iL + 1) % allLogos.length; $("ffLogo").src = allLogos[iL] };
  $("rofiImg").onclick = () => { iR = (iR + 1) % allLados.length; $("rofiImg").src = allLados[iR] };

  let ini = temas.findIndex(t => t.n === "Lain Wired");
  try { const j = temas.findIndex(t => t.k === localStorage.getItem("nuvix-tema")); if (j >= 0) ini = j } catch (e) {}
  pintar(Math.max(ini, 0), false);

  // galería
  const gal = $("gal"), series = ["Todas", ...new Set(temas.map(t => t.serie).filter(Boolean))];
  function verGal(s) {
    gal.innerHTML = "";
    temas.forEach((t, i) => {
      if (s !== "Todas" && t.serie !== s) return;
      const b = document.createElement("button");
      b.className = "tarj"; b.type = "button";
      const tipo = t.escena ? "escena WE" : t.ws ? "video WE" : "video";
      b.innerHTML = `<div class="vid"><img loading="lazy" src="${A}poster/${t.k}.webp" alt=""><video muted loop playsinline preload="none" data-src="${A}clip/${t.k}.mp4"></video></div>
        <div class="inf"><div class="nm"><b>${t.n}</b><span class="tag">${tipo}</span></div>
        <small>${t.serie || "—"}${t.ws ? ` · <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=${t.ws}" onclick="event.stopPropagation()">Workshop</a>` : ""} · ${t.logos.length} retratos</small>
        <div class="mini">${["base", "blue", "mauve", "pink", "peach", "green", "teal"].map(k => `<i style="background:${t.c[k]}"></i>`).join("")}</div></div>`;
      const v = b.querySelector("video");
      const on = () => { if (!v.src) v.src = v.dataset.src; v.play().then(() => b.classList.add("play")).catch(() => {}) };
      const off = () => { v.pause(); b.classList.remove("play") };
      b.addEventListener("mouseenter", on); b.addEventListener("mouseleave", off);
      b.addEventListener("focus", on); b.addEventListener("blur", off);
      b.onclick = () => { pintar(i, true); $("probador").scrollIntoView({ behavior: "smooth" }) };
      gal.append(b);
    });
    $("series").querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.s === s));
  }
  series.forEach(s => { const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.dataset.s = s;
    b.textContent = s === "Todas" ? `Todas · ${temas.length}` : `${s} · ${temas.filter(t => t.serie === s).length}`; b.onclick = () => verGal(s); $("series").append(b) });
  verGal("Todas");

  // stickers
  const st = data.stickers, pjs = ["Todos", ...new Set(st.map(x => x.pj))];
  function verSt(pj) {
    $("stk").innerHTML = st.filter(x => pj === "Todos" || x.pj === pj).map(x =>
      `<div class="st"><img loading="lazy" src="${A}sticker/${x.n}-${x.slug}.webp" alt="${x.slug}">:${x.slug.replace(/-/g, "_")}:</div>`).join("");
    $("filtros").querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.pj === pj));
  }
  pjs.forEach(p => { const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.dataset.pj = p;
    b.textContent = p === "Todos" ? `Todos · ${st.length}` : `${p} · ${st.filter(x => x.pj === p).length}`; b.onclick = () => verSt(p); $("filtros").append(b) });
  verSt("Todos");
})();
