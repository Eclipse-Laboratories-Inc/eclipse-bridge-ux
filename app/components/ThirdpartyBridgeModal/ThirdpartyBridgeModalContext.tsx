import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThirdpartyBridgeModalContextType {
  isThirdpartyBridgeModalOpen: boolean;
  setIsThirdpartyBridgeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleThirdpartyBridgeModal: () => void;
}

const ThirdpartyBridgeModalContext = createContext<ThirdpartyBridgeModalContextType | undefined>(undefined);

interface ThirdpartyBridgeModalProviderProps {
  children: ReactNode;
}

export const ThirdpartyBridgeModalProvider: React.FC<ThirdpartyBridgeModalProviderProps> = ({ children }) => {
  const [isThirdpartyBridgeModalOpen, setIsThirdpartyBridgeModalOpen] = useState<boolean>(false);


  const toggleThirdpartyBridgeModal = React.useCallback(() => {
    setIsThirdpartyBridgeModalOpen((prev) => {
      return !prev;
    });
  }, [setIsThirdpartyBridgeModalOpen]);


  return (
    <ThirdpartyBridgeModalContext.Provider
      value={{
        isThirdpartyBridgeModalOpen,
        setIsThirdpartyBridgeModalOpen,
        toggleThirdpartyBridgeModal,
      }}
    >
      {children}
    </ThirdpartyBridgeModalContext.Provider>
  );
};

export const useThirdpartyBridgeModalContext = (): ThirdpartyBridgeModalContextType => {
  const context = useContext(ThirdpartyBridgeModalContext);
  if (!context) {
    throw new Error(
      'useThirdpartyBridgeModalContext must be used within a ThirdpartyBridgeModalProvider'
    );
  }
  return context;
};

