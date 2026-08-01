
export const getSection = (content: any, adminTitle: string) =>
  Array.isArray(content) ? content.find((s: any) => s?.adminTitle === adminTitle) : undefined;

export const getV = (field: any, lang: string) => {
  if (!field) return "";
  const val = field.value !== undefined ? field.value : field;
  if (val && typeof val === "object") return val[lang] || val.en || "";
  return val || "";
};
