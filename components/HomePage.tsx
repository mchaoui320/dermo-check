
import React from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';
import { DermoCheckLogo } from './icons'; // Import the DermoCheckLogo
import FeaturesSection from './FeaturesSection'; // Import the new FeaturesSection

interface HomePageProps {
    config: PageConfig;
    onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ config, onStart }) => {
    const heroConfig = appConfig.app.layout.hero;
    const themeConfig = appConfig.app.theme;

    // The 'cards' section for 'How it works' is now handled by FeaturesSection
    // const howItWorksSection = config.sections?.find(s => s.type === 'cards');
    const warningBanner = config.sections?.find(s => s.type === 'banner' && s.style === 'warning');

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full max-w-4xl mx-auto p-8 animate-fade-in">
            <div 
                className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 text-center shadow-xl w-full"
                style={{ borderRadius: `${themeConfig.radius}px` }}
            >
                {/* Hero Section */}
                <div className="mb-10">
                    {/* Illustration Placeholder */}
                    <div className="mb-6 flex justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div 
                            className="w-36 h-36 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: themeConfig.accent, color: themeConfig.primaryColor }}
                        >
                            {/* Replaced emoji with DermoCheckLogo */}
                            <DermoCheckLogo size={90} /> 
                        </div>
                    </div>

                    <h2 
                        className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight animate-fade-in" 
                        style={{ animationDelay: '0.2s' }}
                    >
                        {heroConfig.title}
                    </h2>
                    <p 
                        className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed animate-fade-in" 
                        style={{ animationDelay: '0.3s' }}
                    >
                        {heroConfig.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={onStart}
                            className="px-8 py-3 md:px-10 md:py-4 text-white text-lg rounded-full hover:opacity-90 transition-colors font-semibold shadow-lg"
                            style={{ backgroundColor: themeConfig.primaryColor }}
                        >
                            {heroConfig.cta.label}
                        </button>
                    </div>
                </div>

                {/* New Features Section */}
                <div className="mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">Comment ça marche ?</h3>
                    <FeaturesSection />
                </div>
                
                {/* Warning Banner */}
                {warningBanner && (
                    <div className="mt-8 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm rounded-lg animate-fade-in" style={{ animationDelay: '0.5s', borderRadius: `${themeConfig.radius - 5}px` }}>
                        <p>{warningBanner.text}</p>
                    </div>
                )}

                <p className="mt-10 text-sm md:text-base font-medium text-slate-500 italic animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    {appConfig.app.layout.header.subtitle}
                </p>
            </div>
        </div>
    );
};

export default HomePage;
