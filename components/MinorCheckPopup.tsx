
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { appConfig } from '../config';

interface MinorCheckPopupProps {
    onConfirmAdult: () => void;
    onConfirmMinor: () => void;
}

const MinorCheckPopup: React.FC<MinorCheckPopupProps> = ({ onConfirmAdult, onConfirmMinor }) => {
    const themeConfig = appConfig.app.theme;
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);

    // Callback to disable/enable tabIndex for elements outside the modal
    const toggleTabIndexForMainContent = useCallback((enable: boolean) => {
        const mainAppContainer = document.querySelector('.flex.flex-col.min-h-screen.font-sans'); 
        if (mainAppContainer) {
            const focusableElements = mainAppContainer.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            focusableElements.forEach(element => {
                if (element instanceof HTMLElement) {
                    if (enable) {
                        const originalTabIndex = element.dataset.originalTabIndex;
                        if (originalTabIndex) {
                            element.tabIndex = parseInt(originalTabIndex, 10);
                            delete element.dataset.originalTabIndex;
                        } else if (element.tabIndex === -1) {
                            element.tabIndex = 0; 
                        }
                    } else {
                        if (element.tabIndex !== -1 && !element.hasAttribute('disabled')) { 
                            element.dataset.originalTabIndex = element.tabIndex.toString(); 
                            element.tabIndex = -1; 
                        }
                    }
                }
            });
        }
    }, []);

    // Effect for focus trapping
    useEffect(() => {
        triggerElementRef.current = document.activeElement as HTMLElement;
        toggleTabIndexForMainContent(false);

        const modalElement = modalRef.current;
        if (modalElement) {
            const focusableElements = modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            firstElement?.focus();

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Tab') {
                    if (event.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement?.focus();
                            event.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement?.focus();
                            event.preventDefault();
                        }
                    }
                }
            };

            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                toggleTabIndexForMainContent(true);

                if (triggerElementRef.current) {
                    triggerElementRef.current.focus();
                }
            };
        }
    }, [toggleTabIndexForMainContent]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 animate-fade-in p-4"
             role="dialog" aria-modal="true" aria-labelledby="profile-selection-title"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl minor-check-popup-scale-in"
                style={{ borderRadius: `${themeConfig.radius}px` }}
            >
                <div className="mb-6 flex justify-center text-5xl" style={{ color: themeConfig.primaryColor }}>
                    <span role="img" aria-label="Doctor">⚕️</span>
                </div>
                <h2 id="profile-selection-title" className="text-2xl font-bold text-slate-900 mb-4">Bienvenue sur DERMO-CHECK</h2>
                <p className="text-slate-700 text-base mb-6">
                    Pour personnaliser votre expérience, veuillez indiquer votre profil.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onConfirmAdult}
                        className="px-6 py-3 text-white text-base rounded-full hover:opacity-90 transition-colors font-semibold shadow-lg"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                    >
                        Je suis majeur
                    </button>
                    <button
                        onClick={onConfirmMinor}
                        className="px-6 py-3 border rounded-full transition-colors font-semibold text-slate-700 hover:bg-gray-100"
                        style={{ borderColor: themeConfig.primaryColor }}
                    >
                        Je suis mineur
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes minor-check-popup-scale-in-animation {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .minor-check-popup-scale-in {
                    animation: minor-check-popup-scale-in-animation 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MinorCheckPopup;
