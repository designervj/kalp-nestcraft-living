'use client';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { saveField } from '@/lib/editorUtils';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (hasLocalValue && value === displayValue) {
      setHasLocalValue(false);
    }

    if (!editing) {
      if (hasLocalValue && value !== displayValue) return;
      setDisplayValue(value);
      setEditValue(value);
    }
  }, [displayValue, editing, hasLocalValue, placeholder, value]);

  useEffect(() => {
    if (!editing) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [editing]);

  const startEditing = (event?: React.MouseEvent<HTMLElement>) => {
    if (!isEditable) return;

    event?.preventDefault();
    event?.stopPropagation();

    if (editing) return;

    setEditing(true);
    setEditValue(displayValue);
  };

  const cancelEditing = () => {
    setEditValue(displayValue);
    setEditing(false);
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    const latestValue = inputRef.current?.value ?? editValue;
    const trimmed = latestValue.trim();
    if (!trimmed || trimmed === displayValue) {
      setEditValue(displayValue);
      setEditing(false);
      return;
    }
    const previousValue = displayValue;
    savingRef.current = true;
    setIsSaving(true);
    setDisplayValue(trimmed);
    setHasLocalValue(true);
    let saved: void | boolean = true;
    try {
      if (onSaveProp) {
        saved = await Promise.resolve(onSaveProp(trimmed));
      } else if (pages && sectionId && fieldPath) {
        saved = await saveField(dispatch, pages, sectionId, fieldPath, trimmed);
      }
    } catch {
      saved = false;
    }

    if (saved === false) {
      savingRef.current = false;
      setIsSaving(false);
      setHasLocalValue(false);
      setDisplayValue(previousValue);
      setEditValue(previousValue);
      setEditing(true);
      return;
    }
    savingRef.current = false;
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

  const sharedClassName = `${className} ${isEditable ? 'editable-text' : ''} ${editing ? 'editable-text-active' : ''}`;

  if (editing) {
    return (
      <Tag className={sharedClassName} style={passedStyle}>
        <input
          ref={inputRef}
          className="editable-inline-input"
          value={editValue}
          placeholder={placeholder}
          disabled={isSaving}
          aria-label="Edit text"
          onChange={(event) => setEditValue(event.currentTarget.value)}
          onBlur={() => void handleSave()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={handleKeyDown as any}
          style={{
            width: `${Math.max(editValue.length, displayValue.length, placeholder.length, 2) + 1}ch`,
          }}
        />
      </Tag>
    );
  }

  const editor = (
    <Tag
      className={sharedClassName}
      role={isEditable ? 'textbox' : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onClick={startEditing}
      onDoubleClick={startEditing}
      onKeyDown={handleKeyDown}
      style={passedStyle}
    >
      {displayValue || placeholder}
    </Tag>
  );

  return editor;
}
