'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & past threshold -> Hide
                setIsVisible(false);
            } else {
                // Scrolling up -> Show
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Hide header on landing page
    if (pathname === '/') {
        return null;
    }

    return (
        <div
            className={`sticky top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            {children}
        </div>
    );
}
