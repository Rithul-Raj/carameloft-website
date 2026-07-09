import React, { useState, useEffect } from 'react';

const ScrollProgress = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
            const winHeight = window.innerHeight;
            const totalHeight = docHeight - winHeight;

            if (totalHeight > 0) {
                const progress = Math.min(Math.max(scrollTop / totalHeight, 0), 1); // Clamp 0-1
                setScrollProgress(progress);
            }
        };

        window.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);

        // Observe body height changes (crucial for lazy load / GSAP)
        const resizeObserver = new ResizeObserver(() => {
            updateProgress();
        });
        resizeObserver.observe(document.body);

        // Initial check
        updateProgress();

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
            resizeObserver.disconnect();
        };
    }, []);

    // Thumb height percentage (e.g., 15% of viewport)
    const thumbHeight = 15;

    // Calculate top position percentage
    // Range is from 0% to (100% - thumbHeight%)
    const topPosition = scrollProgress * (100 - thumbHeight);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '6px', // Slightly wider for visibility
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.02)', // Very faint track
                zIndex: 9999,
                pointerEvents: 'none'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: `${topPosition}%`,
                    right: 0,
                    width: '100%',
                    height: `${thumbHeight}%`,
                    backgroundColor: '#d4af37', // Gold color
                    boxShadow: '0 0 15px #d4af37', // Stronger glow
                    borderRadius: '3px',
                    transition: 'top 0.1s ease-out', // Smooth movement
                }}
            />
        </div>
    );
};

export default ScrollProgress;
