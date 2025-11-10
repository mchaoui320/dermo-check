
import React, { useState } from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';

interface ContactPageProps {
    config: PageConfig;
}

const ContactPage: React.FC<ContactPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;
    const [formData, setFormData] = useState<Record<string, string>>(() => {
        const initialState: Record<string, string> = {};
        config.fields?.forEach(field => {
            initialState[field.name] = '';
        });
        return initialState;
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        // Basic client-side validation
        const missingFields = config.fields?.filter(field => field.required && !formData[field.name].trim());
        if (missingFields && missingFields.length > 0) {
            setSubmitError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // In a real application, you would send this data to a backend server.
        // For this demo, we just simulate a successful submission.
        console.log("Form data submitted:", formData);
        setIsSubmitted(true);
        // Optionally reset form after submission
        setFormData(() => {
            const initialState: Record<string, string> = {};
            config.fields?.forEach(field => {
                initialState[field.name] = '';
            });
            return initialState;
        });
    };

    return (
        <div 
            className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-10 text-left animate-fade-in shadow-xl"
            style={{ borderRadius: `${themeConfig.radius}px` }}
        >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 text-center">{config.title}</h2>
            {config.description && <p className="text-base md:text-lg text-slate-600 mb-8 text-center leading-relaxed">{config.description}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {config.fields?.map(field => (
                    <div key={field.name} className="flex flex-col">
                        <label htmlFor={field.name} className="mb-2 text-sm md:text-base font-medium text-slate-700">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                            <textarea
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={field.required}
                                rows={5}
                                className="px-4 py-3 border border-gray-300 bg-white text-slate-900 text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                            />
                        ) : (
                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required={field.required}
                                className="px-4 py-3 border border-gray-300 bg-white text-slate-900 text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                            />
                        )}
                    </div>
                ))}
                
                {submitError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm" role="alert">
                        {submitError}
                    </div>
                )}

                {isSubmitted && !submitError && (
                    <div className="p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm" role="status">
                        Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full px-8 py-3 md:px-10 md:py-4 text-white text-lg rounded-full hover:opacity-90 transition-colors font-semibold shadow-lg"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                    disabled={false}
                >
                    Envoyer le message
                </button>
            </form>
        </div>
    );
};

export default ContactPage;
