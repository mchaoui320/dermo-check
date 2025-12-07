import React from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';

interface AboutPageProps {
    config: PageConfig;
}

const Section: React.FC<{ title: string; children: React.ReactNode; primaryColor: string }> = ({ title, children, primaryColor }) => (
    <div className="mb-10">
        <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: primaryColor }}>{title}</h3>
        <div className="space-y-4 text-base md:text-lg text-slate-700 leading-relaxed">{children}</div>
    </div>
);

const AboutPage: React.FC<AboutPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;

    return (
        <div 
            className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-10 text-left animate-fade-in shadow-xl"
            style={{ borderRadius: `${themeConfig.radius}px` }}
        >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 text-center">{config.title}</h2>
            
            {config.sections?.map((section, index) => (
                <Section key={index} title={section.title || ''} primaryColor={themeConfig.primaryColor}>
                    {section.type === 'text' && section.text && <p>{section.text}</p>}
                    {section.type === 'warning' && section.text && (
                        <div className="mt-6 p-5 bg-red-50 border border-red-200 text-red-900 text-sm md:text-base rounded-xl shadow-inner">
                            <p className="font-bold mb-3 text-red-800">⚠️ AVERTISSEMENT CRUCIAL</p>
                            <p>{section.text}</p>
                        </div>
                    )}
                </Section>
            ))}
        </div>
    );
};

export default AboutPage;