
import React from 'react';
import { appConfig } from '../config';
import { BackArrowIcon } from './icons';
import { GenerateContentResponse, GroundingChunk } from '@google/genai'; // Import relevant types

// Define local interfaces for Maps-related data structures based on GroundingChunk
interface MapsPlaceInfo {
    uri: string;
    title: string;
    placeAnswerSources?: MapsPlaceAnswerSource[];
}

interface MapsReviewSnippet {
    uri: string;
    title?: string;
}

interface MapsPlaceAnswerSource {
    reviewSnippets?: MapsReviewSnippet[];
}

interface DermatologistListPageProps {
    dermatologistMapResults: GenerateContentResponse | null;
    onBack: () => void;
    searchQuery: { country: string; city: string; }; // To display the search query
    isLoading: boolean;
    error: string | null;
}

interface DisplayableDermatologist {
    name: string;
    address: string;
    uri: string;
    reviewSnippets?: MapsReviewSnippet[];
}

const DermatologistListPage: React.FC<DermatologistListPageProps> = ({ dermatologistMapResults, onBack, searchQuery, isLoading, error }) => {
    const themeConfig = appConfig.app.theme;

    const displayableDermatologists: DisplayableDermatologist[] = React.useMemo(() => {
        if (!dermatologistMapResults || !dermatologistMapResults.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            return [];
        }

        const chunks = dermatologistMapResults.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        const dermatologists: DisplayableDermatologist[] = [];

        chunks.forEach(chunk => {
            if (chunk.maps) {
                const mapInfo = chunk.maps as MapsPlaceInfo;
                if (mapInfo.uri && mapInfo.title) {
                    const placeNameMatch = mapInfo.title.match(/(.*) à (.*)/); // e.g., "Dr. John Doe à Paris"
                    const name = placeNameMatch ? placeNameMatch[1].trim() : mapInfo.title;
                    const address = placeNameMatch ? placeNameMatch[2].trim() : "Adresse non spécifiée"; // Simplified for now

                    // Extract review snippets
                    const reviewSnippets: MapsReviewSnippet[] = [];
                    if (mapInfo.placeAnswerSources && Array.isArray(mapInfo.placeAnswerSources)) {
                        mapInfo.placeAnswerSources.forEach((source: MapsPlaceAnswerSource) => {
                            if (source.reviewSnippets && Array.isArray(source.reviewSnippets)) {
                                reviewSnippets.push(...source.reviewSnippets);
                            }
                        });
                    }

                    dermatologists.push({
                        name: name,
                        address: address, // This will need proper parsing from the text or `mapInfo` if API returns structured address
                        uri: mapInfo.uri,
                        reviewSnippets: reviewSnippets.length > 0 ? reviewSnippets : undefined,
                    });
                }
            }
        });
        return dermatologists;
    }, [dermatologistMapResults]);


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-48" aria-live="polite" aria-atomic="true" role="status">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></span>
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                    </div>
                    <p className="mt-4 text-slate-600 text-base md:text-lg animate-fade-in">Recherche de dermatologues...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm md:text-base rounded-lg text-center mt-4" role="alert">
                    <p className="font-bold">Erreur lors de la recherche</p>
                    <p>{error}</p>
                </div>
            );
        }

        if (displayableDermatologists.length > 0) {
            return (
                <div className="w-full space-y-4 text-left" role="region" aria-label="Liste des dermatologues">
                    {displayableDermatologists.map((derm, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                            <h4 className="font-semibold text-lg md:text-xl" style={{ color: themeConfig.primaryColor }}>
                                <a href={derm.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {derm.name}
                                </a>
                            </h4>
                            <p className="text-sm md:text-base text-gray-700 mt-1">Adresse: {derm.address}</p>
                            {derm.reviewSnippets && derm.reviewSnippets.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs md:text-sm font-semibold text-gray-600">Avis :</p>
                                    <ul className="list-disc list-inside text-xs md:text-sm text-gray-500 ml-2">
                                        {derm.reviewSnippets.map((review, rIndex) => (
                                            <li key={rIndex}>
                                                <a href={review.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {review.title || "Voir l'avis"}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <p className="text-xs md:text-sm text-gray-500 mt-2">
                                <a href={derm.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Voir sur Google Maps
                                </a>
                            </p>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <p className="text-center text-slate-600 text-base md:text-lg" aria-live="polite">
                Aucun dermatologue trouvé pour {searchQuery.city}, {searchQuery.country}.
                Veuillez vérifier l'orthographe ou essayer une autre ville.
            </p>
        );
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full animate-fade-in mt-6 text-center">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Retour à la recherche de dermatologue"
            >
                <BackArrowIcon />
            </button>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Dermatologues à {searchQuery.city}, {searchQuery.country}</h3>

            {renderContent()}

            <p className="text-xs md:text-sm text-gray-500 mt-4">
                *Informations fournies par Google Maps via l'IA. Vérifiez toujours les détails avant de consulter.
            </p>
            <button
                onClick={onBack}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-7 py-3 md:py-4 text-white text-base md:text-lg rounded-full transition-colors font-semibold shadow-lg"
                style={{ backgroundColor: themeConfig.primaryColor }}
                aria-label="Retour à la recherche de dermatologue"
            >
                Retour à la recherche
            </button>
        </div>
    );
};

export default DermatologistListPage;