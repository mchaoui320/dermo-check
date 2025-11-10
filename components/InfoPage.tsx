
import React from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';

interface InfoPageProps {
    config: PageConfig;
}

const Section: React.FC<{ title?: string; text?: string; type: string; primaryColor: string }> = ({ title, text, type, primaryColor }) => {
    if (type === 'text' && text) {
        // Simple text section, can contain bold markdown
        const formattedText = text.split('\n').map((paragraph, idx) => {
            // Replace **text** with <strong>text</strong>
            const html = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <p key={idx} className="my-2" dangerouslySetInnerHTML={{ __html: html }} />;
        });

        return (
            <div className="mb-8">
                {title && <h3 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: primaryColor }}>{title}</h3>}
                <div className="space-y-4 text-base text-slate-700 leading-relaxed">
                    {formattedText}
                </div>
            </div>
        );
    }
    return null;
};

const InfoPage: React.FC<InfoPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;

    return (
        <div 
            className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-left animate-fade-in shadow-xl"
            style={{ borderRadius: `${themeConfig.radius}px` }}
        >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">{config.title}</h2>
            
            {config.sections?.map((section, index) => (
                <Section 
                    key={index} 
                    title={section.title} 
                    text={section.text} 
                    type={section.type}
                    primaryColor={themeConfig.primaryColor}
                />
            ))}
        </div>
    );
};

export default InfoPage;