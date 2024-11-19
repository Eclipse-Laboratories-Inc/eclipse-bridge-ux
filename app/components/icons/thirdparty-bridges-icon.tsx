import React from 'react';

const ThirdpartyBridgesIcon = ({ bridgesClassName }: { bridgesClassName: string}) => {
  return (
    <svg className={bridgesClassName} width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.75 11.75L10.875 7.625M11.25 11V7.25H7.5M15.75 9.5C15.75 5.77208 12.728 2.75 9 2.75C5.27208 2.75 2.25 5.77208 2.25 9.5C2.25 13.228 5.27208 16.25 9 16.25C12.728 16.25 15.75 13.228 15.75 9.5Z" stroke="white" stroke-opacity="0.3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

export default ThirdpartyBridgesIcon;
