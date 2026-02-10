import { useEffect, useRef } from 'react';

export function Logo() {
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    // anime.js를 동적으로 로드
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    script.async = true;
    
    script.onload = () => {
      // @ts-ignore - anime.js는 전역으로 로드됨
      if (typeof anime !== 'undefined' && textRef.current) {
        // @ts-ignore
        anime({
          targets: textRef.current,
          strokeDashoffset: [1000, 0], // 선이 나타나는 효과
          fill: [
            { value: 'rgba(128, 128, 0, 0)', duration: 1500 }, // 처음엔 투명
            { value: 'rgba(128, 128, 0, 1)', duration: 1000 }  // 선이 다 그려질 즈음 색이 채워짐
          ],
          easing: 'easeInOutQuart',
          duration: 3000,
          direction: 'alternate',
          loop: true
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: script 제거
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <svg viewBox="0 0 600 150" className="w-48 h-12">
      <text 
        ref={textRef}
        x="50%" 
        y="50%" 
        dominantBaseline="middle" 
        textAnchor="middle"
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 900,
          fontSize: '120px',
          fill: 'rgba(128, 128, 0, 0)',
          stroke: '#808000',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
        }}
      >
        ReciPick
      </text>
    </svg>
  );
}
