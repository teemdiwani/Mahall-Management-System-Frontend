import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, icon, iconRight, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl border text-base sm:text-sm py-2 sm:py-2.5 outline-none transition-all
              ${icon ? 'pl-11 sm:pl-11' : 'pl-3.5 sm:pl-4'}
              ${iconRight ? 'pr-11 sm:pr-11' : 'pr-3.5 sm:pr-4'}
              ${error
                ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-gray-900 dark:text-gray-100 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950'
              }
              placeholder:text-gray-400 dark:placeholder:text-gray-500 ${className}`}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 flex items-center justify-center">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        {helper && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
      <textarea
        ref={ref}
        className={`w-full rounded-xl border text-base sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 outline-none transition-all resize-none
          ${error ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'}
          placeholder:text-gray-400 ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
