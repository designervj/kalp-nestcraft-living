'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, MessageSquareOff, MessageSquarePlus, Settings2, Eye, EyeOff, ScanLine } from 'lucide-react';
import { Annotation, useAnnotatorStore } from './store';
import { clampPopoverPosition, getCssSelector, getScreenSize } from './utils';
import { Marker } from './Marker';

import { createCommentThunk } from '@/lib/store/comments/commentThunk';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

import GetAllCommments from './GetAllCommments';
import { usePathname } from 'next/navigation';
import { RootState } from '@/lib/store/store';
import { useAppDispatch } from '@/lib/store/hooks';
import { setPageComments } from '@/lib/store/comments/commentSlice';

export const AnnotatorPlugin: React.FC = () => {
  const {
    annotations,
    isCommentModeActive,
    toggleCommentMode,
    addAnnotation,
    setActiveAnnotationId,
    settings,
    setAnnotations,
    updateSettings
  } = useAnnotatorStore();
  const pagesState = useSelector((state: RootState) => state.pages);
  const currentPages = pagesState?.currentPages;
  const [draft, setDraft] = useState<{
    x: number;
    y: number;
    selector: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [draftContent, setDraftContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const commentsState = useSelector((state: RootState) => state.comments);
  const allComments = commentsState?.allComments || [];
  const dispatch = useAppDispatch()

  // get url slug

  const pathname = usePathname()
  const slug = pathname?.split("/").filter(Boolean).pop() || 'home';

  // update the annotation
  useEffect(() => {
    if (slug && allComments) {
      const filterComments = allComments.filter((comment: Annotation) => comment.slug === slug)
      dispatch(setPageComments(filterComments))
      setAnnotations(filterComments)
    }
  }, [dispatch, setAnnotations, slug, allComments])
  // Apply calibration mode styles
  useEffect(() => {
    if (settings.calibrationMode && isCommentModeActive) {
      document.body.classList.add('annotator-calibration-mode');
    } else {
      document.body.classList.remove('annotator-calibration-mode');
    }

    return () => {
      document.body.classList.remove('annotator-calibration-mode');
    };
  }, [settings.calibrationMode, isCommentModeActive]);

  // Handle clicking on the document to create an annotation
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isCommentModeActive) return;

    e.preventDefault();
    e.stopPropagation();

    // 1. Temporarily hide the capture overlay so we can find the real element underneath
    const overlay = e.currentTarget as HTMLElement;
    overlay.style.display = 'none';

    // 2. Find the actual target element
    const target = document.elementFromPoint(e.clientX, e.clientY);

    // 3. Restore the overlay
    overlay.style.display = 'block';

    if (!target || target === document.body || target === document.documentElement) {
      if (!target) return;
    }

    if (target instanceof Element && target.closest('[data-annotator-ui="true"]')) {
      return;
    }

    // 4. Calculate relative percentages
    const rect = target.getBoundingClientRect();
    const offsetX = ((e.clientX - rect.left) / rect.width) * 100;
    const offsetY = ((e.clientY - rect.top) / rect.height) * 100;

    // 5. Generate robust selector
    const selector = getCssSelector(target);

    setDraft({
      x: e.clientX,
      y: e.clientY,
      selector,
      offsetX,
      offsetY
    });
    setShowSettings(false);
  };
  // Close active annotation if clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!isCommentModeActive && !draft) {
        setActiveAnnotationId(null);
        setShowSettings(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isCommentModeActive, draft, setActiveAnnotationId]);

  const handleSaveDraft = async () => {
    if (!draft || !draftContent.trim()) return;
    const data: Omit<Annotation, 'id' | 'createdAt'> = {
      selector: draft.selector,
      offsetX: draft.offsetX,
      offsetY: draft.offsetY,
      content: draftContent.trim(),
      status: 'open',
      screenSize: getScreenSize(window.innerWidth),
      pageId: currentPages?._id || "",
      slug: slug
    }
    try {
      const comment = await dispatch(createCommentThunk(data)).unwrap()
      addAnnotation(comment);
      setDraft(null);
      setDraftContent('');
      toast.success("Comment added successfully")
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error(typeof error === 'string' ? error : error instanceof Error ? error.message : "Failed to add comment")
    }
  };

  const handleCancelDraft = () => {
    setDraft(null);
    setDraftContent('');
  };
  const draftPopoverPosition = draft
    ? clampPopoverPosition(draft.x, draft.y, 288, 190)
    : null;

  return (
    <>

      {/* get all comments */}
      <GetAllCommments />
      {/* Calibration Mode Global Styles */}
      <style>{`
        body.annotator-calibration-mode [data-annotate-id] {
          outline: 2px dashed #6366f1 !important;
          outline-offset: 2px !important;
          position: relative;
        }
        body.annotator-calibration-mode [data-annotate-id]::after {
          content: attr(data-annotate-id);
          position: absolute;
          top: -24px;
          left: 0;
          background: #6366f1;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 10000;
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>



      {/* Only render markers and capture layer if Comment Mode is ACTIVE */}
      {isCommentModeActive && (
        <>
          {/* Invisible overlay to capture clicks when in annotation mode */}
          {!draft && (
            <div
              data-annotator-ui="true"
              className="fixed inset-x-0 bottom-0 top-[44px] z-[9998] cursor-crosshair"
              onClickCapture={handleCanvasClick}
            >
              {/* Subtle border to indicate mode is active */}
              <div className="absolute inset-0 border-4 border-indigo-500/30 pointer-events-none" />
            </div>
          )}

          {/* Render existing markers */}
          {annotations.map((annotation: Annotation) => (
            <Marker key={annotation._id ?? annotation.id} annotation={annotation} />
          ))}

          {/* Draft Annotation Popover */}
          {draft && (
            <div
              data-annotator-ui="true"
              className="fixed z-[10000]"
              style={{ left: `${draft.x}px`, top: `${draft.y}px` }}
            >
              {/* Draft Pin (Red for 'Open' default) */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full shadow-lg ring-4 ring-red-200 flex items-center justify-center text-white">
                <MessageSquarePlus size={16} />
              </div>

              {/* Draft Input Dialog */}
              <div
                className="absolute w-72 max-h-[calc(100vh-72px)] overflow-auto bg-white rounded-xl shadow-2xl border border-slate-200"
                style={draftPopoverPosition ? {
                  left: `${draftPopoverPosition.left - draft.x}px`,
                  top: `${draftPopoverPosition.top - draft.y}px`,
                } : undefined}
              >
                <div className="p-4">
                  <textarea
                    autoFocus
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="Type your comment here..."
                    className="w-full h-24 text-sm text-slate-800 placeholder-slate-400 border-none focus:ring-0 resize-none outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveDraft();
                      }
                      if (e.key === 'Escape') {
                        handleCancelDraft();
                      }
                    }}
                  />
                </div>
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={handleCancelDraft}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={!draftContent.trim()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
