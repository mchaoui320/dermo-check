import React from "react";
import { appConfig } from '../config'; // Import appConfig to access theme

const features = [
  {
    title: "Répondez aux questions",
    description: "Décrivez vos symptômes et l’historique de la lésion.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="72"
        fill="none"
        stroke={appConfig.app.theme.primaryColor} // Using theme's primary color
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="4" width="48" height="60" rx="4" />
        <path d="M18 18h20M18 28h20M18 38h12M40 10l10 10M50 10l-10 10" />
      </svg>
    ),
  },
  {
    title: "Ajoutez une photo",
    description: "Prenez une photo nette de la zone concernée.",
    icon: (
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="18" y="24" width="36" height="28" rx="4" stroke={appConfig.app.theme.primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="36" cy="38" r="8" stroke={appConfig.app.theme.primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M48 24V18H24V24" stroke={appConfig.app.theme.primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Obtenez un rapport",
    description: "Recevez une synthèse, des hypothèses et des conseils.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="72"
        fill="none"
        stroke={appConfig.app.theme.primaryColor} // Using theme's primary color
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 6h44l10 10v48a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" />
        <path d="M52 6v14h14" />
        <path d="M18 30h30M18 40h30M18 50h30" />
      </svg>
    ),
  },
  {
    title: "Consultez un pro",
    description: "Notre rapport ne remplace pas l’avis d’un médecin.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="72"
        fill="none"
        stroke={appConfig.app.theme.primaryColor} // Using theme's primary color
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="36" cy="24" r="10" />
        <path d="M8 64c3-10 10-16 28-16s25 6 28 16" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <div className="w-full bg-transparent py-5">
      <div className="mx-auto max-w-6xl px-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="bg-gray-50 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">
                {item.title}
              </h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}