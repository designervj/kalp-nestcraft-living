'use client';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { saveField } from '@/lib/editorUtils';
import { Check, X } from 'lucide-react';

interface Props {
  value: string;
  isEditable?: boolean;
  onSave?: (value: string) => void | boolean | Promise<void | boolean>;
  /** Shorthand: if provided, EditableText wires saveField internally */
  currentPages?: any;
  sectionId?: string;
  fieldPath?: string;
  className?: string;
  tag?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'strong';
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function EditableText({
  value,
  isEditable: isEditableProp,
  onSave: onSaveProp,
  currentPages,
  sectionId,
  fieldPath,
  className = '',
  tag: Tag = 'span',
  placeholder = '',
  style: passedStyle,
}: Props) {
  const dispatch = useAppDispatch();
  const storeIsEditable = useAppSelector((s) => s.pages?.isEditable);
  const storeCurrentPages = useAppSelector((s) => s.pages?.currentPages);

  const isEditable = isEditableProp ?? storeIsEditable;
  const pages = currentPages ?? storeCurrentPages;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalValue, setHasLocalValue] = useState(false);
  const editorRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasLocalValue && value === displayValue) {
      setHasLocalValue(false);
    }

    if (!editing) {
      if (hasLocalValue && value !== displayValue) return;
      setDisplayValue(value);
      setEditValue(value);
      if (editorRef.current && editorRef.current.textContent !== value) {
        editorRef.current.textContent = value || placeholder;
      }
    }
  }, [displayValue, editing, hasLocalValue, placeholder, value]);

  const startEditing = (event?: React.MouseEvent<HTMLElement>) => {
    if (!isEditable) return;

    event?.preventDefault();
    event?.stopPropagation();

    if (editing) return;

    setEditing(true);
    setEditValue(displayValue);

    requestAnimationFrame(() => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();

      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  };

  const cancelEditing = () => {
    setEditValue(displayValue);
    setEditing(false);
    if (editorRef.current) {
      editorRef.current.textContent = displayValue || placeholder;
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    const latestValue = editorRef.current?.textContent ?? editValue;
    const trimmed = latestValue.trim();
    if (!trimmed || trimmed === displayValue) {
      setEditValue(displayValue);
      setEditing(false);
      return;
    }
    const previousValue = displayValue;
    setIsSaving(true);
    setDisplayValue(trimmed);
    setHasLocalValue(true);
    if (onSaveProp) {
      const saved = await Promise.resolve(onSaveProp(trimmed));
      if (saved === false) {
        setIsSaving(false);
        setHasLocalValue(false);
        setDisplayValue(previousValue);
        setEditValue(previousValue);
        setEditing(true);
        return;
      }
    } else if (pages && sectionId && fieldPath) {
      const saved = await saveField(dispatch, pages, sectionId, fieldPath, trimmed);
      if (!saved) {
        setIsSaving(false);
        setHasLocalValue(false);
        setDisplayValue(previousValue);
        setEditValue(previousValue);
        setEditing(true);
        return;
      }
    }
    setIsSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const handleInput = (event: React.FormEvent<HTMLElement>) => {
    setEditValue(event.currentTarget.textContent || '');
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLElement>) => {
    event.preventDefault();
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
  };

  const sharedClassName = `${className} ${isEditable ? 'editable-text' : ''} ${editing ? 'editable-text-active' : ''}`;

  const editor = (
    <Tag
      ref={editorRef as any}
      className={sharedClassName}
      contentEditable={editing}
      suppressContentEditableWarning
      role={isEditable ? 'textbox' : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onClick={startEditing}
      onDoubleClick={startEditing}
      onInput={handleInput}
      onBlur={(event) => {
        if (!editing) return;
        const nextFocus = event.relatedTarget as Node | null;
        if (nextFocus && wrapperRef.current?.contains(nextFocus)) return;
        void handleSave();
      }}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      style={passedStyle}
    >
      {displayValue || placeholder}
    </Tag>
  );

  if (!editing) return editor;

  return (
    <span ref={wrapperRef} className="editable-control-wrap" onClick={(event) => event.stopPropagation()}>
      {editor}
      <span className="editable-controls">
        <button
          type="button"
          className="editable-control-button editable-control-save"
          disabled={isSaving}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => void handleSave()}
        >
          <Check size={14} />
          {isSaving ? 'Saving' : 'Save'}
        </button>
        <button
          type="button"
          className="editable-control-button editable-control-cancel"
          disabled={isSaving}
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancelEditing}
        >
          <X size={14} />
          Cancel
        </button>
      </span>
    </span>
  );
}
