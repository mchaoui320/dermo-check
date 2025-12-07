
import React, { useState, useMemo, forwardRef } from 'react';
import { appConfig } from '../config';

interface CountryDropdownProps {
    onSubmit: (country: string) => void;
}

export const countries = [ // Export the countries list
    { name: "Afghanistan", flag: "🇦🇫" }, { name: "Afrique du Sud", flag: "🇿🇦" }, { name: "Albanie", flag: "🇦🇱" },
    { name: "Algérie", flag: "🇩🇿" }, { name: "Allemagne", flag: "🇩🇪" }, { name: "Andorre", flag: "🇦🇩" },
    { name: "Angola", flag: "🇦🇴" }, { name: "Arabie Saoudite", flag: "🇸🇦" }, { name: "Argentine", flag: "🇦🇷" },
    { name: "Arménie", flag: "🇦🇲" }, { name: "Australie", flag: "🇦🇺" }, { name: "Autriche", flag: "🇦🇹" },
    { name: "Azerbaïdjan", flag: "🇦🇿" }, { name: "Bahamas", flag: "🇧🇸" }, { name: "Bahreïn", flag: "🇧🇭" },
    { name: "Bangladesh", flag: "🇧🇩" }, { name: "Barbade", flag: "🇧🇧" }, { name: "Belgique", flag: "🇧🇪" },
    { name: "Belize", flag: "🇧🇿" }, { name: "Bénin", flag: "🇧🇯" }, { name: "Bhoutan", flag: "🇧🇹" },
    { name: "Biélorussie", flag: "🇧🇾" }, { name: "Bolivie", flag: "🇧🇴" }, { name: "Bosnie-Herzégovine", flag: "🇧🇦" },
    { name: "Botswana", flag: "🇧🇼" }, { name: "Brésil", flag: "🇧🇷" }, { name: "Brunei", flag: "🇧🇳" },
    { name: "Bulgarie", flag: "🇧🇬" }, { name: "Burkina Faso", flag: "🇧🇫" }, { name: "Burundi", flag: "🇧🇮" },
    { name: "Cabo Verde", flag: "🇨🇻" }, { name: "Cambodge", flag: "🇰🇭" }, { name: "Cameroun", flag: "🇨🇲" },
    { name: "Canada", flag: "🇨🇦" }, { name: "Chili", flag: "🇨🇱" }, { name: "Chine", flag: "🇨🇳" },
    { name: "Chypre", flag: "🇨🇾" }, { name: "Colombie", flag: "🇨🇴" }, { name: "Comores", flag: "🇰🇲" },
    { name: "Congo (Brazzaville)", flag: "🇨🇬" }, { name: "Congo (Kinshasa)", flag: "🇨🇩" }, { name: "Corée du Nord", flag: "🇰🇵" },
    { name: "Corée du Sud", flag: "🇰🇷" }, { name: "Costa Rica", flag: "🇨🇷" }, { name: "Côte d'Ivoire", flag: "🇨🇮" },
    { name: "Croatie", flag: "🇭🇷" }, { name: "Cuba", flag: "🇨🇺" }, { name: "Danemark", flag: "🇩🇰" },
    { name: "Djibouti", flag: "🇩🇯" }, { name: "Dominique", flag: "🇩🇲" }, { name: "Égypte", flag: "🇪🇬" },
    { name: "Émirats Arabes Unis", flag: "🇦🇪" }, { name: "Équateur", flag: "🇪🇨" }, { name: "Érythrée", flag: "🇪🇷" },
    { name: "Espagne", flag: "🇪🇸" }, { name: "Estonie", flag: "🇪🇪" }, { name: "Eswatini", flag: "🇸🇿" },
    { name: "États-Unis", flag: "🇺🇸" }, { name: "Éthiopie", flag: "🇪🇹" }, { name: "Fidji", flag: "🇫🇯" },
    { name: "Finlande", flag: "🇫🇮" }, { name: "France", flag: "🇫🇷" }, { name: "Gabon", flag: "🇬🇦" },
    { name: "Gambie", flag: "🇬🇲" }, { name: "Géorgie", flag: "🇬🇪" }, { name: "Ghana", flag: "🇬🇭" },
    { name: "Grèce", flag: "🇬🇷" }, { name: "Grenade", flag: "🇬🇩" }, { name: "Guatemala", flag: "🇬🇹" },
    { name: "Guinée", flag: "🇬🇳" }, { name: "Guinée-Bissau", flag: "🇬🇼" }, { name: "Guinée équatoriale", flag: "🇬🇶" },
    { name: "Guyana", flag: "🇬🇾" }, { name: "Haïti", flag: "🇭🇹" }, { name: "Honduras", flag: "🇭🇳" },
    { name: "Hongrie", flag: "🇭🇺" }, { name: "Îles Salomon", flag: "🇸🇧" }, { name: "Inde", flag: "🇮🇳" },
    { name: "Indonésie", flag: "🇮🇩" }, { name: "Irak", flag: "🇮🇶" }, { name: "Iran", flag: "🇮🇷" },
    { name: "Irlande", flag: "🇮🇪" }, { name: "Islande", flag: "🇮🇸" }, { name: "Israël", flag: "🇮🇱" },
    { name: "Italie", flag: "🇮🇹" }, { name: "Jamaïque", flag: "🇯🇲" }, { name: "Japon", flag: "🇯🇵" },
    { name: "Jordanie", flag: "🇯🇴" }, { name: "Kazakhstan", flag: "🇰🇿" }, { name: "Kenya", flag: "🇰🇪" },
    { name: "Kirghizistan", flag: "🇰🇬" }, { name: "Kiribati", flag: "🇰🇮" }, { name: "Koweït", flag: "🇰🇼" },
    { name: "Laos", flag: "🇱🇦" }, { name: "Lesotho", flag: "🇱🇸" }, { name: "Lettonie", flag: "🇱🇻" },
    { name: "Liban", flag: "🇱🇧" }, { name: "Libéria", flag: "🇱🇷" }, { name: "Libye", flag: "🇱🇾" },
    { name: "Liechtenstein", flag: "🇱🇮" }, { name: "Lituanie", flag: "🇱🇹" }, { name: "Luxembourg", flag: "🇱🇺" },
    { name: "Madagascar", flag: "🇲🇬" }, { name: "Malaisie", flag: "🇲🇾" }, { name: "Malawi", flag: "🇲🇼" },
    { name: "Maldives", flag: "🇲🇻" }, { name: "Mali", flag: "🇲🇱" }, { name: "Malte", flag: "🇲🇹" },
    { name: "Maroc", flag: "🇲🇦" }, { name: "Maurice", flag: "🇲🇺" }, { name: "Mauritanie", flag: "🇲🇷" },
    { name: "Mexique", flag: "🇲🇽" }, { name: "Micronésie", flag: "🇫🇲" }, { name: "Moldavie", flag: "🇲🇩" },
    { name: "Monaco", flag: "🇲🇨" }, { name: "Mongolie", flag: "🇲🇳" }, { name: "Monténégro", flag: "🇲🇪" },
    { name: "Mozambique", flag: "🇲🇿" }, { name: "Myanmar", flag: "🇲🇲" }, { name: "N. Macédoine", flag: "🇲🇰" },
    { name: "Nambie", flag: "🇳🇦" }, { name: "Nauru", flag: "🇳🇷" }, { name: "Népal", flag: "🇳🇵" },
    { name: "Nicaragua", flag: "🇳🇮" }, { name: "Niger", flag: "🇳🇪" }, { name: "Nigeria", flag: "🇳🇬" },
    { name: "Norvège", flag: "🇳🇴" }, { name: "Nouvelle-Zélande", flag: "🇳🇿" }, { name: "Oman", flag: "🇴🇲" },
    { name: "Ouganda", flag: "🇺🇬" }, { name: "Ouzbékistan", flag: "🇺🇿" }, { name: "Pakistan", flag: "🇵🇰" },
    { name: "Palaos", flag: "🇵🇼" }, { name: "Palestine", flag: "🇵🇸" }, { name: "Panama", flag: "🇵🇦" },
    { name: "Papouasie-N.G.", flag: "🇵🇬" }, { name: "Paraguay", flag: "🇵🇾" }, { name: "Pays-Bas", flag: "🇳🇱" },
    { name: "Pérou", flag: "🇵🇪" }, { name: "Philippines", flag: "🇵🇭" }, { name: "Pologne", flag: "🇵🇱" },
    { name: "Portugal", flag: "🇵🇹" }, { name: "Qatar", flag: "🇶🇦" }, { name: "R. Centrafricaine", flag: "🇨🇫" },
    { name: "R. Dominicaine", flag: "🇩🇴" }, { name: "Rép. Tchèque", flag: "🇨🇿" }, { name: "Roumanie", flag: "🇷🇴" },
    { name: "Royaume-Uni", flag: "🇬🇧" }, { name: "Russie", flag: "🇷🇺" }, { name: "Rwanda", flag: "🇷🇼" },
    { name: "Saint-Marin", flag: "🇸🇲" }, { name: "Salvador", flag: "🇸🇻" }, { name: "Samoa", flag: "🇼🇸" },
    { name: "São Tomé-et-Príncipe", flag: "🇸🇹" }, { name: "Sénégal", flag: "🇸🇳" }, { name: "Serbie", flag: "🇷🇸" },
    { name: "Seychelles", flag: "🇸🇨" }, { name: "Sierra Leone", flag: "🇸🇱" }, { name: "Singapour", flag: "🇸🇬" },
    { name: "Slovaquie", flag: "🇸🇰" }, { name: "Slovénie", flag: "🇸🇮" }, { name: "Somalie", flag: "🇸🇴" },
    { name: "Soudan", flag: "🇸🇩" }, { name: "Soudan du Sud", flag: "🇸🇸" }, { name: "Sri Lanka", flag: "🇱🇰" },
    { name: "Suède", flag: "🇸🇪" }, { name: "Suisse", flag: "🇨🇭" }, { name: "Suriname", flag: "🇸🇷" },
    { name: "Syrie", flag: "🇸🇾" }, { name: "Tadjikistan", flag: "🇹🇯" }, { name: "Tanzanie", flag: "🇹🇿" },
    { name: "Tchad", flag: "🇹🇩" }, { name: "Thaïlande", flag: "🇹🇭" }, { name: "Timor oriental", flag: "🇹🇱" },
    { name: "Togo", flag: "🇹🇬" }, { name: "Tonga", flag: "🇹🇴" }, { name: "Trinité-et-Tobago", flag: "🇹🇹" },
    { name: "Tunisie", flag: "🇹🇳" }, { name: "Turkménistan", flag: "🇹🇲" }, { name: "Turquie", flag: "🇹🇷" },
    { name: "Tuvalu", flag: "🇹🇻" }, { name: "Ukraine", flag: "🇺🇦" }, { name: "Uruguay", flag: "🇺🇾" },
    { name: "Vanuatu", flag: "🇻🇺" }, { name: "Vatican", flag: "🇻🇦" }, { name: "Venezuela", flag: "🇻🇪" },
    { name: "Viêt Nam", flag: "🇻🇳" }, { name: "Yémen", flag: "🇾🇪" }, { name: "Zambie", flag: "🇿🇲" },
    { name: "Zimbabwe", flag: "🇿🇼" },
];

export const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));

const CountryDropdown = forwardRef<HTMLSelectElement, CountryDropdownProps>(({ onSubmit }, ref) => {
    const themeConfig = appConfig.app.theme;
    const [selectedCountry, setSelectedCountry] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCountry) {
            onSubmit(selectedCountry);
            // Optionally reset after submission if desired, but usually, we move to next question
            // setSelectedCountry(''); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
            <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                aria-label="Sélectionnez votre pays"
                required
                ref={ref} // Forward the ref to the select element
            >
                <option value="" disabled>Sélectionnez votre pays</option>
                {sortedCountries.map((country) => (
                    <option key={country.name} value={country.name}>
                        {country.flag} {country.name}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                className="w-full max-w-lg px-7 py-3 md:py-4 bg-emerald-600 text-white text-base md:text-lg rounded-full hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                disabled={!selectedCountry}
                style={{ backgroundColor: themeConfig.primaryColor }}
            >
                Valider
            </button>
        </form>
    );
});

CountryDropdown.displayName = 'CountryDropdown';

export default CountryDropdown;