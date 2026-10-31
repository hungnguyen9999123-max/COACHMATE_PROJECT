import { useState, type ImgHTMLAttributes } from 'react';

// Offline fallback keeps media predictable even if an external image host is unavailable.
export const SPORT_IMAGE_FALLBACK = '/images/badminton-court.svg';

export function SportImage({ src, alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  return <img {...props} className={`cm-sport-image ${className}`} src={!src || failedSource === src ? SPORT_IMAGE_FALLBACK : src} alt={alt ?? 'Sân cầu lông CoachMate'}
    onError={() => setFailedSource(src)}/>;
}
