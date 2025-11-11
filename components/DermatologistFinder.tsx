
import React, { useState, useEffect, useCallback } from 'react';
import { appConfig } from '../config';
import { sortedCountries } from './CountryDropdown'; // Import sortedCountries
import { BackArrowIcon } from './icons';
import { LatLng } from '@google/genai'; // Import LatLng type

interface DermatologistFinderProps {
    onBack: () => void;
    // Updated onSearch prop to accept LatLng for geolocation and return a Promise
    onSearch: (country: string, city: string, userLatLng?: LatLng | null) => Promise<void>; 
    isLoading: boolean; // Add loading prop from parent
}

const DermatologistFinder: React.FC<DermatologistFinderProps> = ({ onBack, onSearch, isLoading }) => {
    const themeConfig = appConfig.app.theme;
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [cityInput, setCityInput] = useState<string>('');
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');

    useEffect(() => {
        // Request geolocation when the component mounts
        if (navigator.geolocation && geolocationStatus === 'idle') {
            setGeolocationStatus('loading');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setGeolocationStatus('success');
                },
                (error) => {
                    // Use console.warn instead of error for expected permission denials
                    console.warn("Geolocation status:", error.message || "Unknown error"); 
                    if (error.code === error.PERMISSION_DENIED) {
                        setGeolocationStatus('denied');
                    } else {
                        setGeolocationStatus('error');
                    }
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 } // Prefer lower accuracy for speed
            );
        }
    }, [geolocationStatus]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setCityInput(''); // Reset city input when country changes
    };

    const handleSearch = async () => {
        if (selectedCountry && cityInput.trim()) {
            await onSearch(selectedCountry, cityInput.trim(), userLocation);
        }
    };

    const isSearchDisabled = !selectedCountry || !cityInput.trim() || isLoading;

    return (
        <div className="flex flex-col items-center gap-4 w-full animate-fade-in mt-6">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Retour"
            >
                <BackArrowIcon />
            </button>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Où souhaitez-vous trouver un dermatologue ?</h3>

            {/* Geolocation Status */}
            <div className="w-full text-sm md:text-base text-center mb-4" aria-live="polite" aria-atomic="true">
                {geolocationStatus === 'loading' && <p className="text-slate-600">Chargement de votre position...</p>}
                {geolocationStatus === 'success' && <p className="text-emerald-700">Votre position a été détectée pour une meilleure précision.</p>}
                {geolocationStatus === 'denied' && <p className="text-slate-500 italic">Localisation non disponible. Veuillez saisir votre ville manuellement.</p>}
                {geolocationStatus === 'error' && <p className="text-slate-500 italic">Impossible de détecter la position. Veuillez saisir votre ville manuellement.</p>}
            </div>

            <select
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                aria-label="Sélectionnez un pays"
                required
                disabled={isLoading}
            >
                <option value="" disabled>Sélectionnez votre pays</option>
                {sortedCountries.map((country) => (
                    <option key={country.name} value={country.name}>
                        {country.flag} {country.name}
                    </option>
                ))}
            </select>

            {selectedCountry && (
                <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Saisissez le nom de votre ville"
                    className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm animate-fade-in"
                    aria-label="Saisissez le nom de votre ville"
                    required
                    disabled={isLoading}
                />
            )}

            <button
                onClick={handleSearch}
                disabled={isSearchDisabled}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-7 py-3 md:py-4 text-white text-base md:text-lg rounded-full transition-colors font-semibold shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeConfig.primaryColor }}
                aria-label="Rechercher un dermatologue"
            >
                {isLoading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Chargement"></span>
                        Recherche...
                    </>
                ) : (
                    "Rechercher un dermatologue"
                )}
            </button>
        </div>
    );
};

export default DermatologistFinder;
