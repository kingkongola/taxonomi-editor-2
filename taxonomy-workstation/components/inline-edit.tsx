import { useState, useEffect, useRef } from 'react';

interface InlineEditProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  as?: 'input' | 'textarea';
}

export function InlineEdit({ value: initialValue, onSave, className, as = 'input', ...props }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      if (value !== initialValue) {
        onSave(value);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(initialValue);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onSave(value);
    }
  };

  if (isEditing) {
    if (as === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`bg-slate-900 text-slate-100 border border-blue-500 rounded px-1 outline-none w-full resize-none ${className}`}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`bg-slate-900 text-slate-100 border border-blue-500 rounded px-1 outline-none w-full ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-slate-900/50 hover:ring-1 hover:ring-slate-700 rounded px-1 -mx-1 transition-all ${className}`}
      title="Click to edit"
    >
      {value}
    </div>
  );
}
