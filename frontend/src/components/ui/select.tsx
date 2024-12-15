// frontend/src/components/ui/select.tsx
import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const Select = RadixSelect.Root;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-between w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white shadow-sm hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500",
      className
    )}
    {...props}
  >
    <RadixSelect.Value placeholder="Select an option" />
    <RadixSelect.Icon className="ml-2">
      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        "overflow-hidden bg-neutral-800 border border-neutral-700 rounded-md shadow-lg",
        className
      )}
      {...props}
    >
      <RadixSelect.Viewport className="p-2">
        {children}
      </RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      "flex items-center relative px-3 py-2 rounded-md text-sm text-white hover:bg-teal-500 focus:bg-teal-500 focus:outline-none",
      className
    )}
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator className="absolute left-2 inline-flex items-center">
      <CheckIcon className="w-4 h-4 text-teal-500" />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Label>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Label
    ref={ref}
    className={cn(
      "px-3 py-1.5 text-xs font-semibold text-gray-400",
      className
    )}
    {...props}
  >
    {children}
  </RadixSelect.Label>
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(({ className, ...props }, ref) => (
  <RadixSelect.Separator
    ref={ref}
    className={cn("my-1 h-px bg-gray-700", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectValue = RadixSelect.Value;

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
