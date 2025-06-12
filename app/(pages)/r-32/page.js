"use client";
import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// Model bileşeni sadece modeli yükler ve referansını dışarıdan alır
function Model({ modelRef, scale }) {
  const { scene } = useGLTF("/models/r-32/scene.gltf");
  return <primitive ref={modelRef} object={scene} />;
}

// Model ve kamera pozisyon/rotation ayarları Canvas içinde yapılmalı
function SceneContent({ cameraScroll, modelScale }) {
  const modelRef = useRef();
  const { camera } = useThree();

  // Her bölüm için hedef kamera ve model ayarları
  const cameraStates = [
    { pos: [-90, 4.5, 4.0], fov: 15, look: [0, -0.15, 0] },
    { pos: [-4, 4, 100], fov: 10, look: [0, 1, 0] },
    { pos: [-30, 4, 100], fov: 10, look: [0, 1, 0] },
  ];
  const modelStates = [
    { pos: [0.1, -1, 0], rot: [0, 4, 0] },
    { pos: [-6, -4, 0], rot: [0, 0, 0] },
    { pos: [1, -4, 1], rot: [0, 2, 0] },
  ];

  useFrame(() => {
    // Hangi iki bölüm arasında olduğumuzu bul
    const section = Math.floor(cameraScroll);
    const t = cameraScroll - section;

    // Kamera ayarlarını lineer olarak geçiş yap
    const camA = cameraStates[section];
    const camB = cameraStates[section + 1] || cameraStates[section];
    const camPos = lerpVec3(camA.pos, camB.pos, t);
    const camFov = lerp(camA.fov, camB.fov, t);
    const camLook = lerpVec3(camA.look, camB.look, t);

    camera.position.lerp(new THREE.Vector3(...camPos), 0.08);
    camera.lookAt(...camLook);
    camera.fov = camFov;
    camera.updateProjectionMatrix();

    // Model ayarlarını lineer olarak geçiş yap
    if (modelRef.current) {
      const modA = modelStates[section];
      const modB = modelStates[section + 1] || modelStates[section];
      const modPos = lerpVec3(modA.pos, modB.pos, t);
      const modRot = lerpVec3(modA.rot, modB.rot, t);
      modelRef.current.position.set(...modPos);
      modelRef.current.rotation.set(...modRot);
      modelRef.current.scale.set(modelScale, modelScale, modelScale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" background={false} />
      <Suspense fallback={null}>
        <Model modelRef={modelRef} scale={modelScale} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </>
  );
}

// Scene3D sadece Canvas'ı ve içeriğini render eder
function Scene3D({ cameraScroll, modelScale, lightIntensity }) {
  return (
    <Canvas
      camera={{
        position: [1.0, 0.1, 6.0],
        fov: 33,
      }}
      style={{
        background:
          "linear-gradient(135deg, #181818 0%, #232946 40%, #394867 100%)",
      }}
    >
      <SceneContent cameraScroll={cameraScroll} modelScale={modelScale} />
    </Canvas>
  );
}

export default function R33Page() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef();
  const sectionsRef = useRef([]);
  const isScrolling = useRef(false);

  const animateScrollProgress = (target) => {
    gsap.to(
      { value: scrollProgress },
      {
        value: target,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: function () {
          setScrollProgress(this.targets()[0].value);
        },
      }
    );
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling.current) return;

      e.preventDefault();
      const delta = e.deltaY;
      const newSection =
        delta > 0
          ? Math.min(currentSection + 1, 2)
          : Math.max(currentSection - 1, 0);

      if (newSection !== currentSection) {
        isScrolling.current = true;
        setCurrentSection(newSection);
        animateScrollProgress(newSection);

        sectionsRef.current[newSection]?.scrollIntoView({
          behavior: "smooth",
        });

        setTimeout(() => {
          isScrolling.current = false;
        }, 1800);
      }
    };

    const handleKeyDown = (e) => {
      if (isScrolling.current) return;

      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        const newSection = Math.min(currentSection + 1, 2);
        if (newSection !== currentSection) {
          isScrolling.current = true;
          setCurrentSection(newSection);
          animateScrollProgress(newSection);
          sectionsRef.current[newSection]?.scrollIntoView({
            behavior: "smooth",
          });
          setTimeout(() => {
            isScrolling.current = false;
          }, 900);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newSection = Math.max(currentSection - 1, 0);
        if (newSection !== currentSection) {
          isScrolling.current = true;
          setCurrentSection(newSection);
          animateScrollProgress(newSection);
          sectionsRef.current[newSection]?.scrollIntoView({
            behavior: "smooth",
          });
          setTimeout(() => {
            isScrolling.current = false;
          }, 900);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection, scrollProgress]);

  const modelScale = 3.5;
  const lightIntensity = 1.5;

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* 3D Sahne - Fixed Position */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene3D
          cameraScroll={scrollProgress}
          modelScale={modelScale}
          lightIntensity={lightIntensity}
        />
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => {
              if (!isScrolling.current) {
                isScrolling.current = true;
                setCurrentSection(index);
                animateScrollProgress(index);
                sectionsRef.current[index]?.scrollIntoView({
                  behavior: "smooth",
                });
                setTimeout(() => {
                  isScrolling.current = false;
                }, 900);
              }
            }}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              currentSection === index
                ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/50"
                : "bg-transparent border-white/50 hover:border-white hover:bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Sections */}
      <div className="relative z-10">
        {/* Section 1: Ana Giriş */}
        <div
          ref={(el) => (sectionsRef.current[0] = el)}
          className="h-screen flex items-end justify-center px-8 snap-start pb-4"
        >
          <div className="mx-auto text-center text-white">
            <p className="text-2xl text-gray-300 mb-8 leading-relaxed">
              1995-1998 yılları arasında üretilen,
              <span className="text-purple-400 font-semibold">
                {" "}
                Skyline R33 GT-R
              </span>
              , teknolojik yenilikleriyle dönemin ötesinde bir performans sundu.
            </p>

            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-3xl font-bold text-purple-400 mb-2">
                  280 HP
                </h3>
                <p className="text-gray-300">Resmi Güç</p>
                <p className="text-sm text-gray-400 mt-1">(Gerçekte ~310 HP)</p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
                <h3 className="text-3xl font-bold text-blue-400 mb-2">2.6L</h3>
                <p className="text-gray-300">RB26DETT</p>
                <p className="text-sm text-gray-400 mt-1">
                  Twin Turbo İnline-6
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
                <h3 className="text-3xl font-bold text-green-400 mb-2">5.4s</h3>
                <p className="text-gray-300">0-100 km/h</p>
                <p className="text-sm text-gray-400 mt-1">ATTESA E-TS AWD</p>
              </div>
            </div>

            <div className="mb-8 flex justify-center">
              <img
                src="/images/skylinetext.png"
                alt="Skyline Logo"
                className="h-32 mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Teknik Özellikler */}
        <div
          ref={(el) => (sectionsRef.current[1] = el)}
          className="h-screen flex items-center justify-end pr-12 snap-start"
        >
          <div className="max-w-2xl text-white">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Yenilikçi Teknoloji
            </h2>

            <div className="space-y-6">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-2xl font-bold text-purple-400 mb-3">
                  RB26DETT Motor
                </h3>
                <p className="text-gray-300 mb-2">
                  2.6 litre twin-turbo inline-6, yüksek güç ve dayanıklılık için
                  tasarlandı. R32'den devralınan efsanevi motor.
                </p>
                <div className="text-sm text-gray-400 grid grid-cols-2 gap-2 mt-3">
                  <span>• Çelik krank mili</span>
                  <span>• Forged pistonlar</span>
                  <span>• Twin turbo</span>
                  <span>• Güçlendirilmiş blok</span>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-2xl font-bold text-blue-400 mb-3">
                  ATTESA E-TS AWD
                </h3>
                <p className="text-gray-300 mb-2">
                  Akıllı dört çeker sistemi, yol tutuşunu maksimuma çıkarır. R33
                  ile daha hızlı tepki süresi.
                </p>
                <div className="text-sm text-gray-400">
                  <span>• Elektronik tork dağılımı</span>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  Super HICAS
                </h3>
                <p className="text-gray-300 mb-2">
                  Aktif arka tekerlek yönlendirme sistemi, virajlarda üstün
                  denge ve çeviklik sağlar.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border-l-4 border-yellow-500">
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                  Brembo Frenler
                </h3>
                <p className="text-gray-300">
                  324mm diskler ve 4 pistonlu kaliperler ile yüksek performanslı
                  frenleme.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Efsane Detaylar */}
        <div
          ref={(el) => (sectionsRef.current[2] = el)}
          className="h-screen flex items-center justify-center px-8 snap-start"
        >
          <div className="max-w-5xl mx-auto text-center text-white">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              R33'ün İzleri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-blue-500/30">
                <h3 className="text-3xl font-bold text-blue-400 mb-4">
                  🏁 Pistte Başarı
                </h3>
                <p className="text-gray-300 mb-4">
                  R33, Nürburgring Nordschleife'de 8:01 tur zamanı ile dönemin
                  en hızlılarından biri oldu. Gelişmiş aerodinamik ve şasi.
                </p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Nürburgring: 8:01</p>
                  <p>• JGTC yarışları</p>
                  <p>• LeMans GT1</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
                <h3 className="text-3xl font-bold text-purple-400 mb-4">
                  🎮 Dijital Efsane
                </h3>
                <p className="text-gray-300 mb-4">
                  Gran Turismo ve diğer yarış oyunlarında R33, oyuncuların
                  favorisi oldu. Gerçek ve sanal pistlerde efsaneleşti.
                </p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Gran Turismo serisi</p>
                  <p>• Initial D</p>
                  <p>• Forza Motorsport</p>
                </div>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 border border-yellow-500/30">
              <h3 className="text-4xl font-bold text-yellow-400 mb-4">
                💎 Koleksiyon Değeri
              </h3>
              <p className="text-xl text-gray-300 mb-6">
                Sadece 16,668 adet üretilen R33 GT-R, günümüzde nadirliğiyle öne
                çıkıyor. Temiz örnekleri koleksiyonerlerin gözdesi.
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-green-400 mb-2">
                    $90K+
                  </h4>
                  <p className="text-gray-400">Standart GT-R</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-400 mb-2">
                    $160K+
                  </h4>
                  <p className="text-gray-400">V-Spec</p>
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-purple-400 mb-2">
                    $250K+
                  </h4>
                  <p className="text-gray-400">Nismo 400R</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-lg">
                <span className="text-purple-400 font-semibold">
                  Skyline R33
                </span>{" "}
                modern çağın başlangıcı, efsanenin devamı.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
