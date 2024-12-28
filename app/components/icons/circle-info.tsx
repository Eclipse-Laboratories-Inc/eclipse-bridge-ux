import React from "react";

const CircleInfo = ({ className }: { className: string }) => {
  return (
    <svg
      width="19"
      height="19"
      className={className}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.70833 8.70833H9.5V12.6667M16.625 9.5C16.625 13.4351 13.4351 16.625 9.5 16.625C5.56497 16.625 2.375 13.4351 2.375 9.5C2.375 5.56497 5.56497 2.375 9.5 2.375C13.4351 2.375 16.625 5.56497 16.625 9.5Z"
        stroke="white"
        stroke-opacity="0.3"
        stroke-width="1.58333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.5 5.73975C9.17209 5.73975 8.90625 6.00558 8.90625 6.3335C8.90625 6.66141 9.17209 6.92725 9.5 6.92725C9.82791 6.92725 10.0938 6.66141 10.0938 6.3335C10.0938 6.00558 9.82791 5.73975 9.5 5.73975Z"
        fill="white"
        fill-opacity="0.3"
        stroke="white"
        stroke-opacity="0.3"
        stroke-width="0.395833"
      />
    </svg>
  );
};

export default CircleInfo;
