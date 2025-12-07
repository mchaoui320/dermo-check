
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { PaperclipIcon } from './icons';
import { SelectedFilePreview } from '../types'; // Import SelectedFilePreview type

interface FileUploadProps {
    onFileSelect: (files: File[]) => void; // Modified to only pass files (always images)
    onSkip: () => void;
}

const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(({ onFileSelect, onSkip }, ref) => {
    const [selectedFilePreviews, setSelectedFilePreviews] = useState<SelectedFilePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileObjectUrlsRef = useRef<string[]>([]); // To keep track of all created object URLs

    // Cleanup object URLs when component unmounts
    useEffect(() => {
        return () => {
            fileObjectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
            fileObjectUrlsRef.current = [];
        };
    }, []); // Run once on mount/unmount

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const newFiles: File[] = Array.from(event.target.files);

            // Fix: Explicitly type `newPreviews` to ensure 'image' literal type is preserved.
            const newPreviews: SelectedFilePreview[] = newFiles.map(file => {
                const url = URL.createObjectURL(file);
                fileObjectUrlsRef.current.push(url); // Add new URL to ref
                return {
                    file,
                    url,
                    id: `${file.name}-${file.lastModified}-${Math.random()}`, // More robust unique ID
                    type: 'image', // Always 'image' now
                };
            });

            setSelectedFilePreviews(prev => [...prev, ...newPreviews]); // Accumulate files
            // Clear input value so selecting the same file again triggers change event
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (idToRemove: string) => {
        setSelectedFilePreviews(prev => {
            const fileToRemove = prev.find(p => p.id === idToRemove);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.url); // Revoke URL for the removed file
                // Remove from ref as well
                fileObjectUrlsRef.current = fileObjectUrlsRef.current.filter(url => url !== fileToRemove.url);
            }
            return prev.filter(p => p.id !== idToRemove);
        });
        // Reset file input value to allow re-uploading the same file after deletion
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        if (selectedFilePreviews.length > 0) {
            onFileSelect(selectedFilePreviews.map(p => p.file)); // Pass files (always images)
            // Revoke all URLs that were part of the submission
            selectedFilePreviews.forEach(p => URL.revokeObjectURL(p.url));
            fileObjectUrlsRef.current = []; // Clear the ref as these URLs are now "used" and revoked.
            setSelectedFilePreviews([]); // Clear previews after upload
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input to allow new uploads
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const hasFiles = selectedFilePreviews.length > 0;

    return (
        <div ref={ref} className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">Conseils pour une bonne photo :</h3>
            <ul className="text-sm md:text-base text-slate-700 list-disc list-inside text-left w-full mb-4 space-y-1">
                <li>Nettoyez la lentille de votre appareil photo.</li>
                <li>Assurez-vous d'avoir un bon éclairage (lumière naturelle de préférence).</li>
                <li>Prenez la photo en gros plan de la lésion.</li>
                <li>Maintenez l'appareil stable pour éviter le flou.</li>
            </ul>

            <div className="relative w-full aspect-video border-2 border-dashed border-emerald-400 rounded-xl overflow-hidden flex items-center justify-center mb-4 bg-gray-50 p-2" aria-live="polite" aria-atomic="true">
                {hasFiles ? (
                    <img
                        src={selectedFilePreviews[0].url}
                        alt="Prévisualisation de l'image"
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-gray-500 text-center p-4 text-base md:text-lg">
                        Une image vaut mille mots ! Ajoutez une photo nette de votre lésion pour une analyse plus précise.
                    </span>
                )}
            </div>

            <button
                onClick={handleButtonClick}
                className="flex-grow w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-emerald-500 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors font-medium text-base shadow-sm"
                aria-label={hasFiles ? `${selectedFilePreviews.length} image(s) sélectionnée(s). Cliquez pour ajouter ou modifier.` : 'Choisir image(s)'}
            >
                <PaperclipIcon />
                <span className="truncate">
                    {hasFiles ? `${selectedFilePreviews.length} image(s) sélectionnée(s)` : 'Ajouter une image'}
                </span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp" // Only accept images
                multiple // Always allow multiple for images
            />

            {hasFiles && selectedFilePreviews.length > 1 && ( // Only show multiple previews if more than 1 image
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3" aria-label="Autres images sélectionnées">
                    {selectedFilePreviews.slice(1).map(preview => ( // Skip first as it's in main preview
                        <div key={preview.id} className="relative group">
                            <img
                                src={preview.url}
                                alt={`Prévisualisation de ${preview.file.name}`}
                                className="w-full h-24 object-cover rounded-md border border-gray-200"
                            />
                            <button
                                onClick={() => handleRemoveFile(preview.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Supprimer l'image ${preview.file.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {hasFiles ? (
                <button
                    onClick={handleUploadClick}
                    className="w-full sm:w-auto px-7 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 text-base mt-4"
                    aria-label="Commencer l'analyse des images sélectionnées"
                >
                    Commencer l'analyse
                </button>
            ) : (
                <button
                    onClick={onSkip}
                    className="w-full sm:w-auto px-7 py-3 bg-white border border-emerald-500 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors font-semibold shadow-lg text-base mt-4"
                    aria-label="Ignorer le téléchargement d'image et continuer"
                >
                    Ignorer et continuer
                </button>
            )}
        </div>
    );
});

FileUpload.displayName = 'FileUpload'; // Add display name for forwardRef

export default FileUpload;