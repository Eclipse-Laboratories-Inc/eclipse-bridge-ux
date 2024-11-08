"use client"

import React, { createContext, useState, ReactNode, useContext } from 'react';

type SidebarContextType = {
  isSidebar: boolean;
  setIsSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <SidebarContext.Provider value={{ isSidebar, setIsSidebar}}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useNetwork must be used within a SidebarProvider');
  }
  return context;
};

