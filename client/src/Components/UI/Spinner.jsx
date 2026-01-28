import React from 'react';
import { FaCircleNotch } from 'react-icons/fa6';
import PropTypes from 'prop-types';

const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'text-sm',
        md: 'text-xl',
        lg: 'text-3xl',
    };

    return (
        <FaCircleNotch className={`animate-spin text-blue-600 ${sizes[size]} ${className}`} />
    );
};

Spinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
};

export default Spinner;
