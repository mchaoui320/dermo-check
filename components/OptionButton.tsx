
import React, { forwardRef } from 'react';

interface OptionButtonProps {
    text: string;
    onClick: (text: string) => void;
}

const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(({ text, onClick }, ref) => {
    return (
        <button
            onClick={() => onClick(text)}
            className="w-full p-4 md:p-5 bg-white border border-gray-200 text-slate-700 rounded-2xl shadow-sm 
                       hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 
                       ease-in-out transform hover:-translate-y-1 text-base font-medium"
            ref={ref}
        >
            {text}
        </button>
    );
});

OptionButton.displayName = 'OptionButton'; // Add display name for forwardRef

export default OptionButton;