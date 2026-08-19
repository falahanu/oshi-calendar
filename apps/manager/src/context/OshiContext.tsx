import { createContext, useContext, useState } from "react";

type OshiContextType = {
  oshiName: string;
  setOshiName: (name: string) => void;
};

const OshiContext = createContext<OshiContextType | null>(null);

export function OshiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [oshiName, setOshiName] = useState(
    localStorage.getItem("oshiName") || ""
  );

  return (
    <OshiContext.Provider
      value={{ oshiName, setOshiName }}
    >
      {children}
    </OshiContext.Provider>
  );
}

export function useOshi() {
  const context = useContext(OshiContext);

  if (!context) {
    throw new Error("OshiProviderがありません");
  }

  return context;
}