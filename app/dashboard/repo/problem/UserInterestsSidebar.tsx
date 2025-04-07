import { FiHeart, FiUsers } from "react-icons/fi";

export default function UserInterestsSidebar() {
  const userInterests = [
    { id: 1, title: "AI-based Plant Disease Detection", interestCount: 24 },
    { id: 3, title: "Smart Water Management System", interestCount: 15 },
  ];

  return (
    <div className="bg-gray-800 border-gray-700 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiHeart className="text-red-500" /> Your Interests
      </h2>

      {userInterests.length > 0 ? (
        <ul className="space-y-3">
          {userInterests.map((problem) => (
            <li key={problem.id} className="border-b pb-3 last:border-0">
              <h3 className="font-medium">{problem.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <FiUsers /> {problem.interestCount} interested
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">
          You haven't shown interest in any problems yet
        </p>
      )}

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium">Team Matching</h3>
        <p className="text-xs text-gray-500 mt-1">
          When multiple users show interest in the same problem, we'll suggest
          forming a team.
        </p>
      </div>
    </div>
  );
}
