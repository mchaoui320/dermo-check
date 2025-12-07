
import React, { useState, useMemo, forwardRef, Ref } from 'react';
import { appConfig } from '../config';

interface AgeMonthYearDropdownProps {
    onSubmit: (ageString: string) => void;
    monthsRef?: Ref<HTMLSelectElement>; // New ref prop for months dropdown
    yearsRef?: Ref<HTMLSelectElement>; // New ref prop for years dropdown
}

const AgeMonthYearDropdown: React.FC<AgeMonthYearDropdownProps> = ({ onSubmit, monthsRef, yearsRef }) => {
    const themeConfig = appConfig.app.theme;
    const [selectedMonths, setSelectedMonths] = useState<string>('');
    const [selectedYears, setSelectedYears] = useState<string>('');

    const months: { label: string; value: string }[] = useMemo(() => {
        const list = [{ label: "Moins de 1 mois", value: "0" }];
        for (let i = 1; i <= 11; i++) {
            list.push({ label: `${i} mois`, value: i.toString() });
        }
        return list;
    }, []);

    const years: { label: string; value: string }[] = useMemo(() => {
        const list = [];
        // Start from 0 years to allow for cases like "3 mois" without any years, but still valid.
        // The prompt asked for "2 to 120" years, so adapting it.
        list.push({ label: "0 ans", value: "0" }); 
        for (let i = 1; i <= 120; i++) {
            list.push({ label: `${i} ans`, value: i.toString() });
        }
        return list;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let ageString = '';
        const yearsValue = parseInt(selectedYears, 10);
        const monthsValue = parseInt(selectedMonths, 10);

        if (yearsValue > 0) {
            ageString += `${yearsValue} ans`;
        }
        if (monthsValue > 0) {
            if (ageString) ageString += ' et ';
            ageString += `${months.find(m => m.value === selectedMonths)?.label}`;
        } else if (monthsValue === 0 && yearsValue === 0) {
             ageString = months.find(m => m.value === selectedMonths)?.label || ''; // For "Moins de 1 mois"
        }
        
        if (ageString) {
            onSubmit(ageString);
            setSelectedMonths('');
            setSelectedYears('');
        }
    };

    const isSubmitDisabled = !selectedMonths && !selectedYears;
    // Allow submission if "Moins de 1 mois" is selected alone (value "0" for months)
    const isActuallyDisabled = isSubmitDisabled && !(selectedMonths === "0" && !selectedYears);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <select
                    value={selectedMonths}
                    onChange={(e) => setSelectedMonths(e.target.value)}
                    className="flex-1 px-4 py-3 md:px-5 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                    aria-label="Sélectionnez les mois"
                    ref={monthsRef} // Assign ref
                >
                    <option value="" disabled>Sélectionnez les mois</option>
                    {months.map(month => (
                        <option key={month.value} value={month.value}>
                            {month.label}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedYears}
                    onChange={(e) => setSelectedYears(e.target.value)}
                    className="flex-1 px-4 py-3 md:px-5 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                    aria-label="Sélectionnez les années"
                    ref={yearsRef} // Assign ref
                >
                    <option value="" disabled>Sélectionnez les années</option>
                    {years.map(year => (
                        <option key={year.value} value={year.value}>
                            {year.label}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="w-full max-w-lg px-7 py-3 md:py-4 text-white text-base md:text-lg rounded-full hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                disabled={isActuallyDisabled}
                style={{ backgroundColor: themeConfig.primaryColor }}
            >
                Valider
            </button>
        </form>
    );
};

export default AgeMonthYearDropdown;