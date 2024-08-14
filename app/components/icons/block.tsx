
import React from 'react';

const Block = ({ blockClassName }: { blockClassName: string}) => {
  return (
    <svg className={ blockClassName } width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.0002 10L1.5 5.78123M9.0002 10L9 18.5M9.0002 10L16.5 5.78123M17 6.66968V13.3303C17 14.0528 16.6103 14.7192 15.9805 15.0734L9.9805 18.4484C9.3717 18.7909 8.6283 18.7909 8.0195 18.4484L2.01948 15.0734C1.38972 14.7192 1 14.0528 1 13.3303V6.66968C1 5.94713 1.38972 5.28076 2.01948 4.92653L8.0195 1.55153C8.6283 1.20906 9.3717 1.20906 9.9805 1.55153L15.9805 4.92653C16.6103 5.28076 17 5.94713 17 6.66968Z" stroke="white" stroke-opacity="0.3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>


  );
}

export default Block;