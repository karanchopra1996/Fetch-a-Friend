import {Dog}  from '../pages/search';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Dog[];
  onRemoveFavorite: (id: string) => void;
  onGenerateMatch: () => void;
}

const FavoritesModal = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onGenerateMatch,
}: FavoritesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Favorites</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Favorites List */}
        {favorites.length === 0 ? (
          <p className="text-gray-500">No favorites selected yet.</p>
        ) : (
          <>
            <div className="space-y-4">
              {favorites.map((dog) => (
                <div key={dog.id} className="border p-4 rounded">
                  <img
                    src={dog.img}
                    alt={dog.name}
                    className="w-full h-32 object-cover mb-2 rounded"
                  />
                  <p><strong>Name:</strong> {dog.name}</p>
                  <p><strong>Breed:</strong> {dog.breed}</p>
                  <button
                    onClick={() => onRemoveFavorite(dog.id)}
                    className="mt-2 bg-red-500 text-white p-1 px-2 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            {/* Generate Match Button */}
            <button
              onClick={onGenerateMatch}
              disabled={favorites.length === 0}
              className="mt-4 w-full bg-purple-500 text-white p-2 rounded disabled:bg-gray-400"
            >
              Generate Match ({favorites.length})
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesModal;