import { setCurrentPages } from '@/lib/store/pages/pagesSlice';
import { setError } from '@/lib/store/pages/pagesSlice';

export async function saveField(dispatch: any, currentPages: any, sectionId: string, fieldPath: string, value: string) {
  const updated = JSON.parse(JSON.stringify(currentPages));
  const secIdx = updated.content?.findIndex((s: any) => s.id === sectionId);
  if (secIdx === -1 || secIdx === undefined) return false;
  const parts = fieldPath.split('.');
  let obj = updated.content[secIdx];
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;

  dispatch(setCurrentPages(updated));

  const pageId = currentPages._id || currentPages.id;
  const pageSlug = currentPages.slug;
  if (!pageSlug) {
    dispatch(setCurrentPages(currentPages));
    dispatch(setError(true));
    return false;
  }

  try {
    const response = await fetch('/api/publishing/page-drafts/field-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        pageSlug,
        pageId,
        sectionId,
        fieldPath,
        value,
        expectedPageUpdatedAt: currentPages.updatedAt || null,
      }),
    });
    if (!response.ok) throw new Error('Draft save was rejected');
    dispatch(setError(false));
    return true;
  } catch {
    dispatch(setCurrentPages(currentPages));
    dispatch(setError(true));
    return false;
  }
}
