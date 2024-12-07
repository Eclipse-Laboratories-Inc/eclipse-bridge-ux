import React from "react";

const ArrowUpRight = ({ className }: { className: string}) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={ className }
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transition: "stroke 0.2s var(--ease-in-quad)",
      }}
    >
      <path
        d="M10.4987 8.75V3.5M10.4987 3.5H5.2487M10.4987 3.5L3.64453 10.3542"
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default ArrowUpRight;
