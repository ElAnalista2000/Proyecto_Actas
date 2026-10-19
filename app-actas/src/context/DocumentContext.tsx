// file:///c:/Users/diego/OneDrive/Documentos/repos/App_Actas/app-actas/src/context/DocumentContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Acta, SignedActa } from "../types";

type DocumentContextType = {
  unsignedActs: Acta[];
  signedActs: SignedActa[];
  addUnsignedActa: (acta: Acta) => void;
  addSignedActa: (signed: SignedActa) => void;
  resetDocuments: () => void;
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [unsignedActs, setUnsignedActs] = useState<Acta[]>([]);
  const [signedActs, setSignedActs] = useState<SignedActa[]>([]);

  const addUnsignedActa = (acta: Acta) => {
    // evitar duplicados por fingerprint
    setUnsignedActs((prev) => {
      if (prev.some((a) => a.fingerprint === acta.fingerprint)) return prev;
      return [...prev, acta];
    });
  };

  const addSignedActa = (signed: SignedActa) => {
    setSignedActs((prev) => {
      if (prev.some((s) => s.fingerprint === signed.fingerprint)) return prev;
      return [...prev, signed];
    });
  };

  const resetDocuments = () => {
    setUnsignedActs([]);
    setSignedActs([]);
  };

  return (
    <DocumentContext.Provider
      value={{ unsignedActs, signedActs, addUnsignedActa, addSignedActa, resetDocuments }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within DocumentProvider");
  return ctx;
};
