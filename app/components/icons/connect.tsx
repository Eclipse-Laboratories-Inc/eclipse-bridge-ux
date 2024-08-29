import React from 'react';

const ConnectIcon = ({ connectClassName }: { connectClassName: string}) => {
  return (
    <svg className={connectClassName} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 2.33333V9.5C0.5 10.6046 1.39543 11.5 2.5 11.5H9.5C10.6046 11.5 11.5 10.6046 11.5 9.5V5.83333C11.5 4.72873 10.6046 3.83333 9.5 3.83333H8.83333M0.5 2.33333C0.5 3.16176 1.17157 3.83333 2 3.83333H8.83333M0.5 2.33333C0.5 1.32081 1.32081 0.5 2.33333 0.5H7.44447C8.21153 0.5 8.83333 1.12183 8.83333 1.88889V3.83333" stroke="white" stroke-opacity="0.3" stroke-linecap="square" stroke-linejoin="round"/>
      <path d="M8 8C8.55227 8 9 7.55227 9 7C9 6.44773 8.55227 6 8 6C7.44773 6 7 6.44773 7 7C7 7.55227 7.44773 8 8 8Z" fill="white" fill-opacity="0.3"/>
    </svg>
  );
}

export default ConnectIcon;
