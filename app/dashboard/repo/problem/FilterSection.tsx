import { FiFilter, FiX } from "react-icons/fi";

export default function FiltersSection({
  selectedCategories,
  setSelectedCategories,
}: {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}) {
  const allCategories = [
    "AI/ML",
    "Blockchain",
    "Healthcare",
    "Education",
    "Agriculture",
    "Sustainability",
    "Finance",
    "IoT",
  ];

  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  return (
    <div className="bg-gray-800 border-gray-700 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiFilter /> Filters
      </h2>

      {selectedCategories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Selected Categories</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium mb-2">All Categories</h3>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                if (!selectedCategories.includes(category)) {
                  setSelectedCategories([...selectedCategories, category]);
                }
              }}
              disabled={selectedCategories.includes(category)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                selectedCategories.includes(category)
                  ? "bg-blue-100 text-blue-800 cursor-default"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
