window.TRAVEL_DATA = {
  months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  countries: [
    {
      id: "sg",
      slug: "singapore",
      name: "Singapore",
      aliases: ["SG","Lion City"],
      region: "Southeast Asia",
      bestMonths: [1,2,3,4,5,9,10,11],
      currency: "SGD",
      visa: "Visa-free/eTA for many nationalities; check beforehand.",
      tags: ["Urban","Food","Family"],
      budget: { low: 50000, mid: 90000, luxury: 220000 },
      coordinates: { lat: 1.3521, lng: 103.8198 },
      itinerary: {
        "5": [
          { day: 1, title: "Arrival & Marina Bay", items: ["Marina Bay Sands","Gardens by the Bay"], lodging: "Marina hotel", transit: "Airport MRT" },
          { day: 2, title: "Cultural day", items: ["Chinatown","Little India","Kampong Glam"], lodging: "City hotel", transit: "MRT" },
          { day: 3, title: "Sentosa", items: ["Universal Studios","Beach"," Madame Tussauds"], lodging: "Sentosa hotel", transit: "Cable car/MRT" },
          { day: 4, title: "Nature & night", items: ["Singapore Botanic Gardens","Night Safari"], lodging: "Orchard hotel", transit: "Bus/MRT" },
          { day: 5, title: "Shopping & departure", items: ["Orchard Road","Changi Jewel"], lodging: "N/A", transit: "Airport MRT" }
        ],
        "7": [
          { day: 1, title: "Arrival & Marina Bay", items: ["Marina Bay Sands","Supertree Grove"], lodging: "Marina hotel", transit: "Airport MRT" },
          { day: 2, title: "Cultural quarters", items: ["Chinatown","Tiong Bahru","Kampong Glam"], lodging: "Boutique hotel", transit: "MRT" },
          { day: 3, title: "Sentosa fun", items: ["Universal Studios","S.E.A. Aquarium"], lodging: "Sentosa hotel", transit: "Cable car" },
          { day: 4, title: "Nature", items: ["Botanic Gardens","Bukit Timah nature trail"], lodging: "H升本", transit: "Bus" },
          { day: 5, title: "Island highlights", items: ["Pulau Ubin","Chek Jawa"], lodging: "Budget hotel", transit: "LRT + bumboat" },
          { day: 6, title: "East coast + night", items: ["East Coast Park","Night Safari"], lodging: "East coast hotel", transit: "Bus" },
          { day: 7, title: "Changi + fly back", items: ["Jewel Changi","Duty-free"], lodging: "N/A", transit: "Airport train" }
        ]
      }
    },
    {
      id: "th",
      slug: "thailand",
      name: "Thailand",
      aliases: ["TH","Land of Smiles"],
      region: "Southeast Asia",
      bestMonths: [1,2,11,12],
      currency: "THB",
      visa: "Visa on arrival / eVisa available for Indians.",
      tags: ["Food","Beaches","Culture"],
      budget: { low: 35000, mid: 65000, luxury: 150000 },
      coordinates: { lat: 15.87, lng: 100.9925 },
      itinerary: {
        "5": [
          { day: 1, title: "Bangkok arrival", items: ["Grand Palace","Wat Pho"], lodging: "Riverside hotel", transit: "Taxi + boat" },
          { day: 2, title: "Bangkok food & malls", items: ["Chatuchak","ICONsiam","Chinatown"], lodging: "Riverside hotel", transit: "BTS" },
          { day: 3, title: "Ayutthaya day trip", items: ["Temple tour","River park"], lodging: "BKK hotel", transit: "Train/car" },
          { day: 4, title: "Phuket arrival", items: ["Patong","Old Town"], lodging: "Beach resort", transit: "Flight" },
          { day: 5, title: "Island & departure", items: ["Phi Phi day trip","Airport"], lodging: "N/A", transit: "Speedboat + taxi" }
        ]
      }
    }
  ],
  blr_monthwise: [
    { month: "January", recommendation: "Singapore", why: "Cool, dry; gardens, food, New Year celebrations", flight_band_inr: [18000,35000], stay_band_inr_night: [3500,8000], must_visit: ["Marina Bay","Gardens by the Bay","Sentosa"], visa_summary: "ETA/eVisa; check latest rules." },
    { month: "February", recommendation: "Bangkok & Phuket", why: "Peak dry season, cool, ideal island hopping", flight_band_inr: [14000,24000], stay_band_inr_night: [2500,7000], must_visit: ["Grand Palace","Phi Phi Islands","Phuket Old Town"], visa_summary: "VOA 15 days; eVisa also available." },
    { month: "March", recommendation: "Tokyo", why: "Cherry blossoms; cultural pomp", flight_band_inr: [40000,70000], stay_band_inr_night: [5000,12000], must_visit: ["Ueno Park","Shibuya","Kyoto day trip"], visa_summary: "Tourist eVisa; processing 4–7 days." },
    { month: "April", recommendation: "Bali", why: "Dry season begins; lush greenery", flight_band_inr: [22000,32000], stay_band_inr_night: [2200,8000], must_visit: ["Ubud rice terraces","Tanah Lot","Uluwatu"], visa_summary: "VOA 30 days; check entry rules." },
    { month: "May", recommendation: "Maldives", why: "Lower resort rates; calm seas still", flight_band_inr: [20000,34000], stay_band_inr_night: [2000,7000], must_visit: ["Maafushi","Baa Atoll","Local islands"], visa_summary: "Free tourist entry permit on arrival." },
    { month: "June", recommendation: "Kuala Lumpur", why: "Stable weather; food and value stays", flight_band_inr: [12000,22000], stay_band_inr_night: [1500,5000], must_visit: ["Petronas Towers","Batu Caves","Penang"], visa_summary: "eNTRI/eVisa; 30 days multiple entry." },
    { month: "July", recommendation: "Dubai", why: "Indoor attractions + cooler desert evenings", flight_band_inr: [18000,30000], stay_band_inr_night: [3500,10000], must_visit: ["Burj Khalifa","Desert Safari","Dubai Mall"], visa_summary: "E-visa online; 30 days." },
    { month: "August", recommendation: "Tbilisi", why: "Wine season; visa-free entry for Indians", flight_band_inr: [26000,42000], stay_band_inr_night: [2000,7000], must_visit: ["Old Tbilisi","Wine region Kakheti","Narikala Fortress"], visa_summary: "Visa waiver 1 year, no fee for Indians." },
    { month: "September", recommendation: "Istanbul", why: "Fewer crowds; great museum + historic combo", flight_band_inr: [26000,40000], stay_band_inr_night: [2500,8000], must_visit: ["Hagia Sophia","Blue Mosque","Grand Bazaar"], visa_summary: "E-visa; 30 days." },
    { month: "October", recommendation: "Portugal", why: "Mild autumn; cheaper than summer", flight_band_inr: [35000,60000], stay_band_inr_night: [3000,9500], must_visit: ["Lisbon Alfama","Sintra","Porto Ribeira"], visa_summary: "Schengen visa; 15–20 days processing." },
    { month: "November", recommendation: "Sri Lanka", why: "Post-monsoon clear east/west coasts", flight_band_inr: [12000,20000], stay_band_inr_night: [1800,5500], must_visit: ["Galle Fort","Ella","Mirissa"], visa_summary: "ETA free; 30 days online." },
    { month: "December", recommendation: "Bali", why: "Festive vibe; dry mornings", flight_band_inr: [22000,32000], stay_band_inr_night: [2200,8000], must_visit: ["Ubud","Seminyak","Uluwatu temple"], visa_summary: "VOA 30 days; confirm current rules." }
  ]
};
