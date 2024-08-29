
import React from 'react';

const Disconnect = ({ disconnectClassName }: { disconnectClassName: string}) => {
  return (
  <svg className={disconnectClassName} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.37565 14.6668H3.83398C2.45328 14.6668 1.33398 13.5476 1.33398 12.1668V3.8335C1.33398 2.45279 2.45328 1.3335 3.83398 1.3335H7.37565M14.6673 8.00016H5.29232M14.6673 8.00016L10.9173 11.7502M14.6673 8.00016L10.9173 4.25016" stroke="white" stroke-opacity="0.3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  );
}

export default Disconnect;
