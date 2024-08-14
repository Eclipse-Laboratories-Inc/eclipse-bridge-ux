
import React from 'react';

const Gas = ({ gasClassName }: { gasClassName: string}) => {
  return (
    <svg className={ gasClassName } width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 20H15M14 20V10M14 20H4M14 10V7C14 5.34315 12.6569 4 11 4H7C5.34315 4 4 5.34315 4 7V20M14 10H15C16.6569 10 18 11.3431 18 13V15.5C18 16.3284 18.6716 17 19.5 17C20.3284 17 21 16.3284 21 15.5V9.24264C21 8.44699 20.6839 7.68393 20.1213 7.12132L19 6M4 20H3M11 10H7" stroke="white" stroke-opacity="0.3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

  );
}

export default Gas;