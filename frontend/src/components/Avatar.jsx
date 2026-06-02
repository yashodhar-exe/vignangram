import React from 'react';
import { API_BASE_URL } from '../api/axios';

const Avatar = ({ url, name, className, style, fontSize, size }) => {
    const getImageUrl = (u) => {
        if (!u) return "";
        if (u.startsWith("http")) return u;
        return `${API_BASE_URL}${u}`;
    };

    const sizeStyle = size ? { width: size, height: size } : {};

    if (url) {
        return (
            <img 
                src={getImageUrl(url)} 
                alt={name || "User"} 
                className={className}
                style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    ...sizeStyle,
                    ...style
                }} 
            />
        );
    }

    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div 
            className={className}
            style={{
                borderRadius: '50%',
                backgroundColor: '#333',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: fontSize || 'inherit',
                ...sizeStyle,
                ...style
            }}
        >
            {firstLetter}
        </div>
    );
};

export default Avatar;
