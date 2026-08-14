import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';

import { SimpleMenuItem, SimplePopover } from './Toolbar.styled';

type ToolbarSelectProps = {
  value: string;
  options: [string, string][];
  onChange: (val: string) => void;
};

const ToolbarSelect = (props: ToolbarSelectProps) => {
  const [containerRef, showDropdown, setShowDropdown] =
    useCloseOnClickOutside<HTMLDivElement>();

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleClick = (value: string) => {
    setShowDropdown(false);
    props.onChange(value);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={toggleDropdown}
        className="flex min-w-8 cursor-pointer items-center gap-1 rounded-lg border border-input px-2 py-1.5 text-xs select-none hover:border-muted-foreground"
      >
        {props.value}
        {/* Rendered inside the container so the click lands on the onClick above */}
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground',
            showDropdown && 'rotate-180',
          )}
        />
      </div>
      {showDropdown && (
        <SimplePopover>
          {props.options.map(([option, text]) => (
            <SimpleMenuItem
              key={option}
              value={option}
              onClick={() => handleClick(option)}
              selected={props.value === option}
            >
              {text}
            </SimpleMenuItem>
          ))}
        </SimplePopover>
      )}
    </div>
  );
};

export default ToolbarSelect;
