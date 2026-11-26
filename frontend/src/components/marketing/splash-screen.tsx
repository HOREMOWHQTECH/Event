"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FLAGS,
  makeFallbackEarth,
  makeFlagGeometry,
  makeFlagTexture,
} from "@/components/marketing/flag-textures";
import { LANDING_THEME } from "@/config/landing-theme";
import { SITE_CONFIG } from "@/config/site";
import { getLandingPerformance } from "@/lib/landing-performance";

type Stage = "entering" | "welcome" | "leaving" | "hidden";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Slight overshoot so the globe feels thrown into view. */
function easeOutBack(t: number) {
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Globe-orbit intro.
 *
 * The camera starts far away, throws the Earth toward the viewer with a soft
 * overshoot, spins the two flag belts, then dissolves into the landing page.
 * The HOREMOW logo is carried on its own orbit and also appears as a crisp
 * HTML lockup with the welcome message.
 *
 * FIX: Brand text + initializing text now show together from 0s.
 * Animation plays behind them, then everything fades into landing.
 */
export function SplashScreen() {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const previousOverflowRef = useRef("");
  const [stage, setStage] = useState<Stage>("entering");

  // Returning null does not unmount this component, so the scroll lock must be
  // released when the stage becomes hidden, not only in the effect cleanup.
  useEffect(() => {
    if (stage === "hidden") {
      document.body.style.overflow = previousOverflowRef.current;
    }
  }, [stage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const perf = getLandingPerformance();
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Low-power devices skip straight to the hero instead of baking a second
    // WebGL scene just for the intro.
    if (!perf.splashWebgl || params.has("skipIntro")) {
      const skipTimer = window.setTimeout(() => {
        document.documentElement.dataset.intro = "done";
        setStage("hidden");
      }, 160);
      return () => {
        window.clearTimeout(skipTimer);
        document.body.style.overflow = previousOverflowRef.current;
      };
    }

    let disposed = false;
    let cleanup = () => {};

    const welcomeTimer = window.setTimeout(
      () => setStage("welcome"),
      LANDING_THEME.motion.introWelcomeAt
    );
    const leaveTimer = window.setTimeout(
      () => setStage("leaving"),
      LANDING_THEME.motion.introFadeAt
    );
    const hideTimer = window.setTimeout(() => {
      document.documentElement.dataset.intro = "done";
      setStage("hidden");
      window.dispatchEvent(new Event("ihgc:intro-complete"));
    }, LANDING_THEME.motion.introTotal);

    void (async () => {
      const host = canvasHostRef.current;
      if (!host) return;

      const THREE = await import("three");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, perf.maxDpr));
      renderer.setSize(host.clientWidth || 1, host.clientHeight || 1, false);
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        42,
        (host.clientWidth || 1) / (host.clientHeight || 1),
        0.1,
        100
      );
      camera.position.set(0, 0, 14.5);

      scene.add(new THREE.AmbientLight(0xffffff, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(4, 3, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8ee3d6, 1.5);
      rim.position.set(-4, -2, 3);
      scene.add(rim);

      const world = new THREE.Group();
      scene.add(world);

      const textures: InstanceType<typeof THREE.Texture>[] = [];

      // ---------- Earth ----------
      const earthMat = new THREE.MeshStandardMaterial({
        map: makeFallbackEarth(THREE),
        roughness: 0.82,
        metalness: 0.02,
      });
      textures.push(earthMat.map!);
      const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 64), earthMat);
      world.add(earth);

      new THREE.TextureLoader().load(
        "/textures/earth.jpg",
        (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          earthMat.map = tex;
          earthMat.needsUpdate = true;
          textures.push(tex);
        },
        undefined,
        () => {}
      );

      // Mint atmosphere rim, matching the hero globe.
      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.16, 48, 48),
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          uniforms: {
            uColor: { value: new THREE.Color(0x8ee3d6) },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vNormal = normalize(normalMatrix * normal);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              float rim = pow(0.76 - dot(vNormal, vView), 3.0);
              gl_FragColor = vec4(uColor, 1.0) * rim;
            }
          `,
        })
      );
      world.add(atmosphere);

      // ---------- Two flag orbits ----------
      const orbitDefs = [
        { radius: 2.34, rotation: [0, 0.45, Math.PI / 2 + 0.12], count: 16 },
        { radius: 2.6, rotation: [0, 0, 0.3], count: 20 },
      ];
      const spinners: { group: InstanceType<typeof THREE.Group>; speed: number }[] = [];

      orbitDefs.forEach((orbit, orbitIndex) => {
        const tilt = new THREE.Group();
        tilt.rotation.set(
          orbit.rotation[0],
          orbit.rotation[1],
          orbit.rotation[2]
        );
        world.add(tilt);

        const spinner = new THREE.Group();
        tilt.add(spinner);
        spinners.push({ group: spinner, speed: 0.11 + orbitIndex * 0.025 });

        const points: InstanceType<typeof THREE.Vector3>[] = [];
        for (let i = 0; i <= 180; i += 1) {
          const a = (i / 180) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(a) * orbit.radius,
              0,
              Math.sin(a) * orbit.radius
            )
          );
        }
        tilt.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
              color: 0x8ee3d6,
              transparent: true,
              opacity: 0.45,
            })
          )
        );

        const width = ((2 * Math.PI * orbit.radius) / orbit.count) * 1.02;
        const height = width * 0.62;

        for (let i = 0; i < orbit.count; i += 1) {
          const flag = FLAGS[(i + orbitIndex * 11) % FLAGS.length];
          const texture = makeFlagTexture(THREE, flag);
          textures.push(texture);

          const faceMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.48,
            metalness: 0.04,
            emissive: new THREE.Color(0x0d1f38),
            emissiveIntensity: 0.14,
          });
          const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x102f4d,
            roughness: 0.4,
            metalness: 0.12,
          });
          const mesh = new THREE.Mesh(
            makeFlagGeometry(THREE, width, height),
            [
              edgeMaterial,
              edgeMaterial,
              edgeMaterial,
              edgeMaterial,
              faceMaterial,
              faceMaterial,
            ]
          );

          const angle = (i / orbit.count) * Math.PI * 2;
          const anchor = new THREE.Group();
          anchor.position.set(
            Math.cos(angle) * orbit.radius,
            0,
            Math.sin(angle) * orbit.radius
          );
          anchor.rotation.y = Math.PI / 2 - angle;
          anchor.add(mesh);
          spinner.add(anchor);
        }
      });

      // ---------- Drifting stars ----------
      const starCount = 220;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        const r = 4.5 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi);
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
          color: 0xbff5eb,
          size: 0.035,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      scene.add(stars);

      // ---------- Logo riding its own orbit ----------
      // The globe animation never waits on the logo download; the marker is
      // added as soon as the texture is ready.
      const logoOrbit = new THREE.Group();
      logoOrbit.rotation.z = -0.22;
      world.add(logoOrbit);

      new THREE.TextureLoader().load(
        SITE_CONFIG.logo.src,
        (logoTexture) => {
          if (disposed) {
            logoTexture.dispose();
            return;
          }
          logoTexture.colorSpace = THREE.SRGBColorSpace;
          textures.push(logoTexture);

          const marker = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: logoTexture,
              transparent: true,
              depthWrite: false,
            })
          );
          marker.scale.set(0.72, 0.25, 1);
          marker.position.set(2.95, 0.42, 0);
          logoOrbit.add(marker);

          const beacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.045, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x8ee3d6 })
          );
          beacon.position.set(2.95, 0.42, -0.02);
          logoOrbit.add(beacon);
        },
        undefined,
        () => {}
      );

      // ---------- Layout ----------
      const layout = () => {
        const width = host.clientWidth || 1;
        const height = host.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      layout();
      const resizeObserver = new ResizeObserver(layout);
      resizeObserver.observe(host);

      // ---------- Loop ----------
      const started = performance.now();
      let lastRender = 0;
      let raf = 0;
      const frameInterval = 1000 / LANDING_THEME.motion.webglFps;

      const animate = () => {
        if (disposed) return;
        raf = requestAnimationFrame(animate);

        const now = performance.now();
        if (now - lastRender < frameInterval) return;
        lastRender = now;

        const elapsed = (now - started) / 1000;
        const fly = clamp01(elapsed / (LANDING_THEME.motion.introFlyIn / 1000));
        const thrown = easeOutBack(fly);

        camera.position.z = lerp(14.5, 5.0, thrown);
        camera.position.x = Math.sin(elapsed * 0.7) * 0.1 * (1 - fly);
        camera.position.y = Math.cos(elapsed * 0.55) * 0.08 * (1 - fly);
        camera.lookAt(0, 0, 0);

        world.rotation.y = elapsed * 0.2;
        world.rotation.x = Math.sin(elapsed * 0.32) * 0.07;
        earth.rotation.y += 0.0026;

        spinners.forEach((spinner) => {
          spinner.group.rotation.y += spinner.speed / LANDING_THEME.motion.webglFps;
        });
        logoOrbit.rotation.z = -0.22 + elapsed * 0.38;
        stars.rotation.y = elapsed * 0.018;

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        scene.traverse((object) => {
          const mesh = object as InstanceType<typeof THREE.Mesh>;
          mesh.geometry?.dispose?.();
          const material = mesh.material as
            | InstanceType<typeof THREE.Material>
            | InstanceType<typeof THREE.Material>[]
            | undefined;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose?.();
        });
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = previousOverflowRef.current;
      cleanup();
    };
  }, []);

  if (stage === "hidden") return null;

  return (
    <div
      className={`intro-root fixed inset-0 z-[9999] overflow-hidden bg-[#050B16] ${
        stage === "leaving" ? "intro-leaving" : ""
      }`}
    >
      <div ref={canvasHostRef} className="absolute inset-0" />

      <div className="intro-vignette pointer-events-none absolute inset-0" />
      <div className="intro-grid pointer-events-none absolute inset-0" />

      {/* Brand + loading copy share the exact centre of the viewport. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <div className="intro-brand intro-brand-visible flex w-full flex-col items-center">
          <span className="mb-5 text-[10px] font-bold uppercase tracking-[0.42em] text-[#8EE3D6]/70">
            {LANDING_THEME.copy.introEyebrow}
          </span>

          <div className="intro-logo-tile flex h-[76px] w-[220px] items-center justify-center sm:h-[88px] sm:w-[260px]">
            <Image
              src={SITE_CONFIG.logo.src}
              alt={SITE_CONFIG.logo.alt}
              width={SITE_CONFIG.logo.width}
              height={SITE_CONFIG.logo.height}
              priority
              className="h-10 w-auto object-contain sm:h-12"
              style={{ width: "auto" }}
            />
          </div>

          <h1 className="mt-7 text-3xl font-extrabold uppercase tracking-[0.08em] text-white sm:text-5xl">
            Welcome{" "}
            <span className="text-[#8EE3D6]">to IHGC 2026</span>
          </h1>
          <p className="mt-3 max-w-lg text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:text-xs">
            {LANDING_THEME.copy.welcomeSub}
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col items-center">
          <div className="intro-progress h-px w-40 overflow-hidden bg-white/10 sm:w-56">
            <span className="intro-progress-fill block h-full w-full bg-[#8EE3D6]" />
          </div>
          <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.35em] text-white/35">
            Initialising the experience
          </p>
        </div>
      </div>
    </div>
  );
}