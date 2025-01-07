import React from 'react';

interface BrownChatLogoProps {
  className?: string;
}

const BrownChatLogo: React.FC<BrownChatLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 176 176"
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

      {/* Charlie Brown's Three Curly Strips */}
      <g
        className="stroke-white dark:stroke-gray-900"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      >
        {/* Left Strip */}
        <path d="M52 68 L52 108" />

        {/* Middle Strip */}
        <path d="M88 58 L88 98" />

        {/* Right Strip */}
        <path d="M124 68 L124 108" />
      </g>

      {/* Chat Indicator Dot */}
      <circle
        cx="88"
        cy="128"
        r="6"
        className="fill-primary-500 dark:fill-primary-400"
      />
    </svg>
  );
};

export default BrownChatLogo;
