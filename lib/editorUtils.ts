import { setCurrentPages } from '@/lib/store/pages/pagesSlice';
import { setError } from '@/lib/store/pages/pagesSlice';
import { fieldDraftAdapter } from '@/packages/kalp-site-studio-toolkit/src';

function setByPath(target: any, fieldPath: string, value: string) {
  const parts = fieldPath.split('.');
  let obj = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
}

function getFieldPaths(section: any, fieldPath: string) {
  const paths = new Set<string>();

  if (fieldPath.startsWith('content.') && section.content && !Array.isArray(section.content)) {
    paths.add(fieldPath.replace(/^content\./, 'content.items.'));
    if (section.props?.legacyEditor) {
      paths.add(`props.legacyEditor.${fieldPath}`);
    }
  } else {
    paths.add(fieldPath);
  }

  if (fieldPath.startsWith('props.') && section.props?.legacyEditor?.props) {
    paths.add(`props.legacyEditor.${fieldPath}`);
  }

  return Array.from(paths);
}

function setEditableFieldAtPath(section: any, fieldPath: string, value: string) {
  setByPath(section, fieldPath, value);

  const parts = fieldPath.split('.');
  const locale = parts[parts.length - 1];
  if (!locale || locale.length !== 2) return;

  let parent = section;
  for (let i = 0; i < parts.length - 2; i++) {
    parent = parent?.[parts[i]];
  }

  const fieldKey = parts[parts.length - 2];
  const field = parent?.[fieldKey];
  if (field && typeof field === 'object' && 'value' in field) {
    if (!field.value || typeof field.value !== 'object') field.value = {};
    field.value[locale] = value;
  }
}

function setEditableField(section: any, fieldPath: string, value: string) {
  for (const path of getFieldPaths(section, fieldPath)) {
    setEditableFieldAtPath(section, path, value);
  }
}

async function getPageForSave(currentPages: any) {
  if (currentPages?._id || currentPages?.id) return currentPages;
  if (typeof window === 'undefined') return currentPages;

  const slug = window.location.pathname.split('/').filter(Boolean).pop() || 'home';
  const response = await fetch(`/api/pages?slug=${encodeURIComponent(slug)}`, {
    credentials: 'include',
  });

  if (!response.ok) return currentPages;
  const page = await response.json();
  return page?.content ? page : currentPages;
}

export async function saveField(dispatch: any, currentPages: any, sectionId: string, fieldPath: string, value: string) {
  const pageForSave = await getPageForSave(currentPages);
  const updated = JSON.parse(JSON.stringify(pageForSave));
  const secIdx = updated.content?.findIndex((s: any) => s.id === sectionId);
  if (secIdx === -1 || secIdx === undefined) return false;

  setEditableField(updated.content[secIdx], fieldPath, value);

  dispatch(setCurrentPages(updated));

  const pageId = pageForSave._id || pageForSave.id;
  const pageSlug = pageForSave.slug;
  if (!pageSlug) {
    dispatch(setCurrentPages(pageForSave));
    dispatch(setError(true));
    return false;
  }

  if (!pageId) {
    dispatch(setCurrentPages(pageForSave));
    dispatch(setError(true));
    return false;
  }

  try {
    const response = await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updated),
    });

    if (!response.ok) throw new Error('Page save failed');

    void fieldDraftAdapter.save({
      pageSlug,
      pageId,
      sectionId,
      fieldPath,
      value,
      expectedPageUpdatedAt: currentPages.updatedAt || null,
    }).catch(() => {});

    dispatch(setError(false));
    return true;
  } catch {
    dispatch(setCurrentPages(pageForSave));
    dispatch(setError(true));
    return false;
  }
}
