import React, { useState, useCallback, useMemo, useEffect } from 'react';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import Questionnaire from './Questionnaire';
import BlogPage from './components/BlogPage';
import ContactPage from './components/ContactPage';
import DictionaryPage from './components/DictionaryPage';
import InfoPage from './components/InfoPage';
import { appConfig } from './config';
import { PageConfig } from './types';
import MinorCheckPopup from './components/MinorCheckPopup';
import DermatologistFinder from './components/DermatologistFinder';
import DermatologistListPage from './components/DermatologistListPage';
import { DermoCheckLogo } from './components/icons';
import { searchDermatologistsWithMaps } from './services/geminiService';
import { GenerateContentResponse, LatLng } from '@google/genai';

// --- Icons for Menu ---
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

type PageId = string;
type UserProfile = 'adult' | 'minor' | null;

const NavItem: React.FC<{ label: string; active: boolean; onClick: () => void; mobile?: boolean }> = ({ label, active, onClick, mobile }) => {
    // Desktop styles (Dark text on Light Green header)
    const desktopBase = "px-3 py-2 text-base font-medium transition-all duration-200 ease-in-out rounded-xl whitespace-nowrap border border-transparent";
    const desktopActive = "bg-emerald-700 text-white font-bold shadow-sm border-emerald-800";
    const desktopInactive = "text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/50";

    // Mobile styles (Drawer is white)
    const mobileBase = "block w-full text-left px-4 py-3 text-lg font-medium border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-slate-700";
    const mobileActive = "text-emerald-800 bg-emerald-50 font-bold";
    const mobileInactive = "text-slate-700";

    const classes = mobile
        ? `${mobileBase} ${active ? mobileActive : mobileInactive}`
        : `${desktopBase} ${active ? desktopActive : desktopInactive}`;

    return (
        <button
            onClick={onClick}
            className={classes}
            aria-current={active ? "page" : undefined}
        >
            {label}
        </button>
    );
};

