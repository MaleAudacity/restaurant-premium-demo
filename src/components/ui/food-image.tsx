"use client";

import Image from "next/image";
import { useState } from "react";

interface FoodImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function FoodImage({ src, fallbackSrc, alt, fill, className, sizes, priority }: FoodImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      alt={alt}
      className={className}
      fill={fill}
      onError={() => setImgSrc(fallbackSrc)}
      priority={priority}
      sizes={sizes}
      src={imgSrc}
      unoptimized={imgSrc.endsWith(".svg")}
    />
  );
}
