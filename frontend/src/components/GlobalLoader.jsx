import { useState, useEffect } from 'react';
import './GlobalLoader.css';

function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleShow = () => setIsLoading(true);
        const handleHide = () => setIsLoading(false);

        window.addEventListener('show-loader', handleShow);
        window.addEventListener('hide-loader', handleHide);

        return () => {
            window.removeEventListener('show-loader', handleShow);
            window.removeEventListener('hide-loader', handleHide);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="global-loader-overlay">
            <div className="spinner">
                <div className="double-bounce1"></div>
                <div className="double-bounce2"></div>
            </div>
        </div>
    );
}

export default GlobalLoader;
