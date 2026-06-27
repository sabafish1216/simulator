import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';

function sanitizeNumericInput(raw, { allowDecimal }) {
  if (allowDecimal) {
    let sanitized = raw.replace(/[^\d.]/g, '');
    const dotIndex = sanitized.indexOf('.');
    if (dotIndex !== -1) {
      sanitized =
        sanitized.slice(0, dotIndex + 1) +
        sanitized.slice(dotIndex + 1).replace(/\./g, '');
    }
    return sanitized;
  }
  return raw.replace(/\D/g, '');
}

function parseNumeric(text, { allowDecimal }) {
  if (text === '' || text === '.') return null;
  const parsed = allowDecimal ? parseFloat(text) : parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDisplayValue(value, allowEmpty) {
  if (allowEmpty && (value === null || value === undefined || value === '')) {
    return '';
  }
  return String(value ?? '');
}

function clampValue(value, min, max) {
  let next = value;
  if (min != null) next = Math.max(min, next);
  if (max != null) next = Math.min(max, next);
  return next;
}

/**
 * 数字入力用 TextField。入力中は空欄を許可し、フォーカスが外れたときに確定する。
 */
function NumericTextField({
  value,
  onCommit,
  defaultOnEmpty = 0,
  allowDecimal = false,
  allowEmpty = false,
  min,
  max,
  ...textFieldProps
}) {
  const [text, setText] = useState(() => formatDisplayValue(value, allowEmpty));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(formatDisplayValue(value, allowEmpty));
    }
  }, [value, focused, allowEmpty]);

  const commit = (rawText) => {
    if (rawText === '') {
      if (allowEmpty) {
        onCommit(null);
        return;
      }
      const fallback = clampValue(defaultOnEmpty, min, max);
      setText(String(fallback));
      onCommit(fallback);
      return;
    }

    let parsed = parseNumeric(rawText, { allowDecimal });
    if (parsed === null) {
      parsed = defaultOnEmpty;
    }
    parsed = clampValue(parsed, min, max);

    const display = allowDecimal ? String(parsed) : String(Math.trunc(parsed));
    setText(display);
    onCommit(parsed);
  };

  const handleBlur = () => {
    setFocused(false);
    commit(text);
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={text}
      onChange={(e) => {
        setText(sanitizeNumericInput(e.target.value, { allowDecimal }));
      }}
      onFocus={(e) => {
        setFocused(true);
        textFieldProps.onFocus?.(e);
      }}
      onBlur={(e) => {
        handleBlur();
        textFieldProps.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
        textFieldProps.onKeyDown?.(e);
      }}
    />
  );
}

export default NumericTextField;
