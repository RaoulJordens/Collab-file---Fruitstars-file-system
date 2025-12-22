
import React, { ChangeEvent, ReactNode } from 'react';
import { Spinner } from './Icons';

// DIALOG
interface DialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    description: string;
    // Fix: Make children optional to resolve compiler issues with JSX nested elements
    children?: ReactNode;
    dialogClassName?: string;
    showCloseButton?: boolean;
}
export const Dialog = ({ title, description, children, isOpen, onOpenChange, dialogClassName = '', showCloseButton = false }: DialogProps) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };

    return (
        <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className={`bg-card text-card-foreground rounded-lg p-6 shadow-xl w-full sm:max-w-lg relative ${dialogClassName}`}>
                 {showCloseButton && (
                    <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-muted">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                )}
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                {children}
            </div>
        </div>
    );
};


// BUTTON
interface ButtonProps {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    // Fix: Make children optional to resolve compiler issues with JSX nested elements
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'destructive';
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    // Add type property to support 'submit' and 'button' types
    type?: 'button' | 'submit' | 'reset';
}
// Pass through the 'type' prop to the native button element
export const Button = ({ onClick, children, variant = 'primary', disabled = false, isLoading = false, className = '', type = 'button' }: ButtonProps) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled || isLoading} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            {children}
        </button>
    );
};

// FORM FIELD WRAPPER
interface FormFieldProps {
    label: string;
    htmlFor?: string;
    // Fix: Make children optional to resolve compiler issues with JSX nested elements
    children?: ReactNode;
}
export const FormField = ({ label, htmlFor, children }: FormFieldProps) => (
    <div className="grid w-full items-center gap-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">{label}</label>
        {children}
    </div>
);

// INPUT
// Fix: Added 'required' property to InputProps to support form validation and resolve type errors in LoginView
interface InputProps {
    id?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    required?: boolean;
}
// Fix: Destructured 'required' and passed it to the native input element
export const Input = ({ id, value, onChange, placeholder, type = 'text', className = '', onKeyDown, required }: InputProps) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        required={required}
        className={`mt-1 block w-full bg-input border-border rounded-md px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    />
);

// SELECT
interface SelectProps {
    id?: string;
    value: string | undefined;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    // Fix: Make children optional to resolve compiler issues with JSX nested elements
    children?: ReactNode;
}
export const Select = ({ id, value, onChange, disabled, children }: SelectProps) => (
    <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-input border-border focus:outline-none focus:ring-ring focus:border-ring sm:text-sm rounded-md disabled:opacity-50"
    >
        {children}
    </select>
);

// LISTBOX (for multi-line select)
interface ListboxProps {
    id?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    // Fix: Make children optional to resolve compiler issues with JSX nested elements
    children?: ReactNode;
    size?: number;
}
export const Listbox = ({ id, value, onChange, disabled, children, size = 5 }: ListboxProps) => (
     <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        size={size}
        className="mt-1 block w-full p-1 text-base bg-input border-border focus:outline-none focus:ring-ring focus:border-ring sm:text-sm rounded-md disabled:opacity-50"
    >
        {children}
    </select>
);
