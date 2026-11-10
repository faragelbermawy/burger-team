import React, { useState } from 'react';
import { APP_IMAGES } from '../assets/images';

interface BurgerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BurgerLogo: React.FC<BurgerLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  }[size];

  return (
    <div
      className={`rounded-full overflow-hidden border-2 border-amber-500/60 bg-stone-900 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 select-none relative ${sizeClasses} ${className}`}
    >
      {!imgFailed ? (
        <img
          src={APP_IMAGES.logo}
          alt="برجر تيم - Burger Team"
          className="w-full h-full object-cover scale-110"
          loading="eager"
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Vector High-Fidelity Burger Sandwich Emblem Fallback */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1 bg-stone-950"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle badge */}
          <circle cx="50" cy="50" r="48" fill="#1c1917" stroke="#f59e0b" strokeWidth="2.5" />
          
          {/* Top Bun with sesame seeds */}
          <path
            d="M22 42C22 25 32 18 50 18C68 18 78 25 78 42H22Z"
            fill="#d97706"
          />
          {/* Sesame seeds */}
          <ellipse cx="38" cy="28" rx="2" ry="1.2" transform="rotate(-15 38 28)" fill="#fef3c7" />
          <ellipse cx="50" cy="25" rx="2" ry="1.2" fill="#fef3c7" />
          <ellipse cx="62" cy="28" rx="2" ry="1.2" transform="rotate(15 62 28)" fill="#fef3c7" />
          <ellipse cx="44" cy="34" rx="2" ry="1.2" fill="#fef3c7" />
          <ellipse cx="56" cy="34" rx="2" ry="1.2" fill="#fef3c7" />

          {/* Tomato slice */}
          <rect x="20" y="43" width="60" height="5" rx="2.5" fill="#ef4444" />

          {/* Melting Cheddar Cheese with drips */}
          <path
            d="M18 49H82L80 54L68 53L64 61L58 53L48 62L42 53L32 58L28 53L18 53Z"
            fill="#fbbf24"
          />

          {/* Grilled Beef Patty 1 */}
          <rect x="20" y="54" width="60" height="9" rx="4.5" fill="#78350f" />
          {/* Grill marks */}
          <line x1="30" y1="56" x2="36" y2="61" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="56" x2="51" y2="61" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="56" x2="66" y2="61" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

          {/* Fresh wavy green lettuce */}
          <path
            d="M17 64C21 61 25 67 29 64C33 61 37 67 41 64C45 61 49 67 53 64C57 61 61 67 65 64C69 61 73 67 77 64C81 61 85 65 83 67H17V64Z"
            fill="#22c55e"
          />

          {/* Bottom Bun */}
          <path
            d="M22 68H78C78 78 70 82 50 82C30 82 22 78 22 68Z"
            fill="#b45309"
          />

          {/* Star accent */}
          <polygon points="50,4 52,9 57,9 53,12 55,17 50,14 45,17 47,12 43,9 48,9" fill="#fbbf24" />
        </svg>
      )}
    </div>
  );
};
