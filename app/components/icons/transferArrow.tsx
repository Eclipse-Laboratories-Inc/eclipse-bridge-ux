import React from 'react';

const TransferArrow = () => {
  return (
    <svg className="transferArrow" width="44" height="45" viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22.5" r="15.3125" fill="#0D0D0D" stroke="white" />
      <circle cx="22" cy="22.5" r="21.5" fill="#0D0D0D" stroke="#252525" />
      <rect width="23.2941" height="23.2941" transform="translate(10.3525 10.8535)" fill="#0D0D0D" />
      <path 
        d="M27.8228 24.4422L21.9993 30.2657L16.1758 24.4422M21.9993 29.2952L21.9993 14.7363" 
        stroke="white" 
        strokeOpacity="0.4" 
        strokeWidth="1.6875" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default TransferArrow;
