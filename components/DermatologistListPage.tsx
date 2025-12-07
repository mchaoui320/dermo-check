
import React, { useState, useMemo } from 'react';
import { sortedCountries } from './CountryDropdown'; // Reusing for manual search block
import { BackArrowIcon } from './icons';
import { GenerateContentResponse, GroundingChunk, LatLng } from '@google/genai';

// --- Types and Interfaces ---

interface MapsPlaceInfo {
    uri: string;
    title: string;
    formattedAddress?: string;
    formatted_address?: string; // Snake case fallback
    formattedPhoneNumber?: string;
    formatted_phone_number?: string; // Snake case fallback
    internationalPhoneNumber?: string;
    international_phone_number?: string; // Snake case fallback
    websiteUri?: string;
    website_uri?: string; // Snake case fallback
    website?: string; // Simple fallback
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
    searchQuery: { country: string; city: string; };
    isLoading: boolean;
    error: string | null;
    onSearch: (country: string, city: string, userLatLng?: LatLng | null) => Promise<void>;
    lastSearchLocation?: LatLng | null;
}

interface DisplayableDermatologist {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    uri: string;
    email?: string;
    reviewSnippets?: MapsReviewSnippet[];
    distance?: number; // Distance in km
    lat?: number;
    lng?: number;
}

// --- Utils ---

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

// Base de données étendue des villes principales (Synchronisée avec DermatologistFinder)
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
const DEFAULT_CITIES = ["Capitale / Ville principale", "Autre (saisir)"];


