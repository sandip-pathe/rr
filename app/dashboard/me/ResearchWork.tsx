import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/AuthContext";
import { MdScience } from "react-icons/md";
import { Button } from "@/components/ui/button";

interface ResearchItem {
  title: string;
  type: string;
  date: string;
  reads: number;
  citations: number;
  authors?: Author[];
  authorIds?: string[];
  abstract: string;
  doi: string;
}

interface Author {
  name: string;
  id: string;
}

interface ResearchWorkProps {
  userId: string;
}

const ResearchWork: React.FC<ResearchWorkProps> = ({ userId }) => {
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const fetchResearchWorks = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(FIREBASE_DB, "work"),
          where("authorIds", "array-contains", userId) // Works because it's a primitive array
        );
        const querySnapshot = await getDocs(q);

        const researchData = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            ...data,
            date: data.date?.seconds
              ? new Date(data.date.seconds * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown Date",
          } as ResearchItem;
        });

        setResearchItems(researchData);
      } catch (error) {
        console.error("Error fetching research works:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResearchWorks();
  }, [userId]);

  return (
    <Card className="bg-[#252525] border-0">
      <CardHeader>
        <h3 className="font-semibold text-xl">Works</h3>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-5">
            <div className="animate-spin border-4 border-gray-300 border-t-transparent rounded-full w-10 h-10"></div>
          </div>
        ) : researchItems.length === 0 ? (
          <Card className="col-span-full bg-[#252525] border-0">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <MdScience className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No Research Work Found
              </h3>
              <p className="text-gray-400 mb-4">
                Not added any research work yet. Click the button below to add
                your first project.
              </p>
              <Button className="gap-2">
                <MdScience size={18} /> Add Your first Research Work
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul>
            {researchItems.map((item, index) => (
              <div
                key={index}
                className="mb-8 p-5 border border-gray-700 rounded-lg bg-[#1e1e1e]"
              >
                <p className="text-green-500 text-sm">Recently Added</p>
                <h2 className="text-xl font-bold py-2">{item.title}</h2>

                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="bg-green-300 text-green-950 font-semibold px-3 py-1 rounded">
                    New
                  </span>
                  <span className="bg-cyan-300 text-green-950 font-semibold px-3 py-1 rounded">
                    {item.type}
                  </span>
                  <span className="text-gray-400">{item.date}</span>
                  <span className="text-gray-300 italic">Play Store</span>
                </div>

                <p className="text-gray-300 mt-4 text-sm">{item.abstract}</p>

                <div className="mt-4">
                  <p className="text-blue-400 text-sm">
                    <span className="font-semibold text-white">DOI: </span>
                    <a
                      href={`https://doi.org/${item.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.doi}
                    </a>
                  </p>
                </div>

                <div className="flex flex-wrap mt-4 gap-3">
                  {item.authors?.map((author, index) => (
                    <span key={index} className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage />
                        <AvatarFallback className="bg-white text-[#252525] font-bold">
                          {author?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-300 text-sm">{author?.name}</p>
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-5 text-sm">
                  <span className="border border-cyan-300 rounded-full px-3 py-1 cursor-pointer text-white hover:bg-cyan-300 hover:text-[#252525] transition">
                    Request Full Text
                  </span>
                  <span className="text-gray-400">Like · Save · Recommend</span>
                </div>
              </div>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="text-center">
        {researchItems.length > 0 && (
          <p
            onClick={() => {
              router.push(`/dashboard/repo`);
            }}
            className="cursor-pointer text-blue-400 hover:underline"
          >
            View All Research
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResearchWork;
