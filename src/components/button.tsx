import React, { ReactNode } from 'react';
import ButtonMUI from '@mui/material/Button';


interface ButtonsProps {
    children?: ReactNode;
    type?: 'button' | 'submit';
    disabled?: boolean;
    size?: string;
}

export default function Button({ children, type, disabled, size }: ButtonsProps) {
    return (
        <ButtonMUI
            variant="contained"
            type={type ? type : "button"}
            disabled={disabled}
            color="primary"
            style={{
                fontSize: size == 'large' ? '2.5rem' : '2rem',
                fontFamily: 'Poppins', 
                fontWeight: '500', 
                textTransform: 'capitalize',
                width: size == 'large' ? '32rem' : '24rem',
                height: '5rem',
                borderRadius: '1.5rem',
                boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
                margin: '1rem 0'
            }}
        >
            {children}
        </ButtonMUI>
    );
}
