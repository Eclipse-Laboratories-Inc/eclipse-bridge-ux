import React from 'react';

const InstantIcon = ({ className }: { className: string}) => {
  return (
    <svg
      width="19"
      height="24"
      className={`instant-icon ${className}`}
      viewBox="0 0 19 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.0235 0.188477L0.328125 14.9998H7.33673L5.98115 23.8111L18.6766 8.9998H11.668L13.0235 0.188477Z"
        fill="white"
        fill-opacity="0.3"
      />
    </svg>
  );
}

export default InstantIcon;
