'use client';
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { saveField } from '@/lib/editorUtils';

interface Props {
  value: string;
  isEditable?: boolean;
  onSave?: (value: string) => void;
  /** Shorthand: if provided, EditableText wires saveField internally */
  currentPages?: any;
  sectionId?: string;
  fieldPath?: string;
  className?: string;
  tag?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'strong';
  placeholder?: string;
  style?: React.CSSProperties;
}

const STYLE_KEYS = [
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
  'letterSpacing', 'textAlign', 'textTransform', 'textDecoration',
  'color', 'backgroundColor', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
  'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'borderRadius', 'boxShadow', 'width', 'minWidth', 'maxWidth',
  'display', 'alignItems', 'justifyContent', 'gap', 'flexWrap',
] as const;

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
  const [inputStyle, setInputStyle] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [editing]);

  const startEditing = useCallback(() => {
    if (!isEditable) return;
    if (displayRef.current) {
      const computed = window.getComputedStyle(displayRef.current);
      const styles: Record<string, string> = {};
      for (const key of STYLE_KEYS) {
        styles[key] = computed.getPropertyValue(key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`));
      }
      setInputStyle(styles);
    }
    setEditValue(value);
    setEditing(true);
  }, [isEditable, value]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === value) {
      setEditValue(value);
      setEditing(false);
      return;
    }
    if (onSaveProp) {
      onSaveProp(trimmed);
    } else if (pages && sectionId && fieldPath) {
      saveField(dispatch, pages, sectionId, fieldPath, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="editable-input"
        style={{
          ...(inputStyle as React.CSSProperties),
          resize: 'none',
          overflow: 'hidden',
          outline: '1px dashed rgba(255, 255, 255, 0.5)',
          outlineOffset: '4px',
          borderRadius: '4px',
        }}
        rows={1}
      />
    );
  }

  const sharedClassName = `${className} ${isEditable ? 'editable-text' : ''}`;

  const handleRef = (el: any) => {
    displayRef.current = el;
  };

  return (
    <Tag
      ref={handleRef}
      className={sharedClassName}
      onClick={startEditing}
      style={passedStyle}
    >
      {value || placeholder}
    </Tag>
  );
}
