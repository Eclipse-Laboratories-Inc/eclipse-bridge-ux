import { useState } from "react";

import { AboutGasStationComponent } from "@/app/components/GasStation/AboutGasStation";

export const useAboutGasStationModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    open,
    close,
    isOpen,
    renderModal: (
      <AboutGasStationComponent isOpen={isOpen} closeModal={close} />
    ),
  };
};
