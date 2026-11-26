"use client";

import { useEffect, useRef } from "react";
import {
  createFallbackModel,
  createModelInstance,
  loadTravelModel,
} from "@/lib/travel-models";

const R_VIS = 2.65;

export function HeroBackground({
  align = "left",
  desktopLift = 1.5,
}: {
  align?: "left" | "right";
  desktopLift?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { FLAGS, makeFlagGeometry, makeFlagTexture, makeFallbackEarth }] = await Promise.all([
        import("three"),
        import("./flag-textures"),
      ]);
      if (disposed) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 9;

      const world = new THREE.Group();
      const BASE_TILT = 0;
      world.rotation.x = BASE_TILT;
      scene.add(world);

      const worldScroll = new THREE.Group();
      world.add(worldScroll);

      // ---------- Lights ----------
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const sun = new THREE.DirectionalLight(0xffffff, 2.0);
      sun.position.set(4, 3, 6);
      scene.add(sun);

      // ---------- Earth ----------
      const earthTilt = new THREE.Group();
      worldScroll.add(earthTilt);

      const earthMat = new THREE.MeshStandardMaterial({
        map: makeFallbackEarth(THREE),
        roughness: 0.85,
        metalness: 0,
      });
      const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 96, 96), earthMat);
      earthTilt.add(earth);

      const sources = [
        "/textures/earth.jpg",
        "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
      ];
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const tryLoad = (i: number) => {
        if (disposed || i >= sources.length) return;
        loader.load(sources[i], (tex) => {
          if (disposed) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          earthMat.map = tex;
          earthMat.needsUpdate = true;
        }, undefined, () => tryLoad(i + 1));
      };
      tryLoad(0);

      const atmosphereMat = new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: { uGlow: { value: 1 } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform float uGlow; varying vec3 vN; void main(){ float i = pow(0.74 - dot(vN, vec3(0.0, 0.0, 1.0)), 3.5); gl_FragColor = vec4(0.45, 0.8, 1.0, 1.0) * i * uGlow; }`,
      });
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.22, 48, 48), atmosphereMat);
      worldScroll.add(atmosphere);

      const heroAircraftGroup = new THREE.Group();
      worldScroll.add(heroAircraftGroup);
      const heroAircraft: any[] = [];

      // ---------- Constellations & Stars ----------
      const starCount = 800;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const r = 18 + Math.random() * 22;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        starPos[i * 3 + 2] = r * Math.cos(ph);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.65, depthWrite: false }));
      scene.add(stars);

      // ---------- The two flag orbits ----------
      const rings = [
        { r: 2.32, rot: [0, 0.55, Math.PI / 2 + 0.12], speed: 0.08, count: 17 },
        { r: 2.52, rot: [0, 0, 0.3], speed: 0.08, count: 20 },
      ];

      const spinners: { g: any; speed: number }[] = [];
      const textures: any[] = [];
      const flagMaterials: any[] = [];

      rings.forEach((ring, ri) => {
        const tiltGroup = new THREE.Group();
        tiltGroup.rotation.set(ring.rot[0], ring.rot[1], ring.rot[2]);
        worldScroll.add(tiltGroup);
        const spinner = new THREE.Group();
        tiltGroup.add(spinner);
        spinners.push({ g: spinner, speed: ring.speed });

        const pts: any[] = [];
        for (let i = 0; i <= 180; i++) {
          const a = (i / 180) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * ring.r, 0, Math.sin(a) * ring.r));
        }
        tiltGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8ee3d6, transparent: true, opacity: 0.4 })));

        const w = ((2 * Math.PI * ring.r) / ring.count) * 1.01;
        const h = w * 0.62;

        for (let i = 0; i < ring.count; i++) {
          const def = FLAGS[(i + ri * 11) % FLAGS.length];
          const tex = makeFlagTexture(THREE, def);
          textures.push(tex);
          const geo = makeFlagGeometry(THREE, w, h);
          const flagFace = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.48, metalness: 0.04, emissive: new THREE.Color(0x0d1f38), emissiveIntensity: 0.12 });
          flagMaterials.push(flagFace);
          const flagEdge = new THREE.MeshStandardMaterial({ color: 0x102f4d, roughness: 0.38, metalness: 0.12 });
          const mesh = new THREE.Mesh(geo, [flagEdge, flagEdge, flagEdge, flagEdge, flagFace, flagFace]);
          const a = (i / ring.count) * Math.PI * 2;
          const anchor = new THREE.Group();
          anchor.position.set(Math.cos(a) * ring.r, 0, Math.sin(a) * ring.r);
          anchor.rotation.y = Math.PI / 2 - a;
          anchor.add(mesh);
          spinner.add(anchor);
        }
      });

      // ---------- Layout ----------
      const layout = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        // Keep flags at their natural spacing. Scaling the plates up on
        // desktop made neighbours overlap and look broken, so desktop only
        // gets a stronger emissive lift for readability. The orbits sit just
        // outside the atmosphere now, so no plate is swallowed by the globe.
        const desktop = w >= 1024;
        flagMaterials.forEach((material) => { material.emissiveIntensity = desktop ? 0.32 : 0.12; });

        const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const vw = vh * camera.aspect;
        const FIT = 6.2;

        if (w >= 1024) {
          const hostRect = host.getBoundingClientRect();
          const content = host.closest("section")?.querySelector<HTMLElement>("[data-hero-content]");
          let freeLeft = align === "right" ? w * 0.5 : 0;
          let freeRight = align === "right" ? w : w * 0.5;
          if (content) {
            const r = content.getBoundingClientRect();
            if (align === "right") { freeLeft = r.right - hostRect.left; freeRight = w; }
            else { freeLeft = 0; freeRight = r.left - hostRect.left; }
          }
          const freeW = Math.max(240, freeRight - freeLeft);
          const gap = Math.min(80, Math.max(28, freeW * 0.07));
          // Keep the globe noticeably smaller on desktop so the hero copy and
          // countdown have room to breathe beside it.
          const diameter = Math.max(140, Math.min((freeW - gap * 2) * 0.66, h * 0.55));
          const cx = (freeLeft + freeRight) / 2;
          const half = diameter / 2 + 12;
          // From 1032px up, sit the globe in the true vertical middle so it
          // lines up with the gap between the hero plates and countdown tiles.
          const lift = w >= 1032 ? 0 : desktopLift;
          const cy = Math.min(h - half, Math.max(half, h * (0.5 - lift / 100)));
          const pxPerUnit = h / vh;
          const s = diameter / (2 * R_VIS * pxPerUnit);
          world.scale.setScalar(s);
          world.position.set(0, 0, 0);
          camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
          if (atmosphereMat.uniforms.uGlow) atmosphereMat.uniforms.uGlow.value = 0.7;
          if (posterRef.current) {
            const earthPx = 4 * s * pxPerUnit;
            posterRef.current.style.left = `${cx}px`;
            posterRef.current.style.top = `${cy}px`;
            posterRef.current.style.width = `${earthPx}px`;
            posterRef.current.style.height = `${earthPx}px`;
          }
        } else {
          camera.clearViewOffset();
          const s = Math.min((vw * 0.98) / FIT, (vh * 0.98) / FIT);
          world.scale.setScalar(s);
          world.position.set(0, 0, 0);
          if (atmosphereMat.uniforms.uGlow) atmosphereMat.uniforms.uGlow.value = 1;
          if (posterRef.current) {
            posterRef.current.style.left = ""; posterRef.current.style.top = "";
            posterRef.current.style.width = ""; posterRef.current.style.height = "";
          }
        }
      };
      layout();
      const ro = new ResizeObserver(layout);
      ro.observe(host);

      // ---------- Aircraft ----------
      (async () => {
        let source;
        try { source = await loadTravelModel(THREE, "aircraft"); } catch { source = createFallbackModel(THREE, "aircraft"); }
        if (disposed) return;
        [
          { radius: 3.1, speed: 0.11, height: 1.2, heading: 0 },
          { radius: 3.7, speed: -0.085, height: 1.75, heading: Math.PI },
        ].forEach((cfg, i) => {
          const plane = createModelInstance(THREE, source, 1.25);
          plane.rotation.y += cfg.heading;
          heroAircraftGroup.add(plane);
          heroAircraft.push({ group: plane, angle: i * Math.PI * 0.85, radius: cfg.radius, speed: cfg.speed, height: cfg.height });
        });
      })();

      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => { pointer.x = (e.clientX / window.innerWidth - 0.5) * 2; pointer.y = (e.clientY / window.innerHeight - 0.5) * 2; };
      window.addEventListener("pointermove", onPointer, { passive: true });

      // ---------- Loop ----------
      const timer = new THREE.Timer();
      timer.connect(document);
      let raf = 0;
      let inView = true;
      let tabVisible = !document.hidden;
      let posterHidden = false;
      const motion = reduceMotion ? 0.2 : 1;

      const frame = (timestamp?: number) => {
        raf = 0;
        if (disposed) return;
        timer.update(timestamp);
        const dt = Math.min(timer.getDelta(), 0.05) * motion;

        earth.rotation.y += dt * 0.05;
        atmosphere.rotation.y += dt * 0.02;
        stars.rotation.y += dt * 0.005;
        spinners.forEach((r) => (r.g.rotation.y += dt * r.speed));

        heroAircraft.forEach((plane) => {
          plane.angle += dt * plane.speed;
          plane.group.position.set(Math.cos(plane.angle) * plane.radius, plane.height + Math.sin(plane.angle * 1.6) * 0.35, Math.sin(plane.angle) * plane.radius * 0.45);
          plane.group.rotation.z = Math.cos(plane.angle) * 0.1;
        });

        world.rotation.x += (BASE_TILT + pointer.y * 0.05 - world.rotation.x) * 0.04;
        world.rotation.y += (pointer.x * 0.08 - world.rotation.y) * 0.04;

        const scrollT = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
        worldScroll.scale.setScalar(1 - scrollT * 0.22);
        worldScroll.position.set(0, -scrollT * 1.4, -scrollT * 2.5);
        worldScroll.rotation.z = scrollT * 0.18;
        stars.position.y = -scrollT * 1.5;

        renderer.render(scene, camera);
        if (!posterHidden && posterRef.current) { posterHidden = true; posterRef.current.style.opacity = "0"; }
        schedule();
      };

      const schedule = () => { if (!raf && inView && tabVisible && !disposed) raf = requestAnimationFrame(frame); };
      const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) { timer.reset(); schedule(); } });
      io.observe(host);
      const onVis = () => { tabVisible = !document.hidden; if (tabVisible) { timer.reset(); schedule(); } };
      document.addEventListener("visibilitychange", onVis);
      schedule();

      cleanup = () => {
        cancelAnimationFrame(raf); timer.dispose(); ro.disconnect(); io.disconnect();
        window.removeEventListener("pointermove", onPointer); document.removeEventListener("visibilitychange", onVis);
        scene.traverse((o: any) => { o.geometry?.dispose?.(); const mat = o.material; if (Array.isArray(mat)) mat.forEach((x: any) => x.dispose()); else mat?.dispose?.(); });
        textures.forEach((t) => t.dispose()); earthMat.map?.dispose();
        renderer.dispose(); renderer.domElement.remove();
      };
    })().catch((err) => console.warn("[HeroBackground] 3D scene disabled:", err));

    return () => { disposed = true; cleanup(); };
  }, [align, desktopLift]);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-x-0 top-0 h-[360px] sm:h-[460px] md:h-[360px] lg:inset-0 lg:h-auto">
        <div ref={posterRef} className="globe-poster absolute left-1/2 top-1/2 h-[min(70vw,290px)] w-[min(70vw,290px)] -translate-x-1/2 -translate-y-1/2 md:h-[min(50vw,220px)] md:w-[min(50vw,220px)] lg:left-[22%] lg:top-[52%] lg:h-[min(22vw,320px)] lg:w-[min(22vw,320px)]" />
        <div ref={hostRef} className="absolute inset-0" />
      </div>
      <div className="absolute inset-x-0 top-[270px] sm:top-[370px] md:top-[290px] h-[100px] bg-gradient-to-b from-transparent to-[#0E1020] lg:hidden" />
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-l from-[#0E1020]/90 via-[#0E1020]/35 to-transparent" />
    </div>
  );
}