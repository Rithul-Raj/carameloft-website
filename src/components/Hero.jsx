import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({
  sequenceBaseUrl = '/assets/cake-sequence/',
  frameCount = 200,
  mobileSequenceBaseUrl,
  mobileFrameCount,
  title = "Experience the Art of",
  highlightText = "Premium Baking",
  subtitle = "Where passion meets purity in every slice.",
  showDefaultButton = true,
  children
}) => {
  const canvasRef = useRef(null);
  const triggerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Determine active config based on screen size
  const activeBaseUrl = (isMobile && mobileSequenceBaseUrl) ? mobileSequenceBaseUrl : sequenceBaseUrl;
  const activeFrameCount = (isMobile && mobileFrameCount) ? mobileFrameCount : frameCount;

  const currentFrame = (index) =>
    `${activeBaseUrl}ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const images = [];
    const frame = { index: 1 };
    let loadedCount = 0;

    // Preload images
    const preloadImages = () => {
      // Reset loading if source changes
      setLoading(true);
      setLoadProgress(0);
      loadedCount = 0;

      for (let i = 1; i <= activeFrameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / activeFrameCount) * 100));
          if (loadedCount === activeFrameCount) {
            setLoading(false);
            render(); // Initial render
          }
        };
        images[i] = img;
      }
    };

    const render = () => {
      // Scale image to cover canvas (object-fit: cover)
      const img = images[Math.floor(frame.index)];
      if (!img) return;

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    preloadImages();

    // GSAP Animation
    // We pin the canvas container for the duration of the scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top top",
        end: "+=400%", // Scroll distance (4x viewport height)
        scrub: 1, // Smooth scrubbing
        pin: true,
        // markers: true, // Debug
      }
    });

    tl.to(frame, {
      index: activeFrameCount,
      snap: "index",
      ease: "none",
      onUpdate: render
    });

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      tl.kill(); // Kill timeline
      window.removeEventListener('resize', handleResize);
    };
  }, [activeBaseUrl, activeFrameCount]); // Re-run if these change

  const handleOrderNow = () => {
    const message = encodeURIComponent("Hi Carameloft 👋 I'd like to order a cake.");
    window.open(`https://wa.me/919074363264?text=${message}`, '_blank');
  };

  return (
    <div ref={triggerRef} className="hero-section">
      <canvas ref={canvasRef} className="hero-canvas" />

      {loading && (
        <div className="loader">
          <div className="loader-text">Baking Experience... {loadProgress}%</div>
        </div>
      )}

      {!loading && (
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">{title}<br /><span className="highlight">{highlightText}</span></h1>
            <p className="hero-subtitle">{subtitle}</p>
            {showDefaultButton && (
              <button className="btn-primary hero-btn" onClick={handleOrderNow}>Order Now</button>
            )}
            {children}
            <div className="scroll-hint">
              <div className="mouse"></div>
              <span>Scroll to Explore</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Hero;
