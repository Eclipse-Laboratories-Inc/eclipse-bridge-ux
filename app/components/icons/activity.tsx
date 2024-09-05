import React from 'react';

const Activity = ({ activityClassName }: { activityClassName: string}) => {
  return (
    <svg className={activityClassName} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6V10L12.5 12.5M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="white" stroke-opacity="0.3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

export default Activity;
