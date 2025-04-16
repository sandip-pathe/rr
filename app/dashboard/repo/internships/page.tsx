"use client";

import { DiscoverTabs } from "../Tabs";
import InternshipCard from "./InternshipCard";
import ResourcesSection from "./ResourcesSection";
import Layout from "@/components/Layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiRefreshCw,
  FiPlus,
  FiBriefcase,
  FiX,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import AddInternshipModal from "./AddInternshipForm";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Internship, InternshipType } from "@/types/Internship";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Modal from "@/components/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function InternshipsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    compensation: "",
    status: "open",
  });

  const router = useRouter();

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const internshipsRef = collection(FIREBASE_DB, "internships");
      const q = query(internshipsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const internshipsData: Internship[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        internshipsData.push({
          id: doc.id,
          title: data.title,
          type: data.type,
          department: data?.department,
          professor: data?.professor,
          company: data?.company,
          founders: data?.founders,
          organization: data?.organization,
          location: data?.location,
          duration: data.duration,
          workload: data?.workload,
          compensationType: data.compensationType,
          compensation: data.compensation,
          deadline: data.deadline,
          description: data.description,
          requirements: data.requirements,
          skills: data.skills,
          createdAt: data.createdAt.toDate(),
          createdBy: data?.createdBy,
          createdId: data.createdId,
          contactEmail: data?.contactEmail,
          applyLink: data?.applyLink,
          status: data.status || "open",
        });
      });

      setInternships(internshipsData);
      setFilteredInternships(internshipsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch internships");
      setLoading(false);
      console.error("Error fetching internships:", err);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, internships]);

  const applyFilters = () => {
    let result = [...internships];

    // Filter by status
    if (filters.status) {
      result = result.filter((i) => i.status === filters.status);
    }

    // Filter by type - now compares enum values
    if (filters.type) {
      result = result.filter((i) => i.type === filters.type);
    }

    // Filter by compensation
    if (filters.compensation) {
      result = result.filter(
        (i) => i.compensationType === filters.compensation
      );
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          (i.description && i.description.toLowerCase().includes(term)) ||
          (i.skills && i.skills.join(" ").toLowerCase().includes(term)) ||
          (i.professor && i.professor.toLowerCase().includes(term)) ||
          (i.company && i.company.toLowerCase().includes(term))
      );
    }

    setFilteredInternships(result);
  };

  const handleSuccess = () => {
    fetchInternships();
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      compensation: "",
      status: "open",
    });
    setSearchTerm("");
  };

  const getTypeCount = (type: InternshipType) => {
    return internships.filter((i) => i.type === type).length;
  };

  if (loading) {
    return (
      <Layout>
        <DiscoverTabs />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 m-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[60px] w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <DiscoverTabs />
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={fetchInternships}
            className="ml-4 bg-blue-200 text-gray-900 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <DiscoverTabs />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 m-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters Bar */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search internships by title, skills, or professor..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  onClick={fetchInternships}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white flex items-center gap-2"
                >
                  <FiRefreshCw size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Status Filter */}
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters({ ...filters, type: value as InternshipType })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="university">
                      University Research &nbsp;(&nbsp;
                      {getTypeCount("university")}
                      &nbsp;)
                    </SelectItem>
                    <SelectItem value="startup">
                      Student Startup &nbsp;(&nbsp;{getTypeCount("startup")}
                      &nbsp;)
                    </SelectItem>
                    <SelectItem value="corporate">
                      Corporate Partnership &nbsp;(&nbsp;
                      {getTypeCount("corporate")}&nbsp;)
                    </SelectItem>
                    <SelectItem value="government">
                      Government Program &nbsp;(&nbsp;
                      {getTypeCount("government")}&nbsp;)
                    </SelectItem>
                    <SelectItem value="other">
                      Other &nbsp;(&nbsp;{getTypeCount("other")}&nbsp;)
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Compensation Filter */}
                <Select
                  value={filters.compensation}
                  onValueChange={(value) =>
                    setFilters({ ...filters, compensation: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Compensation" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="stipend">Stipend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {(filters.type ||
                filters.compensation ||
                filters.status !== "open") && (
                <div className="flex flex-wrap gap-2">
                  {filters.status !== "open" && (
                    <Badge className="bg-purple-900 hover:bg-purple-800 text-purple-100">
                      Status: {filters.status}
                      <button
                        onClick={() =>
                          setFilters({ ...filters, status: "open" })
                        }
                        className="ml-2 hover:text-purple-300"
                      >
                        <FiX size={14} />
                      </button>
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge className="bg-blue-900 hover:bg-blue-800 text-blue-100">
                      Type: {filters.type}
                      <button
                        onClick={() => setFilters({ ...filters, type: "" })}
                        className="ml-2 hover:text-blue-300"
                      >
                        <FiX size={14} />
                      </button>
                    </Badge>
                  )}
                  {filters.compensation && (
                    <Badge className="bg-green-900 hover:bg-green-800 text-green-100">
                      {filters.compensation === "paid" ? (
                        <>
                          <FiDollarSign size={14} className="mr-1" />
                          Paid
                        </>
                      ) : filters.compensation === "stipend" ? (
                        "Stipend"
                      ) : (
                        "Unpaid"
                      )}
                      <button
                        onClick={() =>
                          setFilters({ ...filters, compensation: "" })
                        }
                        className="ml-2 hover:text-green-300"
                      >
                        <FiX size={14} />
                      </button>
                    </Badge>
                  )}
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Internship Cards Grid - 2 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInternships.length > 0 ? (
              filteredInternships.map((i) => (
                <InternshipCard key={i.id} internship={i} />
              ))
            ) : (
              <div className="md:col-span-2">
                <Card className="bg-gray-800 border-gray-700 p-6 text-center">
                  <p className="text-gray-400">
                    No internships match your filters
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="text-white"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-blue-200 hover:bg-blue-700"
                    >
                      Add New Internship
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Internship Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 border-none text-white gap-2"
              >
                <FiPlus className="text-yellow-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Add Opportunity
                </CardTitle>
              </Button>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400 text-sm gap-2 flex items-center">
                <span>
                  Professors and startups can list new internship opportunities
                  here
                </span>
                <button
                  onClick={() => {
                    router.push("/manage");
                  }}
                  className="text-blue-400 hover:underline hover:text-blue-300"
                >
                  Manage Internships
                </button>
              </CardDescription>
            </CardContent>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <div className="flex flex-col h-full flex-1 overflow-y-auto p-4">
                <AddInternshipModal
                  onClose={() => setIsModalOpen(false)}
                  onSubmitSuccess={handleSuccess}
                />
              </div>
            </Modal>
          </Card>

          {/* Internship Stats */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FiBriefcase className="text-blue-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Internship Stats
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-row justify-between items-baseline">
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-medium">
                  {internships.length}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400">Open</span>
                <span className="text-white font-medium">
                  {internships.filter((i) => i.status === "open").length}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400">Closed</span>
                <span className="text-white font-medium">
                  {internships.filter((i) => i.status === "closed").length}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400">Paid</span>
                <span className="text-white font-medium">
                  {
                    internships.filter((i) => i.compensationType === "paid")
                      .length
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-purple-400" size={20} />
                <CardTitle className="text-white text-lg">
                  Upcoming Deadlines
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {internships
                .filter((i) => i.status === "open")
                .sort(
                  (a, b) =>
                    new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime()
                )
                .slice(0, 5)
                .map((internship) => (
                  <div
                    key={internship.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded"
                  >
                    <span className="text-white text-sm truncate">
                      {internship.title}
                    </span>
                    <span className="text-gray-400 text-xs whitespace-nowrap">
                      {format(new Date(internship.deadline), "MMM d")}
                    </span>
                  </div>
                ))}
              {internships.filter((i) => i.status === "open").length === 0 && (
                <p className="text-gray-400 text-sm">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>

          {/* Resources Section */}
          <ResourcesSection />
        </div>
      </div>
    </Layout>
  );
}
