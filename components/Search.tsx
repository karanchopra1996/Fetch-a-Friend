import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Logout from '../components/Logout'; // Adjust the import path if needed

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

interface Match {
  match: string;
}

interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

const Search = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [favorites, setFavorites] = useState<Dog[]>([]);
  const [match, setMatch] = useState<Dog | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // We still use zipToLocation mapping to display city and state info for each dog.
  const [zipToLocation, setZipToLocation] = useState<Record<string, Location>>({});

  // We no longer filter by location so we don't need zipCodesFilter.
  // Instead, when dogs are fetched, we derive their ZIP codes to fetch location info.
  const pageSize = 25;
  const router = useRouter();

  // --------------------------------------------
  // Fetch data on mount
  // --------------------------------------------
  useEffect(() => {
    fetchBreeds();
  }, []);

  // Re-fetch dogs whenever filters or pagination changes
  useEffect(() => {
    fetchDogs();
  }, [selectedBreed, sortOrder, currentPage]);

  // --------------------------------------------
  // API Calls
  // --------------------------------------------
  const fetchBreeds = async () => {
    try {
      const response = await axios.get(
        'https://frontend-take-home-service.fetch.com/dogs/breeds',
        { withCredentials: true }
      );
      setBreeds(response.data);
    } catch (error) {
      console.error('Failed to fetch breeds:', error);
    }
  };

  const fetchDogs = async () => {
    try {
      const response = await axios.get(
        'https://frontend-take-home-service.fetch.com/dogs/search',
        {
          params: {
            breeds: selectedBreed ? [selectedBreed] : undefined,
            sort: `breed:${sortOrder}`,
            size: pageSize,
            from: (currentPage - 1) * pageSize,
          },
          withCredentials: true,
        }
      );
      const dogIds = response.data.resultIds;
      setTotalResults(response.data.total);

      const detailsRes = await axios.post<Dog[]>(
        'https://frontend-take-home-service.fetch.com/dogs',
        dogIds,
        { withCredentials: true }
      );
      const fetchedDogs = detailsRes.data;
      setDogs(fetchedDogs);

      // Filter out invalid ZIP codes before fetching locations
      const uniqueZips = Array.from(new Set(fetchedDogs.map((d) => d.zip_code)))
        .filter(zip => zip && zip.trim() !== '');
      await fetchLocationsForZips(uniqueZips);
    } catch (error) {
      console.error('Failed to fetch dogs:', error);
    }
  };

  // Fetch location data for an array of ZIP codes and merge into zipToLocation.
  const fetchLocationsForZips = async (zips: string[]) => {
    if (!zips.length) return;
    try {
      const response = await axios.post<(Location | null)[]>(
        'https://frontend-take-home-service.fetch.com/locations',
        zips,
        { withCredentials: true }
      );
      const newLocations = response.data;
      const locationMap: Record<string, Location> = {};
      
      newLocations.forEach((loc) => {
        // Add null check for location objects
        if (loc && loc.zip_code) {
          locationMap[loc.zip_code] = loc;
        }
      });
      
      setZipToLocation((prev) => ({ ...prev, ...locationMap }));
    } catch (error) {
      console.error('Failed to fetch location data for zips:', error);
    }
  };

  const generateMatch = async () => {
    if (favorites.length === 0) {
      alert('Please select at least one dog to generate a match.');
      return;
    }
    try {
      setShowFavorites(false);
      const response = await axios.post<Match>(
        'https://frontend-take-home-service.fetch.com/dogs/match',
        favorites.map((dog) => dog.id),
        { withCredentials: true }
      );
      const matchId = response.data.match;
      const dogDetails = await axios.post<Dog[]>(
        'https://frontend-take-home-service.fetch.com/dogs',
        [matchId],
        { withCredentials: true }
      );
      const matchedDog = dogDetails.data[0];
      setMatch(matchedDog);
      await fetchLocationsForZips([matchedDog.zip_code]);
    } catch (error) {
      console.error('Failed to generate match:', error);
    }
  };

  const toggleFavorite = (dog: Dog) => {
    setFavorites((prev) =>
      prev.some((d) => d.id === dog.id)
        ? prev.filter((d) => d.id !== dog.id)
        : [...prev, dog]
    );
  };

  // --------------------------------------------
  // Handlers
  // --------------------------------------------
  const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBreed(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const closeMatchModal = () => {
    setMatch(null);
  };

  // For pagination display
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = startIndex + dogs.length - 1;

  const isSingleBreedSelected = !!selectedBreed;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* FAVORITES PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-4 z-50 transform transition-transform ${
          showFavorites ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Favorites ({favorites.length})</h2>
          <button
            onClick={() => setShowFavorites(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        {favorites.length > 0 ? (
          <>
            <div className="space-y-4 overflow-y-auto h-3/4">
              {favorites.map((dog) => {
                const loc = zipToLocation[dog.zip_code];
                return (
                  <div key={dog.id} className="border p-3 rounded">
                    <img
                      src={dog.img}
                      alt={dog.name}
                      className="w-full h-32 object-cover mb-2"
                    />
                    <h3 className="font-semibold">{dog.name}</h3>
                    <p className="text-sm">Breed: {dog.breed}</p>
                    <p className="text-sm">Age: {dog.age}</p>
                    <p className="text-sm">
                      Zip: {dog.zip_code}
                      {loc && (
                        <span>
                          {' '}
                          | {loc.city}, {loc.state}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => toggleFavorite(dog)}
                      className="mt-2 text-sm bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={generateMatch}
              className="w-full mt-4 bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
            >
              Generate Match
            </button>
          </>
        ) : (
          <p className="text-gray-500 text-center mt-4">No favorites selected</p>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl w-full mx-auto p-4 relative flex-1">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="pt-4 pb-2 px-2">
            <h1 className="text-3xl font-bold text-center mb-4">Search Dogs</h1>
            {/* Top Row: Filter & Logout */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
              {/* Left: Select Breed */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Select Breed:</label>
                  <select
                    value={selectedBreed}
                    onChange={handleBreedChange}
                    className="p-2 border rounded"
                  >
                    <option value="">All Breeds</option>
                    {breeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Right: Logout button */}
              <div className="flex-shrink-0">
                <Logout />
              </div>
            </div>
            {/* Second Row: Other controls */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <label className="font-medium">Sort Order:</label>
                <button
                  onClick={toggleSortOrder}
                  disabled={isSingleBreedSelected}
                  title={
                    isSingleBreedSelected
                      ? 'Single breed selected'
                      : 'Press the button to change the order'
                  }
                  className={`px-4 py-2 rounded text-white ${
                    isSingleBreedSelected
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
              <button
                onClick={() => setShowFavorites(true)}
                disabled={favorites.length === 0}
                title={favorites.length === 0 ? 'No dogs in Favorites yet' : ''}
                className={`px-4 py-2 rounded text-white ${
                  favorites.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                View Favorites ({favorites.length})
              </button>
              <button
                onClick={generateMatch}
                disabled={favorites.length < 1}
                title={favorites.length < 1 ? 'Please select 1 or more dogs' : ''}
                className={`px-4 py-2 rounded text-white ${
                  favorites.length < 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Generate Match
              </button>
            </div>
          </div>
        </div>

        {/* DOG GRID & PAGINATION */}
        <div className="mt-4 px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => {
              const loc = zipToLocation[dog.zip_code];
              return (
                <div
                  key={dog.id}
                  className="border rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={dog.img}
                    alt={dog.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{dog.name}</h3>
                    <p>
                      <strong>Breed:</strong> {dog.breed}
                    </p>
                    <p>
                      <strong>Age:</strong> {dog.age} years
                    </p>
                    <p>
                      <strong>Zip Code:</strong> {dog.zip_code}
                    </p>
                    {loc ? (
                      <p>
                        <strong>Location:</strong> {loc.city}, {loc.state}
                      </p>
                    ) : (
                      <p>
                        <strong>Location:</strong> Loading...
                      </p>
                    )}
                    <button
                      onClick={() => toggleFavorite(dog)}
                      className={`mt-3 w-full py-2 rounded ${
                        favorites.some((d) => d.id === dog.id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {favorites.some((d) => d.id === dog.id)
                        ? 'Remove Favorite'
                        : 'Add Favorite'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-gray-600">
              Showing {startIndex}–{endIndex} of {totalResults}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage * pageSize >= totalResults}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MATCH MODAL OVERLAY */}
      {match && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg max-w-md animate-pop-in">
            <h2 className="text-2xl font-bold mb-4">Your Perfect Match!</h2>
            <img
              src={match.img}
              alt={match.name}
              className="w-full h-48 object-cover mb-4 rounded-lg"
            />
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {match.name}
              </p>
              <p>
                <strong>Breed:</strong> {match.breed}
              </p>
              <p>
                <strong>Age:</strong> {match.age} years
              </p>
              <p>
                <strong>Zip Code:</strong> {match.zip_code}
              </p>
              {zipToLocation[match.zip_code] && (
                <p>
                  <strong>Location:</strong> {zipToLocation[match.zip_code].city},{' '}
                  {zipToLocation[match.zip_code].state}
                </p>
              )}
            </div>
            <button
              onClick={closeMatchModal}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
