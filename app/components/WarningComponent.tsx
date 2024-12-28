import React from "react";
import { WarningIcon } from "./icons";
import classNames from "classnames";

export interface WarningComponentProps {
  message: string;
  className?: string;
  textClassName?: string;
}

export const WarningComponent: React.FC<WarningComponentProps> = ({
  message,
  className,
  textClassName,
}) => {
  return (
    <div
      className={classNames(
        className,
        "flex flex-row h-[72px] py-[12px] px-[8px] w-[335px]",
        "items-center bg-[#FFFFFF0D] border-[1px] border-[#FFFFFF1A]",
        "rounded-[10px] gap-[12px]",
      )}
    >
      <WarningIcon className="w-[24px]" />
      <span
        className={classNames(
          textClassName,
          "text-[#FFFFFF4D] text-[12px] w-[90%] font-medium",
        )}
      >
        {message}
      </span>
    </div>
  );
};
