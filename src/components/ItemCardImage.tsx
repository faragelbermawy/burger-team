import React, { useState } from 'react';
import { getItemImage } from '../assets/images';
import { Utensils, Flame, Sparkles } from 'lucide-react';

interface ItemCardImageProps {
  category: string;
  code: string;
  name: string;
  image?: string;
  isPopular?: boolean;
}

export const ItemCardImage: React.FC<ItemCardImageProps> = ({
  category,
  code,
  name,
  image,
  isPopular,
}) => {
  const [hasError, setHasError] = useState(false);
  const imgSrc = getItemImage(category, code, image);

  return (
    <div className="relative aspect-[4/3] w-full bg-stone-950 overflow-hidden flex items-center justify-center">
      {!hasError ? (
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      ) : (
        /* Rich Vector Illustrated Card Fallback */
        <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex flex-col items-center justify-center p-3 text-center border-b border-stone-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1 shadow-inner">
            {category === 'burgers' ? (
              <span className="text-3xl">🍔</span>
            ) : category === 'sides' ? (
              <span className="text-3xl">🍟</span>
            ) : category === 'sandwiches' ? (
              <span className="text-3xl">🥪</span>
            ) : category === 'toast' ? (
              <span className="text-3xl">🍞</span>
            ) : (
              <span className="text-3xl">🥤</span>
            )}
          </div>
          <span className="text-xs font-bold text-stone-200 line-clamp-1">{name}</span>
          <span className="text-[10px] font-mono text-amber-500/90">{code}</span>
        </div>
      )}

      {/* Subtle bottom shadow vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

      {/* Top Badges: Item Code & Stock */}
      <div className="absolute top-2 start-2 flex items-center gap-1.5 z-10">
        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-stone-900/90 text-amber-400 border border-stone-700/60 rounded backdrop-blur-sm">
          {code}
        </span>
        {isPopular && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-stone-950 rounded flex items-center gap-0.5 shadow-sm">
            <Flame className="w-2.5 h-2.5 fill-current" />
            <span>الأكثر طلباً</span>
          </span>
        )}
      </div>
    </div>
  );
};
