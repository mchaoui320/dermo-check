
import React, { useState, useMemo } from 'react';
import { sortedCountries } from './CountryDropdown'; // Import sortedCountries
import { BackArrowIcon } from './icons';
import { LatLng } from '@google/genai'; // Import LatLng type

// Base de données étendue des villes principales pour tous les pays
const CITY_DATA: Record<string, string[]> = {
    "Afghanistan": ["Kaboul", "Kandahar", "Hérat", "Mazar-i-Sharif", "Jalalabad"],
    "Afrique du Sud": ["Le Cap", "Durban", "Johannesbourg", "Soweto", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London"],
    "Albanie": ["Tirana", "Durrës", "Vlora", "Elbasan", "Shkodra"],
    "Algérie": ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif", "Sidi Bel Abbès", "Biskra", "Tébessa", "El Oued", "Skikda", "Tiaret", "Béjaïa", "Tlemcen", "Ouargla", "Béchar", "Mostaganem", "Bordj Bou Arréridj"],
    "Allemagne": ["Berlin", "Hambourg", "Munich", "Cologne", "Francfort", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Brême", "Dresde", "Hanovre", "Nuremberg", "Duisbourg"],
    "Andorre": ["Andorre-la-Vieille", "Escaldes-Engordany", "Encamp"],
    "Angola": ["Luanda", "Cabinda", "Huambo", "Lubango", "Benguela"],
    "Arabie Saoudite": ["Riyad", "Djeddah", "La Mecque", "Médine", "Dammam", "Taïf", "Tabuk"],
    "Argentine": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe", "San Juan"],
    "Arménie": ["Erevan", "Gyumri", "Vanadzor"],
    "Australie": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adélaïde", "Gold Coast", "Canberra", "Newcastle", "Wollongong"],
    "Autriche": ["Vienne", "Graz", "Linz", "Salzbourg", "Innsbruck", "Klagenfurt"],
    "Azerbaïdjan": ["Bakou", "Gandja", "Sumqayit"],
    "Bahamas": ["Nassau", "Freeport"],
    "Bahreïn": ["Manama", "Riffa", "Muharraq"],
    "Bangladesh": ["Dacca", "Chittagong", "Khulna", "Rajshahi"],
    "Barbade": ["Bridgetown"],
    "Belgique": ["Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", "Namur", "Louvain", "Mons", "Alost", "Malines", "La Louvière", "Courtrai", "Hasselt", "Ostende", "Tournai", "Genk", "Seraing", "Roulers", "Verviers"],
    "Belize": ["Belize City", "San Ignacio", "Belmopan"],
    "Bénin": ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Bohicon"],
    "Bhoutan": ["Thimphou", "Phuntsholing"],
    "Biélorussie": ["Minsk", "Gomel", "Moguilev", "Vitebsk"],
    "Bolivie": ["Santa Cruz de la Sierra", "El Alto", "La Paz", "Cochabamba"],
    "Bosnie-Herzégovine": ["Sarajevo", "Banja Luka", "Tuzla", "Zenica"],
    "Botswana": ["Gaborone", "Francistown"],
    "Brésil": ["São Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Belém", "Goiânia"],
    "Brunei": ["Bandar Seri Begawan"],
    "Bulgarie": ["Sofia", "Plovdiv", "Varna", "Bourgas"],
    "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"],
    "Burundi": ["Bujumbura", "Gitega"],
    "Cabo Verde": ["Praia", "Mindelo"],
    "Cambodge": ["Phnom Penh", "Siem Reap", "Battambang"],
    "Cameroun": ["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Garoua", "Maroua", "Ngaoundéré", "Kumba", "Buéa", "Nkongsamba"],
    "Canada": ["Montréal", "Québec", "Toronto", "Vancouver", "Ottawa", "Calgary", "Edmonton", "Winnipeg", "Hamilton", "Kitchener", "London", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon", "Regina", "Sherbrooke", "St. John's"],
    "Chili": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta"],
    "Chine": ["Pékin", "Shanghai", "Canton", "Shenzhen", "Chengdu", "Wuhan", "Tianjin", "Xi'an", "Nankin", "Chongqing", "Hangzhou", "Harbin"],
    "Chypre": ["Nicosie", "Limassol", "Larnaca", "Paphos"],
    "Colombie": ["Bogota", "Medellín", "Cali", "Barranquilla", "Carthagène", "Cúcuta", "Soledad", "Ibagué", "Bucaramanga", "Santa Marta"],
    "Comores": ["Moroni", "Mutsamudu"],
    "Congo (Brazzaville)": ["Brazzaville", "Pointe-Noire", "Dolisie"],
    "Congo (Kinshasa)": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Goma", "Bukavu"],
    "Corée du Nord": ["Pyongyang", "Hamhung"],
    "Corée du Sud": ["Séoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan"],
    "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia"],
    "Côte d'Ivoire": ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Divo", "Korhogo", "Anyama", "Abengourou", "Man", "Gagnoa", "Soubré", "Agboville", "Dabou", "Grand-Bassam"],
    "Croatie": ["Zagreb", "Split", "Rijeka", "Osijek"],
    "Cuba": ["La Havane", "Santiago de Cuba", "Camagüey", "Holguín"],
    "Danemark": ["Copenhague", "Aarhus", "Odense", "Aalborg", "Esbjerg"],
    "Djibouti": ["Djibouti"],
    "Dominique": ["Roseau"],
    "Égypte": ["Le Caire", "Alexandrie", "Gizeh", "Shubra El-Kheima", "Port-Saïd", "Suez", "Louxor", "Mansourah", "El-Mahalla El-Kubra", "Tanta"],
    "Émirats Arabes Unis": ["Dubaï", "Abou Dabi", "Sharjah", "Al Aïn", "Ajman"],
    "Équateur": ["Guayaquil", "Quito", "Cuenca", "Santo Domingo"],
    "Érythrée": ["Asmara", "Keren"],
    "Espagne": ["Madrid", "Barcelone", "Valence", "Séville", "Saragosse", "Málaga", "Murcie", "Palma", "Las Palmas", "Bilbao", "Alicante", "Cordoue", "Valladolid", "Vigo"],
    "Estonie": ["Tallinn", "Tartu", "Narva"],
    "Eswatini": ["Mbabane", "Manzini"],
    "États-Unis": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphie", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "Miami", "Atlanta"],
    "Éthiopie": ["Addis-Abeba", "Dire Dawa", "Mekele", "Gondar"],
    "Fidji": ["Suva", "Lautoka"],
    "Finlande": ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku"],
    "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne", "Le Havre", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne", "Aix-en-Provence", "Brest", "Le Mans", "Amiens", "Tours", "Limoges", "Clermont-Ferrand", "Perpignan", "Besançon", "Orléans", "Metz", "Rouen", "Mulhouse", "Caen", "Nancy", "Avignon", "Poitiers", "Versailles"],
    "Gabon": ["Libreville", "Port-Gentil", "Franceville"],
    "Gambie": ["Serekunda", "Brikama", "Banjul"],
    "Géorgie": ["Tbilissi", "Batoumi", "Koutaïssi"],
    "Ghana": ["Accra", "Kumasi", "Tamale", "Takoradi"],
    "Grèce": ["Athènes", "Thessalonique", "Patras", "Héraklion", "Larissa", "Volos"],
    "Grenade": ["Saint-Georges"],
    "Guatemala": ["Guatemala", "Mixco", "Villa Nueva"],
    "Guinée": ["Conakry", "Nzérékoré", "Kankan", "Kindia"],
    "Guinée-Bissau": ["Bissau"],
    "Guinée équatoriale": ["Malabo", "Bata"],
    "Guyana": ["Georgetown"],
    "Haïti": ["Port-au-Prince", "Carrefour", "Delmas", "Pétion-Ville", "Gonaïves"],
    "Honduras": ["Tegucigalpa", "San Pedro Sula", "Choloma"],
    "Hongrie": ["Budapest", "Debrecen", "Szeged", "Miskolc"],
    "Îles Salomon": ["Honiara"],
    "Inde": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Calcutta", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur"],
    "Indonésie": ["Jakarta", "Surabaya", "Bandung", "Bekasi", "Medan", "Tangerang", "Depok", "Semarang", "Palembang", "Makassar"],
    "Irak": ["Bagdad", "Bassorah", "Mossoul", "Erbil"],
    "Iran": ["Téhéran", "Machhad", "Ispahan", "Karaj", "Chiraz", "Tabriz"],
    "Irlande": ["Dublin", "Cork", "Limerick", "Galway", "Waterford"],
    "Islande": ["Reykjavik", "Kópavogur"],
    "Israël": ["Jérusalem", "Tel Aviv", "Haïfa", "Rishon LeZion", "Petah Tikva"],
    "Italie": ["Rome", "Milan", "Naples", "Turin", "Palerme", "Gênes", "Bologne", "Florence", "Bari", "Catane", "Venise", "Vérone", "Messine", "Padoue", "Trieste"],
    "Jamaïque": ["Kingston", "Portmore", "Montego Bay"],
    "Japon": ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Kyoto", "Fukuoka", "Kawasaki", "Saitama", "Hiroshima", "Sendai"],
    "Jordanie": ["Amman", "Zarqa", "Irbid"],
    "Kazakhstan": ["Almaty", "Noursoultan", "Chimkent"],
    "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    "Kirghizistan": ["Bichkek", "Och"],
    "Kiribati": ["Tarawa"],
    "Koweït": ["Koweït", "Al Ahmadi", "Hawalli"],
    "Laos": ["Vientiane", "Pakse", "Savannakhet"],
    "Lesotho": ["Maseru"],
    "Lettonie": ["Riga", "Daugavpils", "Liepāja"],
    "Liban": ["Beyrouth", "Tripoli", "Sidon", "Tyr"],
    "Libéria": ["Monrovia"],
    "Libye": ["Tripoli", "Benghazi", "Misrata"],
    "Liechtenstein": ["Vaduz", "Schaan"],
    "Lituanie": ["Vilnius", "Kaunas", "Klaipėda"],
    "Luxembourg": ["Luxembourg", "Esch-sur-Alzette", "Differdange", "Dudelange"],
    "Madagascar": ["Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga"],
    "Malaisie": ["Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya"],
    "Malawi": ["Lilongwe", "Blantyre", "Mzuzu"],
    "Maldives": ["Malé"],
    "Mali": ["Bamako", "Sikasso", "Kalabancoro", "Koutiala", "Ségou"],
    "Malte": ["La Valette", "Birkirkara", "Mosta", "Sliema"],
    "Maroc": ["Casablanca", "Rabat", "Fès", "Tanger", "Marrakech", "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan", "Safi", "Mohammédia", "Khouribga", "El Jadida", "Béni Mellal", "Nador", "Taza", "Settat"],
    "Maurice": ["Port-Louis", "Vacoas-Phoenix", "Beau Bassin-Rose Hill", "Curepipe"],
    "Mauritanie": ["Nouakchott", "Nouadhibou"],
    "Mexique": ["Mexico", "Ecatepec", "Guadalajara", "Puebla", "Ciudad Juárez", "Tijuana", "León", "Zapopan", "Monterrey"],
    "Micronésie": ["Palikir", "Weno"],
    "Moldavie": ["Chisinau", "Bălți", "Tiraspol"],
    "Monaco": ["Monaco", "Monte-Carlo"],
    "Mongolie": ["Oulan-Bator", "Erdenet"],
    "Monténégro": ["Podgorica", "Nikšić"],
    "Mozambique": ["Maputo", "Matola", "Beira", "Nampula"],
    "Myanmar": ["Rangoun", "Mandalay", "Naypyidaw"],
    "N. Macédoine": ["Skopje", "Bitola", "Kumanovo"],
    "Nambie": ["Windhoek", "Rundu", "Walvis Bay"],
    "Nauru": ["Yaren"],
    "Népal": ["Katmandou", "Pokhara", "Lalitpur"],
    "Nicaragua": ["Managua", "León", "Masaya"],
    "Niger": ["Niamey", "Zinder", "Maradi", "Agadez"],
    "Nigeria": ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City", "Maiduguri", "Abuja"],
    "Norvège": ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen"],
    "Nouvelle-Zélande": ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier-Hastings", "Dunedin"],
    "Oman": ["Mascate", "Seeb", "Salalah"],
    "Ouganda": ["Kampala", "Nansana", "Kira"],
    "Ouzbékistan": ["Tachkent", "Namangan", "Samarcande"],
    "Pakistan": ["Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Peshawar", "Multan", "Islamabad"],
    "Palaos": ["Ngerulmud", "Koror"],
    "Palestine": ["Gaza", "Hébron", "Naplouse", "Ramallah"],
    "Panama": ["Panama", "San Miguelito"],
    "Papouasie-N.G.": ["Port Moresby", "Lae"],
    "Paraguay": ["Asuncion", "Ciudad del Este", "San Lorenzo"],
    "Pays-Bas": ["Amsterdam", "Rotterdam", "La Haye", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"],
    "Pérou": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura"],
    "Philippines": ["Quezon City", "Manille", "Davao", "Caloocan", "Cebu"],
    "Pologne": ["Varsovie", "Cracovie", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice"],
    "Portugal": ["Lisbonne", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal", "Coimbra", "Setúbal"],
    "Qatar": ["Doha", "Al Rayyan"],
    "R. Centrafricaine": ["Bangui", "Bimbo"],
    "R. Dominicaine": ["Saint-Domingue", "Santiago de los Caballeros"],
    "Rép. Tchèque": ["Prague", "Brno", "Ostrava", "Pilsen"],
    "Roumanie": ["Bucarest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
    "Royaume-Uni": ["Londres", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", "Édimbourg", "Leeds", "Sheffield", "Leicester", "Coventry", "Bradford", "Cardiff", "Belfast"],
    "Russie": ["Moscou", "Saint-Pétersbourg", "Novossibirsk", "Iekaterinbourg", "Nijni Novgorod", "Kazan", "Tcheliabinsk", "Omsk", "Samara", "Rostov-sur-le-Don", "Oufa"],
    "Rwanda": ["Kigali", "Butare", "Gitarama"],
    "Saint-Marin": ["Saint-Marin", "Serravalle"],
    "Salvador": ["San Salvador", "Soyapango", "Santa Ana"],
    "Samoa": ["Apia"],
    "São Tomé-et-Príncipe": ["São Tomé"],
    "Sénégal": ["Dakar", "Touba", "Thiès", "Rufisque", "Kaolack", "M'bour", "Ziguinchor", "Saint-Louis"],
    "Serbie": ["Belgrade", "Novi Sad", "Niš"],
    "Seychelles": ["Victoria"],
    "Sierra Leone": ["Freetown", "Bo", "Kenema"],
    "Singapour": ["Singapour"],
    "Slovaquie": ["Bratislava", "Košice", "Prešov"],
    "Slovénie": ["Ljubljana", "Maribor", "Celje"],
    "Somalie": ["Mogadiscio", "Hargeisa", "Berbera"],
    "Soudan": ["Khartoum", "Omdourman", "Khartoum Nord"],
    "Soudan du Sud": ["Djouba", "Malakal", "Wau"],
    "Sri Lanka": ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa"],
    "Suède": ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg"],
    "Suisse": ["Zurich", "Genève", "Bâle", "Lausanne", "Berne", "Winterthour", "Lucerne", "Saint-Gall", "Lugano", "Bienne"],
    "Suriname": ["Paramaribo"],
    "Syrie": ["Damas", "Alep", "Homs", "Lattaquié"],
    "Tadjikistan": ["Douchanbé", "Khodjent"],
    "Tanzanie": ["Dar es Salam", "Mwanza", "Zanzibar", "Arusha", "Dodoma"],
    "Tchad": ["N'Djaména", "Moundou", "Sarh"],
    "Thaïlande": ["Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Hat Yai"],
    "Timor oriental": ["Dili"],
    "Togo": ["Lomé", "Sokodé", "Kara"],
    "Tonga": ["Nuku'alofa"],
    "Trinité-et-Tobago": ["Chaguanas", "San Fernando", "Port-d'Espagne"],
    "Tunisie": ["Tunis", "Sfax", "Sousse", "Ettadhamen-Mnihla", "Kairouan", "Gabès", "Bizerte", "Ariana", "Gafsa", "Monastir"],
    "Turkménistan": ["Achgabat", "Türkmenabat"],
    "Turquie": ["Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep", "Konya", "Antalya", "Kayseri", "Mersin"],
    "Tuvalu": ["Funafuti"],
    "Ukraine": ["Kiev", "Kharkiv", "Odessa", "Dnipro", "Donetsk", "Zaporijia", "Lviv"],
    "Uruguay": ["Montevideo", "Salto", "Ciudad de la Costa"],
    "Vanuatu": ["Port-Vila"],
    "Vatican": ["Cité du Vatican"],
    "Venezuela": ["Caracas", "Maracaibo", "Valencia", "Barquisimeto"],
    "Viêt Nam": ["Hô Chi Minh-Ville", "Hanoï", "Da Nang", "Haiphong", "Can Tho"],
    "Yémen": ["Sanaa", "Aden", "Ta'izz"],
    "Zambie": ["Lusaka", "Kitwe", "Ndola"],
    "Zimbabwe": ["Harare", "Bulawayo", "Chitungwiza"]
};

// Fallback pour les pays non listés ou si la liste est vide
const DEFAULT_CITIES = ["Capitale / Ville principale", "Autre (saisir)"];

interface DermatologistFinderProps {
    onBack: () => void;
    onSearch: (country: string, city: string, userLatLng?: LatLng | null) => Promise<void>; 
    isLoading: boolean;
}

const DermatologistFinder: React.FC<DermatologistFinderProps> = ({ onBack, onSearch, isLoading }) => {
    // Manual Search State
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCityOption, setSelectedCityOption] = useState<string>('');
    const [customCityInput, setCustomCityInput] = useState<string>('');
    
    // Geolocation Search State
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

    // Get Cities for selected country
    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        const cities = CITY_DATA[selectedCountry];
        return cities && cities.length > 0 ? cities : DEFAULT_CITIES;
    }, [selectedCountry]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedCityOption('');
        setCustomCityInput('');
    };

    // Manual Search Handler
    const handleManualSearch = async () => {
        const finalCity = (selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') 
            ? customCityInput.trim() 
            : selectedCityOption;
            
        if (selectedCountry && finalCity) {
            await onSearch(selectedCountry, finalCity, null);
        } else if (selectedCountry && !finalCity) {
             // Allow searching just by country if no city input, though less precise
             await onSearch(selectedCountry, "", null);
        }
    };

    // Geolocation Search Handler
    const handleGeoSearch = async () => {
        setGeoError(null);
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latLng = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(latLng);
                // Trigger search with empty city/country but valid latLng
                await onSearch("", "", latLng); 
            },
            (error) => {
                console.warn("Geolocation error:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setGeoError("Localisation refusée. Veuillez vérifier vos paramètres.");
                } else {
                    setGeoError("Impossible de récupérer votre position.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const isManualSearchDisabled = useMemo(() => {
        if (isLoading || !selectedCountry) return true;
        // If city is selected and it's a "custom" type, we need input
        if ((selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)') && !customCityInput.trim()) return true;
        // If no city selected yet
        if (!selectedCityOption && !customCityInput.trim()) return true;
        return false;
    }, [isLoading, selectedCountry, selectedCityOption, customCityInput]);

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in relative">
            <button
                onClick={onBack}
                className="absolute -top-12 left-0 p-2 text-gray-400 hover:text-[#00B37E] transition-colors rounded-full hover:bg-gray-50"
                aria-label="Retour"
            >
                <BackArrowIcon />
            </button>

            <div className="w-full text-center mb-4">
                <p className="text-base md:text-lg font-['Inter'] text-[#195E49]">
                    Choisissez une méthode pour localiser un spécialiste :
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                {/* BLOC 1 : Autour de moi */}
                <div className="bg-[#F0FDFA] border border-[#D1FAE6] rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold font-['Poppins'] text-[#0A2840] mb-4">
                        📍 Autour de moi
                    </h3>
                    <p className="text-sm text-[#195E49] mb-6 text-center font-['Inter']">
                        Utilisez votre position actuelle pour trouver les dermatologues dans un rayon de 10-15 km.
                    </p>
                    
                    {geoError && (
                        <p className="text-red-600 text-xs mb-3 bg-red-50 p-2 rounded-lg">{geoError}</p>
                    )}

                    <button
                        onClick={handleGeoSearch}
                        disabled={isLoading}
                        className="w-full mt-auto px-6 py-4 bg-white border-2 border-[#00B37E] text-[#00B37E] hover:bg-[#00B37E] hover:text-white rounded-full transition-all duration-200 font-bold font-['Poppins'] shadow-sm"
                    >
                        {isLoading ? "Recherche..." : "Trouver les proches"}
                    </button>
                </div>

                {/* BLOC 2 : Par pays et ville */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                     <h3 className="text-xl font-bold font-['Poppins'] text-[#0A2840] mb-4 text-center">
                        🌍 Par pays et ville
                    </h3>
                    <div className="flex flex-col gap-4 w-full">
                        <select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-[#0A2840] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/50 transition-all font-['Inter']"
                            disabled={isLoading}
                        >
                            <option value="" disabled>Pays</option>
                            {sortedCountries.map((country) => (
                                <option key={country.name} value={country.name}>
                                    {country.flag} {country.name}
                                </option>
                            ))}
                        </select>

                        <div className="relative w-full">
                             <select
                                value={selectedCityOption}
                                onChange={(e) => setSelectedCityOption(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-[#0A2840] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/50 transition-all font-['Inter']"
                                disabled={!selectedCountry || isLoading}
                            >
                                <option value="" disabled>Ville</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="other" className="font-bold text-[#00B37E]">Autre (saisir)</option>
                            </select>
                        </div>

                        {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') && (
                             <input
                                type="text"
                                value={customCityInput}
                                onChange={(e) => setCustomCityInput(e.target.value)}
                                placeholder="Nom de la ville..."
                                className="w-full px-4 py-3 border border-[#00B37E] bg-white text-[#0A2840] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30 font-['Inter'] animate-fade-in"
                                disabled={isLoading}
                            />
                        )}

                        <button
                            onClick={handleManualSearch}
                            disabled={isManualSearchDisabled}
                            className="w-full mt-2 px-6 py-4 bg-[#00B37E] text-white rounded-full hover:bg-[#009466] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold font-['Poppins'] shadow-md"
                        >
                            {isLoading ? "..." : "Rechercher"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DermatologistFinder;
