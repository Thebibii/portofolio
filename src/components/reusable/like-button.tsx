"use client";

import { useState } from "react";

interface LikeButtonProps {
  slug: string;
  initialCount: number;
  initialLiked: boolean;
  onLike: (slug: string) => void;
}

const HEART_PATH =
  "M56 15.51C56 33.01 30.0525 47.175 28.9475 47.76C28.6563 47.9167 28.3307 47.9987 28 47.9987C27.6693 47.9167 27.3437 47.9167 27.0525 47.76C25.9475 47.175 0 33.01 0 15.51C0.00463184 11.4006 1.63915 7.46078 4.54496 4.55497C7.45077 1.64916 11.3906 0.0146416 15.5 0.0100098C20.6625 0.0100098 25.1825 2.23001 28 5.98251C30.8175 2.23001 35.3375 0.0100098 40.5 0.0100098C44.6094 0.0146416 48.5492 1.64916 51.455 4.55497C54.3609 7.46078 55.9954 11.4006 56 15.51Z";

function HeartIcon({ liked, blurred }: { liked: boolean; blurred?: boolean }) {
  return (
    <svg
      width="56"
      height="48"
      viewBox="0 0 56 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={blurred ? "blur-sm" : ""}
    >
      <defs>
        <radialGradient
          id="heart-fill-red"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(28.2385 48.7531) rotate(89.8959) scale(25.095 29.4511)"
        >
          <stop stopColor="#EF4444" />
          <stop offset="0.959063" stopColor="#DC2626" />
        </radialGradient>
        <radialGradient
          id="heart-fill-gray"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(28 24.3201) rotate(-0.646017) scale(28.0018 68.0613)"
        >
          <stop stopColor="#D4D4D4" />
          <stop offset="1" stopColor="#A3A3A3" />
        </radialGradient>
      </defs>
      <path
        d={HEART_PATH}
        fill={liked ? "url(#heart-fill-red)" : "url(#heart-fill-gray)"}
      />
    </svg>
  );
}

export default function LikeButton({
  slug,
  initialCount,
  initialLiked,
  onLike,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));
    onLike(slug);
  };

  const digits = String(count).split("");

  return (
    <div id="like-button" className="flex items-center justify-center pt-52">
      <button type="button" onClick={handleClick} className="relative">
        <div className="relative size-28 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-300 p-[1px]">
          <div className="size-full rounded-full flex items-center justify-center bg-background">
            <span
              className={
                liked
                  ? "transition-opacity duration-1000 opacity-100"
                  : "transition-opacity duration-1000 opacity-0"
              }
            >
              <HeartIcon liked blurred />
            </span>
            <span className="absolute">
              <HeartIcon liked={liked} />
            </span>
          </div>
        </div>

        <span
          key={count}
          className="px-4 flex items-center text-9xl font-extrabold pointer-events-none absolute top-[-90%] left-1/2 -translate-x-1/2 animate-in fade-in duration-1000"
          style={{
            maskImage:
              "linear-gradient(rgba(0, 0, 0, 0.97) 0%, rgba(0, 0, 0, 0) 110%)",
            textShadow:
              "-0.3px 0 rgba(163,163,163,0.6), 0 0.3px rgba(163,163,163,0.6), 0.3px 0 rgba(163,163,163,0.6), 0 -0.3px rgba(163,163,163,0.6)",
          }}
        >
          {digits.map((digit, i) => (
            <span key={i}>{digit}</span>
          ))}
        </span>
      </button>
    </div>
  );
}
