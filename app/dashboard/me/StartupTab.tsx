import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { MdBusinessCenter } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiExternalLink } from "react-icons/fi";

interface Startup {
  name: string;
  description: string;
  foundedYear: string;
  website?: string;
  status: "active" | "inactive" | "acquired";
}

interface StartupsTabProps {
  startupProjects: Startup[];
  onAddStartup: () => void;
}

export const StartupsTab = ({
  startupProjects = [],
  onAddStartup,
}: StartupsTabProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MdBusinessCenter /> Startup Ventures
        </h2>
        <Button onClick={onAddStartup} className="gap-2">
          <MdBusinessCenter size={18} /> Add Startup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {startupProjects.length > 0 ? (
          startupProjects.map((startup, index) => (
            <Card
              key={index}
              className="bg-[#252525] border-0 hover:bg-[#2e2e2d] transition"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{startup.name}</CardTitle>
                    <CardDescription>
                      Founded in {startup.foundedYear}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      startup.status === "active"
                        ? "default"
                        : startup.status === "inactive"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {startup.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{startup.description}</p>
              </CardContent>
              <CardFooter>
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FiExternalLink size={14} /> Visit Website
                    </Button>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-[#252525] border-0">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <MdBusinessCenter className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No Startup Ventures Yet
              </h3>
              <p className="text-gray-400 mb-4">
                Add your startup projects to showcase your entrepreneurial work
              </p>
              <Button onClick={onAddStartup} className="gap-2">
                <MdBusinessCenter size={18} /> Add Your First Startup
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
