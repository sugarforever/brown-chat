import React from 'react';

interface BrownChatLogoProps {
  className?: string;
}

const BrownChatLogo: React.FC<BrownChatLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 178 178"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle
        cx="88"
        cy="88"
        r="88"
        className="fill-gray-900 dark:fill-gray-100"
      />

      <g
        className="stroke-white dark:stroke-gray-900"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M52 68 L52 108" />
        <path d="M88 58 L88 98" />
        <path d="M124 68 L124 108" />
      </g>

      <circle
        cx="88"
        cy="128"
        r="6"
        className="fill-pink-500 dark:fill-pink-400"
      />
    </svg>
  );
};

export default BrownChatLogo;
