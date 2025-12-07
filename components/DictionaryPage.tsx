
import React, { useState, useMemo } from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';

interface DictionaryPageProps {
    config: PageConfig;
}

interface DictionaryTerm {
    term: string;
    definition: string;
}

const DictionaryPage: React.FC<DictionaryPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

    const dictionarySection = config.sections?.find(s => s.type === 'dictionary');
    const allTerms: DictionaryTerm[] = dictionarySection?.dictionaryTerms || [];

    // Group terms by first letter
    const groupedTerms = useMemo(() => {
        const groups: { [key: string]: DictionaryTerm[] } = {};
        allTerms.forEach(item => {
            const firstLetter = item.term.charAt(0).toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(item);
        });
        return groups;
    }, [allTerms]);

    const alphabet = useMemo(() => {
        return Object.keys(groupedTerms).sort();
    }, [groupedTerms]);

    const handleTermClick = (term: string) => {
        setSelectedTerm(prev => (prev === term ? null : term));
    };

    return (
        <div 
            className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-left animate-fade-in shadow-xl"
            style={{ borderRadius: `${themeConfig.radius}px` }}
        >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">{config.title}</h2>
            {config.description && <p className="text-base md:text-lg text-slate-600 mb-8 text-center">{config.description}</p>}

            {alphabet.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {alphabet.map(letter => (
                        <div key={letter} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-2xl font-bold mb-4" style={{ color: themeConfig.primaryColor }}>{letter}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groupedTerms[letter].map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <button
                                            onClick={() => handleTermClick(item.term)}
                                            className="text-left text-lg md:text-xl font-semibold text-slate-800 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md py-1"
                                            aria-expanded={selectedTerm === item.term}
                                            aria-controls={`definition-${item.term.replace(/\s/g, '-')}`} // Link button to definition
                                        >
                                            {item.term}
                                        </button>
                                        {selectedTerm === item.term && (
                                            <p 
                                                id={`definition-${item.term.replace(/\s/g, '-')}`} // ID for aria-controls
                                                className="mt-2 text-slate-700 text-sm md:text-base bg-blue-50 p-3 rounded-lg animate-fade-in leading-relaxed"
                                                role="region" // Semantically mark as a region
                                                aria-labelledby={`definition-label-${item.term.replace(/\s/g, '-')}`} // Link to a label if needed
                                            >
                                                {item.definition}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-600 text-base md:text-lg">Aucun terme disponible pour le moment.</p>
            )}
        </div>
    );
};

export default DictionaryPage;