
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
    message: Message;
}

// A markdown parser for the final report
const FinalReportRenderer: React.FC<{ text: string; userUploadedImageUrls?: string[] }> = ({ text, userUploadedImageUrls }) => {
    const content = text.replace('[FINAL_REPORT]', '').trim();
    
    const renderContent = () => {
        let parts: React.ReactNode[] = [];
        let currentSection: string | null = null;
        let imageSectionHandled = false;

        content.split('\n').forEach((line, index) => {
            const trimmedLine = line.trim();

            // Handle section titles for final report
            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                currentSection = trimmedLine.replace(/\*\*/g, '');
                parts.push(<h3 key={`h3-${index}`} className="text-xl md:text-2xl font-semibold text-slate-800 mt-6 mb-3 leading-tight">{currentSection}</h3>);
                
                // Insert images right after "Analyse photo" section if available
                if (currentSection === 'Analyse photo' && userUploadedImageUrls && userUploadedImageUrls.length > 0 && !imageSectionHandled) {
                    parts.push(
                        <div key="user-images" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                            {userUploadedImageUrls.map((url, imgIndex) => (
                                <img
                                    key={`uploaded-img-${imgIndex}`}
                                    src={url}
                                    alt={`Image utilisateur ${imgIndex + 1}`}
                                    className="w-full h-auto object-cover rounded-lg shadow-md border border-gray-200"
                                />
                            ))}
                        </div>
                    );
                    imageSectionHandled = true; // Ensure images are only added once
                }
                return;
            }

            // Handle list items starting with *
            if (trimmedLine.startsWith('*')) {
                 const cleanLine = trimmedLine.replace(/^\s*\*/, '').trim();
                 // Support bolding within list items
                 const boldedLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                 parts.push(
                    <li key={`li-${index}`} className="ml-5 list-disc text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: boldedLine }} />
                 );
            } else if (trimmedLine) {
                // Render paragraphs, supporting bolding within them
                const boldedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                parts.push(<p key={`p-${index}`} className="my-2 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: boldedLine }} />);
            } else {
                // Keep empty lines as spacing
                parts.push(<p key={`empty-${index}`} className="my-2 text-base leading-relaxed"><br/></p>);
            }
        });

        // If 'Analyse photo' section wasn't explicitly present but images exist, add them at the end.
        // This is a fallback to ensure images are always displayed if provided.
        if (userUploadedImageUrls && userUploadedImageUrls.length > 0 && !imageSectionHandled) {
             parts.push(<h3 key="h3-images-fallback" className="text-xl md:text-2xl font-semibold text-slate-800 mt-6 mb-3 leading-tight">Images fournies</h3>);
             parts.push(
                <div key="user-images-fallback" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {userUploadedImageUrls.map((url, imgIndex) => (
                        <img
                            key={`uploaded-img-fallback-${imgIndex}`}
                            src={url}
                            alt={`Image utilisateur ${imgIndex + 1}`}
                            className="w-full h-auto object-cover rounded-lg shadow-md border border-gray-200"
                        />
                    ))}
                </div>
            );
        }

        return parts;
    };

    return (
        <div className="prose prose-sm max-w-none text-slate-700 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-left shadow-xl">
            {renderContent()}
        </div>
    );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    // This component is now primarily for displaying the final report in the new QCM-style UI.
    if (message.isFinalReport) {
        return <FinalReportRenderer text={message.text} userUploadedImageUrls={message.userUploadedImageUrls} />;
    }

    // Return null for any other message type as they are not displayed in a chat format anymore.
    return null;
};

export default ChatMessage;