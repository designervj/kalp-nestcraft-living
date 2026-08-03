export function localizedValue(value: unknown, locale = "en"): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const selected = record[locale] ?? record.en;
  return typeof selected === "string" ? selected : "";
}

export function pageContentItems(page: any): Array<Record<string, any>> {
  const found: Array<Record<string, any>> = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, any>;
    const props = record.props && typeof record.props === "object" ? record.props : {};
    const title = localizedValue(record.title ?? props.title ?? props.heading);
    const description = localizedValue(
      record.description ?? record.excerpt ?? props.description ?? props.body ?? props.text,
    );
    if (title && description) found.push({ ...props, ...record, title, description });
    for (const key of ["items", "content", "columns", "blocks", "children"]) {
      if (record[key]) visit(record[key]);
      if (props[key]) visit(props[key]);
    }
  };
  visit(page?.content ?? page?.blocks ?? []);
  return found;
}

export function pageHero(page: any) {
  const content = Array.isArray(page?.content) ? page.content : [];
  const candidate = content.find((section: any) =>
    /hero|intro|header/i.test(String(section?.adminTitle || section?.type || "")),
  );
  const props = candidate?.props || candidate || {};
  return {
    eyebrow: localizedValue(props.eyebrow ?? props.kicker ?? props.label),
    heading: localizedValue(props.heading ?? props.title),
    body: localizedValue(props.body ?? props.description ?? props.text),
  };
}
