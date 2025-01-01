import React from "react";

const Cross = ({ crossClassName }: { crossClassName: string }) => {
  if (crossClassName === "wallets-cross")
    return (
      <svg
        className={crossClassName}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.292893 0.292893C0.683418 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292894C12.6834 -0.0976305 13.3166 -0.0976305 13.7071 0.292894C14.0976 0.683418 14.0976 1.31658 13.7071 1.70711L8.41421 7L13.7071 12.2929C14.0976 12.6834 14.0976 13.3166 13.7071 13.7071C13.3166 14.0976 12.6834 14.0976 12.2929 13.7071L7 8.41421L1.70711 13.7071C1.31658 14.0976 0.683418 14.0976 0.292893 13.7071C-0.0976311 13.3166 -0.0976311 12.6834 0.292893 12.2929L5.58579 7L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
          fill="white"
          fill-opacity="0.3"
        />
      </svg>
    );

  if (crossClassName === "tap-cross")
    return (
      <svg
        className={crossClassName}
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 8.5L16 16.5M16 8.5L8 16.5"
          stroke="black"
          stroke-opacity="0.3"
          stroke-width="1"
          stroke-linecap="round"
        />
      </svg>
    );

  return (
    <svg
      className={crossClassName}
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.33301 1.33334L6.66634 6.66667M6.66634 1.33334L1.33301 6.66667"
        stroke="white"
        stroke-opacity="0.3"
        stroke-width="1"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default Cross;
