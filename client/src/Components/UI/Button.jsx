import React from 'react';
import { FaCircleNotch } from 'react-icons/fa6';
import PropTypes from 'prop-types';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    disabled = false,
    className = '',
    onClick,
    ...props
}) => {
    const baseStyles = "font-bold rounded-none transition-all duration-300 flex justify-center items-center hover:shadow-premium-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 border";

    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 border-primary-600",
        danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
        success: "bg-green-600 text-white hover:bg-green-700 border-green-600",
        outline: "bg-transparent border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20",
        ghost: "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent",
    };

    const sizes = {
        sm: "py-1 px-3 text-sm",
        md: "py-3 px-6 text-base",
        lg: "py-4 px-8 text-lg",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <>
                    <FaCircleNotch className="animate-spin mr-2" />
                    {children}
                </>
            ) : (
                children
            )}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'danger', 'success', 'outline', 'ghost']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    fullWidth: PropTypes.bool,
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Button;
