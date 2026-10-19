// file:///c:/Users/diego/OneDrive/Documentos/repos/App_Actas/app-actas/src/utils/fileUtils.ts
export const generateFingerprint = (file: File): string => {
  // simple fingerprint: name + size + lastModified
  return `${file.name}-${file.size}-${file.lastModified}`;
};

export const parseActaFileName = (fileName: string) => {
  // Expected pattern: [YYYY-MM-DD]_<aliado>_Acta_<N>.docx
  const cleaned = fileName.replace(/^\[\d{4}-\d{2}-\d{2}\]_/, "");
  const parts = cleaned.split("_");
  // ejemplo: "Asoandes_Acta_3.docx"
  const allyPart = parts[0] ?? "";
  const numberPart = parts[2]?.replace(/\.docx$/i, "") ?? "";
  return { allyName: allyPart, actaNumber: numberPart };
};
