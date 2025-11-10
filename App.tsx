
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
    // Desktop styles (White text on Dark Blue header)
    const desktopBase = "px-3 py-2 text-base font-medium transition-all duration-200 ease-in-out rounded-xl whitespace-nowrap border border-transparent";
    const desktopActive = "bg-white/10 text-white font-bold shadow-sm border-white/20";
    const desktopInactive = "text-gray-300 hover:text-white hover:bg-white/5";

    // Mobile styles (Drawer is white)
    const mobileBase = "block w-full text-left px-4 py-3 text-lg font-medium border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors";
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
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // States for "Trouver un Dermato" feature
    const [dermatologistMapResults, setDermatologistMapResults] = useState<GenerateContentResponse | null>(null);
    const [isDermSearchLoading, setIsDermSearchLoading] = useState(false);
    const [dermSearchError, setDermSearchError] = useState<string | null>(null);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<{ country: string; city: string }>({ country: '', city: '' });

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
    }, []);

    const handleBackFromFinder = useCallback(() => {
        setDermatologistMapResults(null);
        setDermSearchError(null);
        setCurrentSearchQuery({ country: currentSearchQuery.country, city: '' }); // Keep country, clear city to re-show finder
    }, [currentSearchQuery.country]);

    const getVisibleNavItems = useMemo(() => {
        const allItems = appConfig.app.layout.header.nav;
        const isMinor = userProfile === 'minor';
        
        // Screen breakpoints
        const isMobile = windowWidth < 768;
        const isTablet = windowWidth >= 768 && windowWidth < 1024;
        const isDesktop = windowWidth >= 1024;

        const allowedIds = new Set<string>();

        // Always allowed
        allowedIds.add('find-dermatologist'); // "Trouver un dermato"
        allowedIds.add('dictionary');         // "Dictionnaire"

        // "Auto analyse" (Questionnaire): Adult only
        if (!isMinor) {
            allowedIds.add('questionnaire');
        }

        // "Revue" (Blog): Tablet and Desktop only (for both profiles)
        if (isTablet || isDesktop) {
            allowedIds.add('blog');
        }

        // "À propos" & "Contact": Desktop only
        if (isDesktop) {
            allowedIds.add('about');
            allowedIds.add('contact');
        }

        return allItems.filter(item => allowedIds.has(item.id));
    }, [userProfile, windowWidth]);

    const currentPageConfig = useMemo(() => appConfig.app.pages.find(p => p.id === currentPageId), [currentPageId]);

    const renderMainContent = () => {
        if (!currentPageConfig) {
            return <div className="text-center text-red-600">Page non trouvée.</div>;
        }

        // STRICT Security check for Minors accessing Questionnaire
        // Redirects immediately to finder if a minor tries to access questionnaire
        if (userProfile === 'minor' && currentPageId === 'questionnaire') {
             // Using a timeout to avoid render-cycle state updates, or just render the restricted view
             return (
                <div className="w-full max-w-2xl mx-auto text-center p-8 bg-white rounded-3xl shadow-xl">
                     <h2 className="text-2xl font-bold text-red-600 mb-4">Accès restreint</h2>
                     <p className="mb-6 text-slate-700">L'auto-analyse n'est pas disponible pour les mineurs.</p>
                     <button 
                        onClick={() => navigateTo('find-dermatologist')}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
                     >
                        Trouver un dermatologue
                     </button>
                </div>
             );
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
                    <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-center animate-fade-in shadow-xl relative">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{currentPageConfig.title}</h2>
                        {currentPageConfig.description && <p className="text-base md:text-lg text-slate-600 mb-8">{currentPageConfig.description}</p>}

                        {dermatologistMapResults || isDermSearchLoading || dermSearchError ? (
                            <DermatologistListPage
                                dermatologistMapResults={dermatologistMapResults}
                                onBack={handleBackFromDermatologistList}
                                searchQuery={currentSearchQuery}
                                isLoading={isDermSearchLoading}
                                error={dermSearchError}
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
            {/* Header - Fixed, Dark Blue */}
            <header 
                className="sticky top-0 z-50 bg-[#0A2840] shadow-md p-3 md:p-4 border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo (Left) */}
                    <div className="flex-shrink-0">
                        <button 
                            className="cursor-pointer flex items-center focus:outline-none"
                            onClick={() => navigateTo('home')}
                            aria-label="Accueil DERMO-CHECK"
                        >
                            <DermoCheckLogo />
                        </button>
                    </div>

                    {/* Desktop Navigation (>= 1024px) */}
                    <nav className="hidden lg:flex items-center space-x-2">
                        {getVisibleNavItems.map(navItem => (
                            <NavItem 
                                key={navItem.id}
                                label={navItem.label} 
                                active={currentPageId === navItem.id} 
                                onClick={() => navigateTo(navItem.id)} 
                            />
                        ))}
                    </nav>

                    {/* Mobile/Tablet Hamburger Button (< 1024px) */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-white hover:text-emerald-400 transition-colors"
                            aria-label="Ouvrir le menu"
                        >
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile/Tablet Side Drawer */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 z-50 lg:hidden animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                    
                    {/* Drawer Panel */}
                    <div 
                        className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu de navigation"
                    >
                        {/* Drawer Header */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-[#0A2840]">
                            <span className="text-xl font-bold text-white">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-white hover:text-emerald-400 transition-colors"
                                aria-label="Fermer le menu"
                            >
                                <XIcon />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <nav className="flex-grow p-4 overflow-y-auto">
                            <div className="flex flex-col space-y-1">
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
                </>
            )}

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8" id="main-content">
                <div key={currentPageId} className="w-full animate-fade-in flex flex-col items-center">
                    {renderMainContent()}
                </div>
            </main>

            {/* Footer - Updated Design */}
            <footer className="bg-[#0A2840] text-white py-8 px-6 mt-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-center lg:text-left">
                    
                    {/* Column 1: Branding */}
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <h3 className="text-2xl font-bold tracking-wider">DermoCheck</h3>
                        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                            DermoCheck ne remplace pas une consultation dermatologique.
                            En cas de doute ou d'urgence, consultez impérativement un médecin.
                        </p>
                    </div>

                    {/* Column 2: Legal Links */}
                    <div className="flex flex-col items-center lg:items-start gap-3">
                         <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Légal</h4>
                         <button onClick={() => navigateTo('terms-of-use')} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Mentions légales</button>
                         <button onClick={() => navigateTo('terms-of-use')} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">CGU</button>
                         <button onClick={() => navigateTo('privacy-policy')} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Confidentialité</button>
                    </div>

                    {/* Column 3: Copyright/Info */}
                    <div className="flex flex-col items-center lg:items-end justify-end gap-2">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} DERMO-CHECK. Tous droits réservés.
                        </p>
                        <div className="text-xs text-gray-600">
                            v1.2.0 - Assistant Dermatologique
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
