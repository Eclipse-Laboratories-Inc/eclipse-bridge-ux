import React from 'react';

const Ellipse = () => {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_1106_7967)">
      <circle cx="13" cy="13" r="3" fill="#A1FEA0"/>
      </g>
      <defs>
      <filter id="filter0_d_1106_7967" x="0" y="0" width="26" height="26" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset/>
      <feGaussianBlur stdDeviation="5"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.631373 0 0 0 0 0.996078 0 0 0 0 0.627451 0 0 0 0.5 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1106_7967"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1106_7967" result="shape"/>
      </filter>
      </defs>
    </svg>
  );
};

export default Ellipse;



