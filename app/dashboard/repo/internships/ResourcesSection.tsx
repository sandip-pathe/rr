import {
  FiExternalLink,
  FiFileText,
  FiYoutube,
  FiBook,
  FiUsers,
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResourcesSection() {
  const resources = [
    {
      title: "How to Secure Research Positions",
      type: "Guide",
      icon: <FiFileText className="h-5 w-5 text-blue-400" />,
      link: "https://gumroad.com/read/9b9e9bf98e3a7024e4ffea48f9727ba9/BZ2ai5uoO-XTqCtKheNDfw==",
      color: "bg-blue-900/20",
    },
    {
      title: "Building Your Grad School Profile",
      type: "Webinar",
      icon: <FiYoutube className="h-5 w-5 text-red-400" />,
      link: "https://www.youtube.com/watch?v=6mkv6dZYJeI",
      color: "bg-red-900/20",
    },
    {
      title: "CV Templates for Research",
      type: "Template",
      icon: <FiBook className="h-5 w-5 text-green-400" />,
      link: "https://www.overleaf.com/gallery/tagged/cv",
      color: "bg-green-900/20",
    },
    {
      title: "Cold Email Templates",
      type: "Template",
      icon: <FiUsers className="h-5 w-5 text-purple-400" />,
      link: "https://hunter.io/templates",
      color: "bg-purple-900/20",
    },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Career Resources</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {resources.map((resource, index) => (
          <div
            key={index}
            className={`${resource.color} p-4 rounded-lg hover:bg-opacity-50 transition-all cursor-pointer`}
            onClick={() => window.open(resource.link, "_blank")}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/50">
                {resource.icon}
              </div>
              <div>
                <h3 className="font-medium text-white">{resource.title}</h3>
                <p className="text-sm text-gray-400">{resource.type}</p>
              </div>
              <FiExternalLink className="ml-auto h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
