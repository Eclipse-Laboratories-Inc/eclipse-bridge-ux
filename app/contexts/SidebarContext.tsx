"use client"

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

type SidebarContextType = {
  isSidebar: boolean;
  setIsSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebar, setIsSidebar] = useState(true);
  useEffect(() => {
   if (isSidebar) {
      document.documentElement.style.setProperty("--sidebar-width", `106.5px`);
   } else {
      document.documentElement.style.setProperty("--sidebar-width", `32.5px`);
   }
  }, [isSidebar])

  return (
    <SidebarContext.Provider value={{ isSidebar, setIsSidebar}}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

