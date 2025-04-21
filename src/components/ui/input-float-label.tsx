import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input" // Remove InputProps import
import { Label } from "@/components/ui/label"

interface InputFloatLabelProps extends React.InputHTMLAttributes<HTMLInputElement> { // Extend correct base attributes
  label: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

const InputFloatLabel = React.forwardRef<HTMLInputElement, InputFloatLabelProps>(
  ({ label, labelClassName, wrapperClassName, id, ...props }, ref) => { // Remove className, type, id from destructuring as they are in ...props
    const inputId = id || React.useId(); // Ensure there's an ID for label association

    return (
      <div className={cn("relative", wrapperClassName)}>
        <Input
          // type is passed via ...props
          id={inputId}
          className={cn(
            "peer h-10 pt-4 placeholder-transparent focus:placeholder-gray-400",
            props.className // Access className via props
          )}
          placeholder={label} // Use label as placeholder for accessibility and float trigger
          ref={ref}
          {...props}
        />
        <Label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 top-2 text-muted-foreground transition-all duration-200 ease-in-out",
            "peer-placeholder-shown:top-2 peer-placeholder-shown:text-base", // When placeholder (label) is shown (input empty)
            "peer-focus:top-1 peer-focus:text-xs", // On focus
            "peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs", // When input has value (placeholder not shown)
            labelClassName
          )}
        >
          {label}
        </Label>
      </div>
    )
  }
)
InputFloatLabel.displayName = "InputFloatLabel"

export { InputFloatLabel }