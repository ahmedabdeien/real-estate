import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};
const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg', icon: 'btn-icon' };

const Button = ({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) => (
  <button className={`btn ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
    {loading ? <FaSpinner className="animate-spin" /> : children}
  </button>
);

export default Button;
