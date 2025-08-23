import React, { createContext, useContext, useState } from "react";

interface TabBarHeightContextProps {
  height: number;
  setHeight: (h: number) => void;
}

const TabBarHeightContext = createContext<TabBarHeightContextProps | undefined>(
  undefined
);

export const TabBarHeightProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [height, setHeight] = useState(0);

  return (
    <TabBarHeightContext.Provider value={{ height, setHeight }}>
      {children}
    </TabBarHeightContext.Provider>
  );
};

export const useTabBarHeight = () => {
  const ctx = useContext(TabBarHeightContext);
  if (!ctx) {
    throw new Error("useTabBarHeight must be used inside TabBarHeightProvider");
  }
  return ctx;
};
