import React from 'react';
import TextField from '@mui/material/TextField';

import './input.scss';

interface InputProps {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'file';
    required?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    value?: string;
    accept?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, required, type = 'text', value, fullWidth, onChange, inputProps, accept, disabled }, ref) => {
        return (
            <TextField
                label={label}
                variant="outlined"
                disabled={disabled}
                required={required}
                type={type}
                value={value}
                fullWidth={fullWidth}
                onChange={onChange}
                inputProps={{ ...inputProps, accept }}
                className='input-container'
                ref={ref}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        fontSize: '2rem',
                        borderRadius: '1.5rem',
                        boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '2rem',
                    },
                    '@media (max-width: 600px)': { 
                        '& .MuiOutlinedInput-root': {
                            fontSize: '1.5rem',
                            borderRadius: '1rem',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '1.5rem',
                        },
                    },
                }}
            />
        );
    }
);

export default Input;
