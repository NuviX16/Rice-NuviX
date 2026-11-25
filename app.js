(async () => {
  const datos = await (await fetch("assets/datos.json?v=2")).json();
  const $ = id => document.getElementById(id);
  const temas = datos.temas, raiz = document.documentElement.style, A = "assets/";

  // escala del escenario (diseñado a 1280x720)
  const caja = document.querySelector(".escena-caja"), escena = $("escena");
  const escalar = () => { escena.style.transform = `scale(${caja.clientWidth / 1280})` };
  new ResizeObserver(escalar).observe(caja); escalar();

  // vistas
  document.querySelectorAll(".vistas button").forEach(b => b.onclick = () => {
    escena.dataset.v = b.dataset.v;
    document.querySelectorAll(".vistas button").forEach(x => x.setAttribute("aria-selected", x === b));
  });

  // reloj real en la barra y el bloqueo
  const reloj = () => {
    const d = new Date();
    $("barraHora").textContent = d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
    document.querySelector(".bloqueo .hora").textContent = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
    document.querySelector(".bloqueo .fecha").textContent = d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  };
  reloj(); setInterval(reloj, 30000);

  // tira de temas
  const tira = $("tira");
  temas.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "mini"; b.type = "button"; b.setAttribute("role", "option"); b.id = "t-" + t.k;
    b.innerHTML = `<img loading="lazy" src="${A}poster/${t.k}.webp" alt=""><span>${t.n}</span>`;
    b.onclick = () => pintar(i, true);
    tira.append(b);
  });

  let rotar;
  function pintar(i, centrar) {
    const t = temas[i], c = t.c;
    const v = { "--fondo": c.crust, "--fondo-2": c.mantle, "--texto": c.text, "--tenue": c.subtext0, "--acento": c.blue,
      "--acento-2": c.pink, "--malva": c.mauve, "--base": c.base, "--s1": c.surface1 };
    for (const k in v) raiz.setProperty(k, v[k]);
    document.querySelector('meta[name="theme-color"]').content = c.crust;
    tira.querySelectorAll(".mini").forEach((b, j) => b.setAttribute("aria-selected", j === i));

    const f = $("escFondo"); f.src = `${A}clip/${t.k}.mp4`; f.poster = `${A}poster/${t.k}.webp`; f.play().catch(() => {});
    $("temaNom").textContent = t.n; $("ffTema").textContent = t.n; $("barraTema").title = t.n;
    $("temaSerie").textContent = [t.serie, t.escena ? "escena de Wallpaper Engine" : t.ws ? "video de Wallpaper Engine" : "video"].filter(Boolean).join(" · ");
    $("paleta").innerHTML = ["base", "surface1", "blue", "sapphire", "mauve", "pink", "peach", "yellow", "green", "teal", "red", "text"]
      .map(k => `<li><i style="background:${c[k]}"></i><span>${c[k]}</span></li>`).join("");
    $("ffDots").innerHTML = ["red", "green", "yellow", "blue", "mauve", "teal", "pink", "text"].map(k => `<span style="color:${c[k]}">●</span>`).join(" ");

    // retratos del tema (fastfetch rota entre ellos); si no tiene, cuadro del video
    const logos = t.logos.length ? t.logos.map(l => `${A}logo/${t.k}__${l}.webp`) : [`${A}lado/${t.k}__video.webp`];
    const lados = t.lados.map(l => `${A}lado/${t.k}__${l}.webp`);
    let n = 0;
    const poner = () => { $("ffLogo").src = logos[n % logos.length]; $("rofiImg").src = lados[n % lados.length]; n++ };
    poner(); clearInterval(rotar); rotar = setInterval(poner, 4000);
    ["lockAv", "dcAv"].forEach(id => $(id).src = logos[0]);
    $("dcTitulo").textContent = `✦ nuevo tema: ${t.n}`;
    $("dcCard").src = t.tarjeta ? `${A}tarjeta/${t.k}.webp` : `${A}poster/${t.k}.webp`;
    try { localStorage.setItem("nuvix-tema", t.k) } catch (e) {}
  }

  let ini = temas.findIndex(t => t.n === "Lain Wired");
  try { const j = temas.findIndex(t => t.k === localStorage.getItem("nuvix-tema")); if (j >= 0) ini = j } catch (e) {}
  pintar(Math.max(ini, 0), false);

  // destinos como texto grande
  $("destinos").innerHTML = ["barra", "bordes", "kitty", "starship", "fastfetch", "rofi", "bloqueo", "login", "VS Code", "Spotify",
    "Obsidian", "Vesktop", "GTK", "Qt", "carpetas", "Brave", "bot de Discord"].map(d => `<b>${d}</b>`).join(" / ");

  // temas por serie
  const series = [...new Set(temas.map(t => t.serie || "Otros"))];
  $("series").innerHTML = series.map(s => {
    const ts = temas.filter(t => (t.serie || "Otros") === s);
    return `<div class="serie"><h3>${s}<small>${ts.length} ${ts.length === 1 ? "tema" : "temas"}</small></h3><div class="serie-grid">${ts.map(t =>
      `<button class="carta" type="button" data-i="${temas.indexOf(t)}"><img loading="lazy" src="${A}poster/${t.k}.webp" alt="">
        <video muted loop playsinline preload="none" data-src="${A}clip/${t.k}.mp4"></video><i class="tira-color" style="background:${t.c.blue}"></i>
        <span>${t.n}<small>${t.escena ? "escena" : "video"}</small></span></button>`).join("")}</div></div>`;
  }).join("");
  document.querySelectorAll(".carta").forEach(b => {
    const v = b.querySelector("video");
    const on = () => { if (!v.src) v.src = v.dataset.src; v.play().then(() => b.classList.add("play")).catch(() => {}) };
    const off = () => { v.pause(); b.classList.remove("play") };
    b.addEventListener("mouseenter", on); b.addEventListener("mouseleave", off);
    b.addEventListener("focus", on); b.addEventListener("blur", off);
    b.onclick = () => { pintar(+b.dataset.i, true); $("escritorio").scrollIntoView({ behavior: "smooth" }) };
  });

  // stickers sueltos, girados al azar (fijo por sticker)
  $("mesa").innerHTML = datos.stickers.map((s, i) =>
    `<img loading="lazy" src="${A}sticker/${s.n}-${s.slug}.webp" alt=":${s.slug.replace(/-/g, "_")}:" title=":${s.slug.replace(/-/g, "_")}:" style="--r:${((i * 37) % 17) - 8}deg">`).join("");
})();
