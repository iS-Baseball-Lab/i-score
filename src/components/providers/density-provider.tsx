// src/components/providers/density-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Density = "standard" | "compact" | "comfortable";

interface DensityContextType {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextType>({
  density: "standard",
  setDensity: () => { },
});

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<Density>("standard");

  useEffect(() => {
    // 初回読み込み時に設定を復元
    const saved = localStorage.getItem("iScore_density") as Density;
    if (saved) {
      setDensityState(saved);
      document.documentElement.setAttribute("data-density", saved);
    }
  }, []);

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
    localStorage.setItem("iScore_density", newDensity);
    document.documentElement.setAttribute("data-density", newDensity);
  };

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

// どのコンポーネントからも簡単に呼び出せるカスタムフック
export const useDensity = () => useContext(DensityContext);