const DermatologistListPage: React.FC<DermatologistListPageProps> = ({
    dermatologistMapResults,
    onBack,
    searchQuery,
    isLoading,
    error,
    onSearch,
    lastSearchLocation
}) => {
    // --- Input State for "Search Again" functionality ---
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCityOption, setSelectedCityOption] = useState<string>('');
    const [customCityInput, setCustomCityInput] = useState<string>('');
    const [geoError, setGeoError] = useState<string | null>(null);

    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        const cities = CITY_DATA[selectedCountry];
        // Ensure that even if the country exists but has an empty array, we don't break, though ideally we populate CITY_DATA
        return cities && cities.length > 0 ? cities : DEFAULT_CITIES;
    }, [selectedCountry]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedCityOption('');
        setCustomCityInput('');
    };

    const handleManualSearch = async () => {
        const finalCity = (selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale')
            ? customCityInput.trim()
            : selectedCityOption;

        if (selectedCountry && finalCity) {
            await onSearch(selectedCountry, finalCity, null);
        } else if (selectedCountry && !finalCity) {
            await onSearch(selectedCountry, "", null);
        }
    };

    const handleGeoSearch = async () => {
        setGeoError(null);
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas supportée.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latLng = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                await onSearch("", "", latLng);
            },
            (err) => {
                console.warn("Geolocation error:", err);
                setGeoError("Impossible de récupérer votre position.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const isManualSearchDisabled = useMemo(() => {
        if (isLoading || !selectedCountry) return true;
        if ((selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)') && !customCityInput.trim()) return true;
        if (!selectedCityOption && !customCityInput.trim()) return true;
        return false;
    }, [isLoading, selectedCountry, selectedCityOption, customCityInput]);

    // --- Results Parsing & Sorting ---
    const displayableDermatologists: DisplayableDermatologist[] = React.useMemo(() => {
        if (!dermatologistMapResults || !dermatologistMapResults.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            return [];
        }

        const chunks = dermatologistMapResults.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        const dermatologists: DisplayableDermatologist[] = [];

        chunks.forEach(chunk => {
            if (chunk.maps) {
                const mapInfo = chunk.maps as unknown as MapsPlaceInfo;
                const anyMapInfo = mapInfo as any; // For accessing potential non-typed properties

                if (mapInfo.uri && mapInfo.title) {
                    const name = mapInfo.title.trim();

                    // Robust extraction with fallback to snake_case
                    const address = (mapInfo.formattedAddress || mapInfo.formatted_address || anyMapInfo.vicinity || anyMapInfo.address)?.trim();
                    const phone = (mapInfo.formattedPhoneNumber || mapInfo.formatted_phone_number || mapInfo.internationalPhoneNumber || mapInfo.international_phone_number || anyMapInfo.phone_number)?.trim();
                    const website = (mapInfo.websiteUri || mapInfo.website_uri || mapInfo.website || anyMapInfo.url)?.trim();
                    const email = (anyMapInfo.email || anyMapInfo.business_email || anyMapInfo.contact_email)?.trim();

                    // Coordinate extraction logic
                    let lat: number | undefined;
                    let lng: number | undefined;

                    if (anyMapInfo.geometry && anyMapInfo.geometry.location) {
                        lat = anyMapInfo.geometry.location.lat;
                        lng = anyMapInfo.geometry.location.lng;
                    } else if (anyMapInfo.latitude && anyMapInfo.longitude) {
                        lat = anyMapInfo.latitude;
                        lng = anyMapInfo.longitude;
                    } else if (anyMapInfo.center) {
                        lat = anyMapInfo.center.latitude;
                        lng = anyMapInfo.center.longitude;
                    }

                    let distance: number | undefined = undefined;
                    if (lastSearchLocation && lat !== undefined && lng !== undefined) {
                        distance = calculateDistance(lastSearchLocation.latitude, lastSearchLocation.longitude, lat, lng);
                    }

                    const reviewSnippets: MapsReviewSnippet[] = [];
                    if (mapInfo.placeAnswerSources && Array.isArray(mapInfo.placeAnswerSources)) {
                        mapInfo.placeAnswerSources.forEach((source: MapsPlaceAnswerSource) => {
                            if (source.reviewSnippets && Array.isArray(source.reviewSnippets)) {
                                reviewSnippets.push(...source.reviewSnippets);
                            }
                        });
                    }

                    dermatologists.push({
                        name,
                        address,
                        phone,
                        website,
                        uri: mapInfo.uri,
                        email,
                        reviewSnippets: reviewSnippets.length > 0 ? reviewSnippets : undefined,
                        distance,
                        lat,
                        lng
                    });
                }
            }
        });

        // Sort by distance if it exists (Geo search mode)
        if (lastSearchLocation) {
            return dermatologists.sort((a, b) => {
                if (a.distance !== undefined && b.distance !== undefined) {
                    return a.distance - b.distance;
                }
                // If one has distance and other doesn't, prioritize the one with distance
                if (a.distance !== undefined) return -1;
                if (b.distance !== undefined) return 1;
                return 0;
            });
        }

        return dermatologists;
    }, [dermatologistMapResults, lastSearchLocation]);


    // --- Render Logic ---
    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-3xl" aria-live="polite" aria-atomic="true" role="status">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></span>
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                    </div>
                    <p className="mt-4 text-slate-600 text-base md:text-lg animate-fade-in">Recherche en cours...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 text-red-900 text-base rounded-xl text-center mt-4" role="alert">
                    <p className="font-bold mb-1">Erreur</p>
                    <p>{error}</p>
                </div>
            );
        }

        if (displayableDermatologists.length > 0) {
            return (
                <div className="w-full space-y-5 text-left mt-6" role="region" aria-label="Liste des dermatologues">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                            {lastSearchLocation ? `Résultats autour de moi (${displayableDermatologists.length})` : `Dermatologues à ${searchQuery.city || 'proximité'} (${displayableDermatologists.length})`}
                        </h3>
                    </div>

                    {displayableDermatologists.map((derm, index) => (
                        <div key={index} className="bg-white p-6 rounded-[16px] shadow-md border border-gray-100 transition-shadow hover:shadow-lg flex flex-col gap-3 animate-fade-in">
                            {/* Header: Name */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <h4 className="font-['Poppins'] font-semibold text-lg md:text-xl" style={{ color: '#00B37E' }}>
                                    {derm.name}
                                </h4>
                            </div>

                            {/* Content Block */}
                            <div className="font-['Inter'] text-sm md:text-base space-y-2 text-[#0A2840]">

                                {/* Address */}
                                {derm.address && (
                                    <p className="leading-relaxed flex gap-2 items-start">
                                        <span className="font-medium min-w-[24px] text-slate-500">📍</span>
                                        <span>{derm.address}</span>
                                    </p>
                                )}

                                {/* Distance */}
                                {derm.distance !== undefined && (
                                    <p className="leading-relaxed flex gap-2 items-center text-emerald-700 font-medium">
                                        <span className="font-medium min-w-[24px]">📍</span>
                                        <span>à {derm.distance} km</span>
                                    </p>
                                )}

                                {/* Phone */}
                                {derm.phone && (
                                    <p className="leading-relaxed flex gap-2 items-center">
                                        <span className="font-medium min-w-[24px] text-slate-500">📞</span>
                                        <a href={`tel:${derm.phone.replace(/[^\d+]/g, '')}`} className="hover:text-[#00B37E] font-medium transition-colors">
                                            {derm.phone}
                                        </a>
                                    </p>
                                )}

                                {/* Website */}
                                {derm.website && (
                                    <p className="leading-relaxed flex gap-2 items-center">
                                        <span className="font-medium min-w-[24px] text-slate-500">🌐</span>
                                        <a
                                            href={derm.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0066CC] hover:underline truncate block max-w-full"
                                        >
                                            {derm.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                                        </a>
                                    </p>
                                )}

                                {/* Email */}
                                {derm.email && (
                                    <p className="leading-relaxed flex gap-2 items-center">
                                        <span className="font-medium min-w-[24px] text-slate-500">✉️</span>
                                        <a href={`mailto:${derm.email}`} className="text-[#0066CC] hover:underline break-all">
                                            {derm.email}
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Footer: Link */}
                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-end">
                                <a
                                    href={derm.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gray-100 text-slate-700 hover:bg-[#00B37E] hover:text-white px-4 py-2 rounded-full font-['Inter'] font-medium text-sm transition-colors duration-200"
                                >
                                    Voir sur Google Maps
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-10 bg-gray-50 rounded-2xl mt-6">
                <p className="text-slate-600 text-lg font-medium">
                    Aucun résultat trouvé.
                </p>
                <p className="text-slate-500 text-sm mt-2">
                    Essayez d'élargir la zone de recherche ou de vérifier l'orthographe.
                </p>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in relative pt-4">
            {/* The Search Header Block (Dual Mode) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-4 border-b border-gray-100 pb-8">

                {/* BLOC 1 : Autour de moi (Compact) */}
                <div className="bg-[#F0FDFA] border border-[#D1FAE6] rounded-2xl p-5 flex flex-col shadow-sm">
                    <h3 className="text-lg font-bold font-['Poppins'] text-[#0A2840] mb-2 flex items-center gap-2">
                        📍 Autour de moi
                    </h3>
                    <p className="text-xs text-[#195E49] mb-3 font-['Inter'] flex-grow">
                        Recherche géolocalisée (10-15 km).
                    </p>
                    {geoError && <p className="text-red-500 text-xs mb-2">{geoError}</p>}
                    <button
                        onClick={handleGeoSearch}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 bg-white border border-[#00B37E] text-[#00B37E] hover:bg-[#00B37E] hover:text-white rounded-full transition-all duration-200 font-bold text-sm font-['Poppins']"
                    >
                        Trouver les proches
                    </button>
                </div>

                {/* BLOC 2 : Manuel (Compact) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col shadow-sm">
                    <h3 className="text-lg font-bold font-['Poppins'] text-[#0A2840] mb-2 flex items-center gap-2">
                        🌍 Par pays et ville
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="px-3 py-2 border border-gray-200 bg-gray-50 text-[#0A2840] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B37E] font-['Inter']"
                                disabled={isLoading}
                            >
                                <option value="" disabled>Pays</option>
                                {sortedCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select
                                value={selectedCityOption}
                                onChange={(e) => setSelectedCityOption(e.target.value)}
                                className="px-3 py-2 border border-gray-200 bg-gray-50 text-[#0A2840] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B37E] font-['Inter']"
                                disabled={!selectedCountry || isLoading}
                            >
                                <option value="" disabled>Ville</option>
                                {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                                <option value="other" className="font-bold text-[#00B37E]">Autre</option>
                            </select>
                        </div>

                        {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') && (
                            <input
                                type="text"
                                value={customCityInput}
                                onChange={(e) => setCustomCityInput(e.target.value)}
                                placeholder="Nom de la ville..."
                                className="w-full px-3 py-2 border border-[#00B37E] bg-white text-[#0A2840] text-sm rounded-lg focus:outline-none font-['Inter']"
                                disabled={isLoading}
                            />
                        )}

                        <button
                            onClick={handleManualSearch}
                            disabled={isManualSearchDisabled}
                            className="w-full px-4 py-2.5 bg-[#00B37E] text-white rounded-full hover:bg-[#009466] disabled:opacity-50 font-bold text-sm font-['Poppins']"
                        >
                            Rechercher
                        </button>
                    </div>
                </div>
            </div>

            {renderResults()}

            <p className="text-xs text-gray-400 italic text-center pb-4">
                *Résultats fournis par Google Maps. Vérifiez les informations avant de vous déplacer.
            </p>
        </div>
    );
};

export default DermatologistListPage;
