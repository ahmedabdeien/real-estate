import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
    label,
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    className = '',
    min,
    max,
    ...props
}) => {
    const baseStyles = "w-full p-3 border-gray-200 border-[1px] rounded-none dark:bg-gray-800/30 dark:border-gray-500 dark:placeholder:text-gray-300 focus:transition-shadow focus:duration-300 focus:ring-0 focus:border-primary-600 focus:shadow-[0_0px_0px_1px] focus:shadow-primary-600 dark:focus:border-gray-700 outline-none";

    const errorStyles = error ? "border-red-500 focus:shadow-red-500 focus:border-red-500" : "";

    if (type === 'textarea') {
        return (
            <div className={`w-full space-y-1 ${className}`}>
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <textarea
                    id={id}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`${baseStyles} ${errorStyles} min-h-[100px]`}
                    {...props}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }

    return (
        <div className={`w-full space-y-1 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    min={min}
                    max={max}
                    className={`${baseStyles} ${errorStyles} ${props.suffix ? 'pe-10' : ''}`}
                    {...props}
                />
                {props.suffix && (
                    <div className="absolute inset-y-0 end-0 flex items-center pe-3">
                        {props.suffix}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    suffix: PropTypes.node,
};

export default Input;
