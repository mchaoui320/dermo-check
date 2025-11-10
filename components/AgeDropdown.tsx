
import React, { useState, forwardRef } from 'react';
import { appConfig } from '../config';

interface AgeDropdownProps {
    onSubmit: (age: string) => void;
    minAge?: number; // New: min age prop
    maxAge?: number; // New: max age prop
}

const AgeDropdown = forwardRef<HTMLSelectElement, AgeDropdownProps>(({ onSubmit, minAge = 18, maxAge = 120 }, ref) => {
    const themeConfig = appConfig.app.theme;
    const [selectedAge, setSelectedAge] = useState<string>('');

    const ages: number[] = [];
    for (let i = minAge; i <= maxAge; i++) {
        ages.push(i);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAge) {
            onSubmit(selectedAge);
            setSelectedAge(''); // Reset after submission
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
            <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                aria-label="Sélectionnez votre âge"
                required
                ref={ref} // Forward the ref to the select element
            >
                <option value="" disabled>Sélectionnez votre âge</option>
                {ages.map(age => (
                    <option key={age} value={age}>
                        {age} ans
                    </option>
                ))}
            </select>
            <button
                type="submit"
                className="w-full max-w-lg px-7 py-3 md:py-4 bg-emerald-600 text-white text-base md:text-lg rounded-full hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                disabled={!selectedAge}
                style={{ backgroundColor: themeConfig.primaryColor }}
            >
                Valider
            </button>
        </form>
    );
});

AgeDropdown.displayName = 'AgeDropdown'; // Add display name for forwardRef

export default AgeDropdown;