import React from 'react';

const Cross = ({ crossClassName }: { crossClassName: string}) => {
  return (
    <svg className={crossClassName} width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33301 1.33334L6.66634 6.66667M6.66634 1.33334L1.33301 6.66667" stroke="white" stroke-opacity="0.3" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  );
}

export default Cross;
