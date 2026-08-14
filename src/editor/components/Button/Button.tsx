import { Link2, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { ButtonBlockData } from '../../lib/types';
import ColorPickerInput from '../ColorPickerInput';
import { ButtonContainer, RenderedButton } from './Button.styled';

type ButtonProps = {
  // Allows us to pass updates to the node
  onChange?: (data: ButtonBlockData) => void;
  // The initial state for our blocks' data
  initialState?: ButtonBlockData;
  // Indicates editor is in read-only mode. This disables all edit functionality
  readOnly: boolean;
  // add styles based on selection state
  isSelected?: boolean;
};

const Button = (props: ButtonProps) => {
  const [isEditable, setIsEditable] = useState(false);
  const {
    getValues,
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus,
    trigger,
  } = useForm({
    defaultValues: props.initialState || {},
    mode: 'onTouched',
  });

  const backgroundColor = watch('backgroundColor');
  const color = watch('color');
  const label = watch('label');
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (isEditable) {
      // Timeout required because the popover has an entry animation
      setTimeout(() => setFocus('label'), 150);
    }
  }, [isEditable, setFocus]);

  const onClose = async () => {
    await trigger();
    props?.onChange ? props?.onChange(getValues() as ButtonBlockData) : null;
    setIsEditable(false);
  };

  return (
    <form onSubmit={handleSubmit(() => null)}>
      <ButtonContainer isSelected={!!props.isSelected}>
        <Popover
          open={isEditable}
          onOpenChange={(open) => (open ? setIsEditable(true) : onClose())}
        >
          <PopoverTrigger
            // RenderedButton is a div, so Base UI must not assume a native button
            nativeButton={false}
            disabled={props.readOnly}
            render={
              <RenderedButton
                backgroundColor={backgroundColor ?? '#4C8BEA'}
                color={color ?? '#FFFFFF'}
                hasErrors={hasErrors}
              />
            }
          >
            {label}
          </PopoverTrigger>

          <PopoverContent
            align="center"
            side="bottom"
            className="w-72 space-y-2"
          >
            <div className="relative">
              <Pencil className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-invalid={!!errors?.label}
                className="pl-8"
                type="text"
                placeholder="Button text"
                {...register('label', { required: true })}
              />
            </div>

            <div className="relative">
              <Link2 className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-invalid={!!errors?.url}
                className="pl-8"
                type="text"
                placeholder="https://google.com"
                {...register('url', { required: true })}
              />
            </div>

            <div className="flex items-center gap-2">
              <ColorPickerInput
                hiddenField
                controlName="backgroundColor"
                control={control}
                defaultValue="#4C8BEA"
              />
              <span className="text-sm">Background</span>
            </div>

            <div className="flex items-center gap-2">
              <ColorPickerInput
                hiddenField
                controlName="color"
                control={control}
                defaultValue="#FFFFFF"
              />
              <span className="text-sm">Text Color</span>
            </div>
          </PopoverContent>
        </Popover>
      </ButtonContainer>
    </form>
  );
};

export default Button;