const App: React.FC = () => {
    const [currentPageId, setCurrentPageId] = useState<PageId>('home');
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        return (localStorage.getItem('dermo_user_profile') as UserProfile) || null;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // States for "Trouver un Dermato" feature
    const [dermatologistMapResults, setDermatologistMapResults] = useState<GenerateContentResponse | null>(null);
    const [isDermSearchLoading, setIsDermSearchLoading] = useState(false);
    const [dermSearchError, setDermSearchError] = useState<string | null>(null);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<{ country: string; city: string }>({ country: '', city: '' });
    const [lastSearchLocation, setLastSearchLocation] = useState<LatLng | null>(null);

    useEffect(() => {
        if (userProfile) {
            localStorage.setItem('dermo_user_profile', userProfile);
        }
    }, [userProfile]);

    const navigateTo = useCallback((pageId: PageId) => {
        setCurrentPageId(pageId);
        setIsMobileMenuOpen(false); // Close menu on navigation
        // Reset state for new page if it's the dermatologist finder
        if (pageId === 'find-dermatologist') {
            setDermatologistMapResults(null);
            setIsDermSearchLoading(false);
            setDermSearchError(null);
            setCurrentSearchQuery({ country: '', city: '' });
            setLastSearchLocation(null);
        }
    }, []);

    const handleProfileSelect = useCallback((profile: 'adult' | 'minor') => {
        setUserProfile(profile);
        // Redirect immediately based on profile
        if (profile === 'adult') {
            navigateTo('questionnaire');
        } else {
            navigateTo('find-dermatologist');
        }
    }, [navigateTo]);


    // Shared callback for performing dermatologist search
    const performDermatologistSearch = useCallback(async (country: string, city: string, userLatLng?: LatLng | null) => {
        setIsDermSearchLoading(true);
        setDermSearchError(null);
        setDermatologistMapResults(null);
        setCurrentSearchQuery({ country, city });
        setLastSearchLocation(userLatLng || null); // Store the location used for this search

        try {
            const results = await searchDermatologistsWithMaps(country, city, userLatLng);
            setDermatologistMapResults(results);
        } catch (error: any) {
            console.error("Error searching for dermatologists:", error);
            setDermSearchError(error.message || "Échec de la recherche de dermatologues.");
        } finally {
            setIsDermSearchLoading(false);
        }
    }, []);

    const handleBackFromDermatologistList = useCallback(() => {
        setDermatologistMapResults(null);
        setDermSearchError(null);
        setCurrentSearchQuery({ country: '', city: '' }); // Clear search query to show finder
        setLastSearchLocation(null);
    }, []);

    const handleBackFromFinder = useCallback(() => {
        setDermatologistMapResults(null);
        setDermSearchError(null);
        setCurrentSearchQuery({ country: currentSearchQuery.country, city: '' }); // Keep country, clear city to re-show finder
        setLastSearchLocation(null);
    }, [currentSearchQuery.country]);

    const getVisibleNavItems = useMemo(() => {
        const allItems = appConfig.app.layout.header.nav;
        const isMinor = userProfile === 'minor';

        return allItems.filter(item => {
            // Rule: "Auto analyse" MUST NOT be visible for minors
            if (isMinor && item.id === 'questionnaire') {
                return false;
            }
            return true;
        });
    }, [userProfile]);

    const currentPageConfig = useMemo(() => appConfig.app.pages.find(p => p.id === currentPageId), [currentPageId]);

    const renderMainContent = () => {
        if (!currentPageConfig) {
            return <div className="text-center text-red-600">Page non trouvée.</div>;
        }

        // STRICT Security check for Minors accessing Questionnaire
        if (userProfile === 'minor' && currentPageId === 'questionnaire') {
            // Use setTimeout to avoid React render cycle issues when navigating during render
            setTimeout(() => navigateTo('find-dermatologist'), 0);
            return null; // Don't render anything while redirecting
        }

        switch (currentPageConfig.id) {
            case 'home':
                return <HomePage
                    config={currentPageConfig}
                    onStart={() => navigateTo(userProfile === 'minor' ? 'find-dermatologist' : 'questionnaire')}
                />;
            case 'questionnaire':
                return <Questionnaire config={currentPageConfig} />;
            case 'about':
                return <AboutPage config={currentPageConfig} />;
            case 'blog':
                return <BlogPage config={currentPageConfig} />;
            case 'dictionary':
                return <DictionaryPage config={currentPageConfig} />;
            case 'contact':
                return <ContactPage config={currentPageConfig} />;
            case 'find-dermatologist':
                return (
                    <div className="w-full max-w-6xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-center animate-fade-in shadow-xl relative">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{currentPageConfig.title}</h2>
                        {currentPageConfig.description && <p className="text-base md:text-lg text-slate-600 mb-8">{currentPageConfig.description}</p>}

                        {dermatologistMapResults || isDermSearchLoading || dermSearchError ? (
                            <DermatologistListPage
                                dermatologistMapResults={dermatologistMapResults}
                                onBack={handleBackFromDermatologistList}
                                searchQuery={currentSearchQuery}
                                isLoading={isDermSearchLoading}
                                error={dermSearchError}
                                onSearch={performDermatologistSearch}
                                lastSearchLocation={lastSearchLocation}
                            />
                        ) : (
                            <DermatologistFinder
                                onBack={handleBackFromFinder}
                                onSearch={performDermatologistSearch}
                                isLoading={isDermSearchLoading}
                            />
                        )}
                    </div>
                );
            case 'faq':
            case 'privacy-policy':
            case 'terms-of-use':
                return <InfoPage config={currentPageConfig} />;
            default:
                return <div className="text-center text-red-600">Page non gérée.</div>;
        }
    };

    if (!userProfile) {
        return <MinorCheckPopup onConfirmAdult={() => handleProfileSelect('adult')} onConfirmMinor={() => handleProfileSelect('minor')} />;
    }

    return (
        <div
            className="flex flex-col min-h-screen font-sans bg-gray-50"
        >
            {/* Header - Fixed/Sticky, Light Mint Green (#D1FAE6) */}
            <header
                className="sticky top-0 z-50 bg-[#D1FAE6] shadow-sm h-16 lg:h-20 border-b border-emerald-100"
            >
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    {/* Logo Section (Left) */}
                    <div className="flex-shrink-0 flex items-center gap-6"> {/* Increased gap to 6 */}
                        <button
                            className="cursor-pointer flex items-center focus:outline-none"
                            onClick={() => navigateTo('home')}
                            aria-label="Accueil DERMO-CHECK"
                        >
                            {/* Logo Image */}
                            <DermoCheckLogo size={48} className="rounded-lg mix-blend-multiply" /> {/* Increased base size to 48 */}
                            {/* Text Brand */}
                            <span className="text-emerald-950 font-bold text-xl tracking-wide ml-2">DermoCheck</span>
                        </button>
                    </div>

                    {/* Desktop Navigation (>= 1024px) */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {getVisibleNavItems.map(navItem => (
                            <NavItem
                                key={navItem.id}
                                label={navItem.label}
                                active={currentPageId === navItem.id}
                                onClick={() => navigateTo(navItem.id)}
                            />
                        ))}
                        {/* Desktop Profile Switcher */}
                        <div className="ml-4 pl-4 border-l border-emerald-200 flex items-center gap-2">
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Profil</span>
                                <span className="text-sm font-bold text-emerald-900 leading-none">
                                    {userProfile === 'adult' ? 'Majeur' : 'Mineur'}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('dermo_user_profile');
                                    setUserProfile(null);
                                    navigateTo('home');
                                }}
                                className="p-1.5 rounded-full bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-sm"
                                title="Changer de profil"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        </div>
                    </nav>

                    {/* Mobile/Tablet Hamburger Button (< 1024px) */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-emerald-900 hover:text-emerald-700 transition-colors"
                            aria-label="Ouvrir le menu"
                        >
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile/Tablet Side Drawer */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navigation"
            >
                {/* Drawer Header - Light Mint Green */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-100 bg-[#D1FAE6]">
                    <span className="text-xl font-bold text-emerald-900">Menu</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-emerald-900 hover:text-emerald-700 transition-colors"
                        aria-label="Fermer le menu"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Drawer Links */}
                <nav className="flex-grow py-2 overflow-y-auto">
                    <div className="flex flex-col">
                        {getVisibleNavItems.map(navItem => (
                            <NavItem
                                key={navItem.id}
                                label={navItem.label}
                                active={currentPageId === navItem.id}
                                onClick={() => navigateTo(navItem.id)}
                                mobile={true}
                            />
                        ))}
                    </div>
                </nav>

                {/* Drawer Footer (Profile Management) */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-sm text-slate-500">Profil : </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                            {userProfile === 'adult' ? 'Majeur' : 'Mineur'}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('dermo_user_profile');
                            setUserProfile(null);
                            setIsMobileMenuOpen(false);
                            navigateTo('home');
                        }}
                        className="w-full py-2 px-4 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        Changer de profil
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8" id="main-content">
                {/* 
                    REMOVED: 'animate-fade-in' class from this wrapper div.
                    REASON: The transformation creates a stacking context that breaks 'fixed' positioning
                    for the Health Warning Popup in Questionnaire.tsx, causing it to be contained within 
                    this div instead of covering the full viewport.
                    Each page component (HomePage, Questionnaire, etc.) handles its own animation.
                */}
                <div key={currentPageId} className="w-full flex flex-col items-center">
                    {renderMainContent()}
                </div>
            </main>

            {/* Footer - Light Mint Green (#D1FAE6) */}
            <footer className="bg-[#D1FAE6] text-emerald-900 py-8 px-6 mt-auto border-t border-emerald-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-center lg:text-left">

                    {/* Column 1: Branding */}
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <h3 className="text-2xl font-bold tracking-wider text-emerald-950">DermoCheck</h3>
                        <p className="text-sm text-emerald-800 max-w-xs leading-relaxed">
                            DermoCheck ne remplace pas une consultation dermatologique.
                            En cas de doute ou d'urgence, consultez impérativement un médecin.
                        </p>
                    </div>

                    {/* Column 2: Legal Links */}
                    <div className="flex flex-col items-center lg:items-start gap-3">
                        <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Légal</h4>
                        <button onClick={() => navigateTo('terms-of-use')} className="text-emerald-800 hover:text-emerald-950 transition-colors text-sm">Mentions légales</button>
                        <button onClick={() => navigateTo('terms-of-use')} className="text-emerald-800 hover:text-emerald-950 transition-colors text-sm">CGU</button>
                        <button onClick={() => navigateTo('privacy-policy')} className="text-emerald-800 hover:text-emerald-950 transition-colors text-sm">Confidentialité</button>
                    </div>

                    {/* Column 3: Copyright/Info */}
                    <div className="flex flex-col items-center lg:items-end justify-end gap-2">
                        <p className="text-xs text-emerald-800/80">
                            © {new Date().getFullYear()} DERMO-CHECK. Tous droits réservés.
                        </p>
                        <div className="text-xs text-emerald-800/80">
                            v1.3.0 - Assistant Dermatologique
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;