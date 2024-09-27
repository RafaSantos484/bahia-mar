import React from 'react';
import TextField from '@mui/material/TextField';

import './input.scss'

interface InputProps {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    required?: boolean;
    fullWidth?: boolean;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export default function Input({ label, required, type, value, fullWidth, onChange, inputProps }: InputProps) {
    return (
        <TextField
            label={label}
            variant="outlined"
            required={required}
            type={type}
            value={value}
            fullWidth={fullWidth}
            onChange={onChange}
            inputProps={inputProps}
            className='input-container'
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
