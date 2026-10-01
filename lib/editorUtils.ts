import { setCurrentPages } from '@/lib/store/pages/pagesSlice';
import { setError } from '@/lib/store/pages/pagesSlice';
import { fieldDraftAdapter } from '@/packages/kalp-site-studio-toolkit/src';

function setByPath(target: any, fieldPath: string, value: string) {
  const parts = fieldPath.split('.');
  let obj = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    if (!obj[part]) obj[part] = /^\d+$/.test(nextPart) ? [] : {};
    obj = obj[part];
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

export async function saveField(dispatch: any, currentPages: any, sectionId: string, fieldPath: string, value: string) {
  // Use currentPages directly from Redux — no extra GET request needed
  if (!currentPages?.content) {
    dispatch(setError(true));
    return false;
  }

  const rawId = currentPages.id || currentPages._id;
  const pageId = typeof rawId === 'object' ? (rawId?.$oid || rawId?.toString()) : String(rawId || '');
  const pageSlug = currentPages.slug;

  if (!pageId || !pageSlug) {
    dispatch(setError(true));
    return false;
  }

  // Create a deep copy and apply the field edit
  const updated = JSON.parse(JSON.stringify(currentPages));
  const secIdx = updated.content?.findIndex((s: any) => s.id === sectionId);
  if (secIdx === -1 || secIdx === undefined) return false;

  setEditableField(updated.content[secIdx], fieldPath, value);

  // Optimistic UI update — show changes immediately in Redux
  dispatch(setCurrentPages(updated));

  try {
    // Exclude read-only metadata fields to comply with PageUpdate schema
    const { _id, id, createdAt, updatedAt, studioRevision, updatedBy, ...pageUpdatePayload } = updated;

    const response = await fetch(`/api/cms/pages/${encodeURIComponent(pageId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
      credentials: 'include',
      body: JSON.stringify(pageUpdatePayload),
    });
    
     console.log("upate teh code--", response)
    if (!response.ok) {
      // Fallback to local endpoint if backend CMS update fails
      // const fallbackResponse = await fetch(`/api/cms/pages/${pageId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ sectionId, fieldPath, value }),
      // });
      // if (!fallbackResponse.ok) {
      //   throw new Error('Page field save failed');
      // }
    }

    const payload = await response.json().catch(() => null);
    const savedPage = payload?.data || payload?.page || updated;

    void fieldDraftAdapter.save({
      pageSlug,
      pageId,
      sectionId,
      fieldPath,
      value,
      expectedPageUpdatedAt: currentPages?.updatedAt || null,
    }).catch(() => {});

    // Use the PUT response directly — GET reads from published layer
    // which doesn't include draft edits, so re-fetching would overwrite
    // the user's changes with stale published data.
    dispatch(setCurrentPages(savedPage));

    dispatch(setError(false));
    return true;
  } catch (error) {
    console.error('Error in saveField:', error);
    // Revert to original data on failure
    dispatch(setCurrentPages(currentPages));
    dispatch(setError(true));
    return false;
  }
}
