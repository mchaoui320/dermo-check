import React from 'react';
import { appConfig } from '../config'; // Import appConfig to access theme

export const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        VOUS
    </div>
);

export const BotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);

export const PaperclipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 009 15.571V11a1 1 0112 0v4.571a1 1 00.725.962l5 1.428a1 1 001.17-1.408l-7-14z" />
    </svg>
);

export const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const RedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 12A8 8 0 1013 5.23" />
    </svg>
);

export const DermoCheckLogo: React.FC<{ size?: number; className?: string }> = ({ size, className }) => {
  // Responsive behavior rules (Increased by ~20%):
  // Mobile (< 768 px): max 144px (was 120px)
  // Tablet (768-1024 px): max 192px (was 160px)
  // Desktop (> 1024 px): max 264px (was 220px)
  // These classes apply when no specific size is passed (e.g. in Header)
  const responsiveClasses = !size ? "max-w-[144px] md:max-w-[192px] lg:max-w-[264px]" : "";

  return (
    <img
      src="https://protect-nuisible.com/wp-content/uploads/2025/11/logoderma.jpeg"
      alt="DermoCheck"
      className={`h-auto object-contain cursor-pointer ${responsiveClasses} ${className || ''}`}
      style={size ? { width: `${size}px`, maxWidth: '100%' } : undefined}
    />
  );
};