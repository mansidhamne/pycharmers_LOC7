// "use client";

// import { useState } from "react";
// import axios from "axios";

// const cities = [
//   "United Kingdom - London",
//   "France - Paris",
//   "Germany - Berlin",
//   "Spain - Madrid",
//   "Italy - Rome",
//   "Netherlands - Amsterdam",
//   "Switzerland - Zurich",
//   "Belgium - Brussels",
//   "Portugal - Lisbon",
//   "Austria - Vienna",
// ];

// const ratings = ["3", "4", "5"];

// export default function Home() {
//   const [selectedCity, setSelectedCity] = useState(cities[0]);
//   const [selectedRating, setSelectedRating] = useState("3,4,5");
//   const [hotels, setHotels] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const fetchHotels = async () => {
//     setLoading(true);
//     setHotels(null);
//     try {
//       const response = await axios.get("http://localhost:3001/get-hotels", {
//         params: { city: selectedCity, ratings: selectedRating },
//       });
//       setHotels(response.data.hotels);
//     } catch (error) {
//       setHotels("Failed to fetch hotels.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
//       <h1 className="text-2xl font-bold mb-4">Find Hotels</h1>

//       <div className="mb-4">
//         <label className="block mb-2">Select City:</label>
//         <select
//           value={selectedCity}
//           onChange={(e) => setSelectedCity(e.target.value)}
//           className="p-2 border rounded"
//         >
//           {cities.map((city) => (
//             <option key={city} value={city}>
//               {city}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <label className="block mb-2">Select Rating:</label>
//         <select
//           value={selectedRating}
//           onChange={(e) => setSelectedRating(e.target.value)}
//           className="p-2 border rounded"
//         >
//           <option value="3,4,5">3, 4, and 5 Star</option>
//           {ratings.map((rating) => (
//             <option key={rating} value={rating}>
//               {rating} Star
//             </option>
//           ))}
//         </select>
//       </div>

//       <button
//         onClick={fetchHotels}
//         className="px-4 py-2 bg-blue-500 text-white rounded"
//         disabled={loading}
//       >
//         {loading ? "Loading..." : "Search Hotels"}
//       </button>

//       {hotels && (
//         <div className="mt-6 p-4 bg-white shadow rounded w-full max-w-2xl">
//           <h2 className="text-xl font-semibold">Hotel Results</h2>
//           <pre className="mt-2 text-sm">{hotels}</pre>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
const cities = [
  { code: "LON", name: "United Kingdom - London" },
  { code: "PAR", name: "France - Paris" },
  { code: "BER", name: "Germany - Berlin" },
  { code: "MAD", name: "Spain - Madrid" },
  { code: "ROM", name: "Italy - Rome" },
  { code: "AMS", name: "Netherlands - Amsterdam" },
  { code: "ZRH", name: "Switzerland - Zurich" },
  { code: "BRU", name: "Belgium - Brussels" },
  { code: "LIS", name: "Portugal - Lisbon" },
  { code: "VIE", name: "Austria - Vienna" },
];

const ratings = ["3", "4", "5"];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(cities[0].code);
  const [selectedRating, setSelectedRating] = useState("3,4,5");
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    setHotels([]);
    try {
      const response = await axios.get("http://localhost:3001/get-hotels", {
        params: { city: selectedCity, ratings: selectedRating },
      });
      setHotels(response.data.hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Find Hotels</h1>

        <div className="mb-4">
          <label className="block mb-2 text-gray-300">Select City:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-2 bg-gray-800 border rounded text-white"
          >
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-300">Select Rating:</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full p-2 bg-gray-800 border rounded text-white"
          >
            <option value="3,4,5">All (3, 4, 5 Star)</option>
            {ratings.map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchHotels}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search Hotels"}
        </button>
      </div>

      {/* Main Content */}
      <div className="w-3/4 bg-gray-100 p-6">
        <h2 className="text-2xl font-semibold mb-4">Hotel Results</h2>

        {/* Loading State */}
        {loading && <div className="text-center text-gray-600">Loading...</div>}

        {/* No Results */}
        {!loading && hotels.length === 0 && (
          <div className="text-center text-gray-500">No hotels found.</div>
        )}

        {/* Hotel List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white p-4 shadow-lg rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p className="text-gray-500">{hotel.city}</p>

              <div className="flex items-center mt-2">
                {[...Array(hotel.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-500" />
                ))}
              </div>

              <p className="text-lg font-bold text-blue-600 mt-2">
                ₹{hotel.price}
              </p>
              <p className="text-gray-600 text-sm mt-1">{hotel.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
