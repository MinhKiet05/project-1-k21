import { useState, useRef, useEffect, memo } from 'react';
import './LazyImage.css';

const LazyImage = memo(({ src, alt, className, placeholder, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`lazy-image-container ${className || ''}`} {...props}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="lazy-image-placeholder">
          {placeholder || <div className="lazy-image-skeleton" />}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;