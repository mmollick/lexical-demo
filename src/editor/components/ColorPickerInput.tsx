import { useState } from 'react';
import { ChromePicker } from 'react-color';
import { Control, useController } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ColorPickerInputProps = {
  // The field name for React Hook Form
  controlName: string;
  // React Hook Form controller instance
  control: Control<any, any>;
  // The default value for React Hook Form to start with
  defaultValue: string;
  // Allows us to hide the text value and show the swatch on its own
  hiddenField?: boolean;
};

/**
 * A color input backed by react-color's ChromePicker and react-hook-form's
 * useController.
 */
const ColorPickerInput = ({
  controlName,
  control,
  defaultValue,
  hiddenField = false,
}: ColorPickerInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name: controlName,
    defaultValue: defaultValue,
    rules: {
      pattern: {
        value: /^#[0-9A-F]{6}$/i,
        message: 'Invalid color format, only hex colors are allowed.',
      },
    },
  });

  return (
    <ColorPickerBaseInput
      errorMessage={error?.message}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
      value={field.value}
      name={field.name || ''}
      inputRef={field.ref}
      hiddenField={hiddenField}
    />
  );
};

type ColorPickerBaseInputProps = {
  // Unable to use "onChange" here because it conflicts with native event's signature
  onValueChange: (color: string) => void;
  // The current value
  value: string;
  // Allows us to hide the text value and show the swatch on its own
  hiddenField?: boolean;
  // The error message to display
  errorMessage?: string;
  name?: string;
  onBlur?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
};

/** Controlled input variant */
export const ColorPickerBaseInput = ({
  onValueChange,
  value,
  hiddenField = false,
  errorMessage,
  name,
  onBlur,
  inputRef,
  className,
}: ColorPickerBaseInputProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border border-input bg-transparent px-2 py-1 shadow-xs',
          hiddenField && 'w-fit border-0 p-0 shadow-none',
          errorMessage && 'border-destructive',
        )}
      >
        <button
          type="button"
          aria-label="Pick a color"
          onClick={() => setShowColorPicker(true)}
          className={cn(
            'size-6 shrink-0 cursor-pointer rounded-sm border border-input',
            hiddenField && 'size-7',
          )}
          style={{ backgroundColor: value }}
        />
        {!hiddenField && (
          <Input
            name={name}
            ref={inputRef}
            onBlur={onBlur}
            onFocus={() => setShowColorPicker(true)}
            onChange={(e) => onValueChange(e.target.value)}
            value={value}
            className="h-6 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        )}
      </div>

      {errorMessage && (
        <p className="mt-1 text-xs text-destructive">{errorMessage}</p>
      )}

      {showColorPicker && (
        <div className="absolute z-50">
          {/*
           * A fixed cover rather than a click-outside listener: Lexical needs
           * the click that dismisses the picker to not also land in the editor.
           */}
          <div
            className="fixed inset-0"
            onClick={() => setShowColorPicker(false)}
          />
          <div className="relative">
            <ChromePicker
              color={value}
              disableAlpha={true}
              onChange={(color) => onValueChange(color.hex)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerInput;
