"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FiBriefcase, FiUsers, FiEdit, FiCheck, FiX } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Checkbox } from "@/components/ui/checkbox";
import { Internship } from "@/types/Internship";

interface Application {
  id: string;
  userId: string;
  userName: string;
  coverLetter: string;
  status: "open" | "closed";
  submittedAt: Date;
}

export default function ManageInternships() {
  const { user, name } = useAuth();
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<string | null>(
    null
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "open" as "open" | "closed",
  });

  // Fetch internships created by the current user
  useEffect(() => {
    const fetchInternships = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const internshipsRef = collection(FIREBASE_DB, "internships");
        const q = query(internshipsRef, where("createdId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const internshipsData: Internship[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          internshipsData.push({
            id: doc.id,
            title: data.title,
            type: data.type,
            description: data.description,
            deadline: data.deadline,
            status: data.status,
            createdAt: data.createdAt.toDate(),
            createdBy: data.createdBy,
            createdId: data.createdId,
            duration: data.duration,
            compensationType: data.compensationType,
            compensation: data.compensation,
            requirements: data.requirements,
            skills: data.skills,
          });
        });

        setInternships(internshipsData);
        if (internshipsData.length > 0 && !selectedInternship) {
          setSelectedInternship(internshipsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching internships:", error);
        toast({
          title: "Error",
          description: "Failed to fetch internships",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [user, selectedInternship, toast]);

  // Fetch applications for the selected internship
  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedInternship) return;

      try {
        setLoading(true);
        const applicationsRef = collection(
          FIREBASE_DB,
          `internships/${selectedInternship}/applications`
        );
        const querySnapshot = await getDocs(applicationsRef);

        const applicationsData: Application[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          applicationsData.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            coverLetter: data.coverLetter,
            status: data.status || "pending",
            submittedAt: data.submittedAt.toDate(),
          });
        });

        setApplications(applicationsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [selectedInternship, toast]);

  // Set edit form when editing an internship
  useEffect(() => {
    if (editingInternship) {
      setEditForm({
        title: editingInternship.title,
        description: editingInternship.description,
        deadline: editingInternship.deadline,
        status: editingInternship.status, // Set status directly
      });
    }
  }, [editingInternship]);

  const handleUpdateInternship = async () => {
    if (!editingInternship) return;

    try {
      const internshipRef = doc(
        FIREBASE_DB,
        "internships",
        editingInternship.id
      );
      await updateDoc(internshipRef, {
        title: editForm.title,
        description: editForm.description,
        deadline: editForm.deadline,
        status: editForm.status, // Update status instead of isActive
      });

      setInternships(
        internships.map((i) =>
          i.id === editingInternship.id ? { ...i, ...editForm } : i
        )
      );
      setEditingInternship(null);

      toast({
        title: "Success",
        description: "Internship updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating internship:", error);
      toast({
        title: "Error",
        description: "Failed to update internship",
        variant: "destructive",
      });
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: Application["status"]
  ) => {
    if (!selectedInternship) return;

    try {
      const applicationRef = doc(
        FIREBASE_DB,
        `internships/${selectedInternship}/applications`,
        applicationId
      );
      await updateDoc(applicationRef, {
        status: newStatus,
      });

      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInternship = async (internshipId: string) => {
    if (!user?.uid) return;
    try {
      const internshipRef = doc(FIREBASE_DB, "internships", internshipId);
      await updateDoc(internshipRef, {
        isActive: false,
      });

      setInternships(
        internships.filter((internship) => internship.id !== internshipId)
      );
      setSelectedInternship(null);

      toast({
        title: "Internship Deleted",
        description: "The internship has been deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting internship:", error);
      toast({
        title: "Error",
        description: "Failed to delete internship",
        variant: "destructive",
      });
    }
  };

  if (loading && !internships.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading your internships...</p>
      </div>
    );
  }

  if (!internships.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FiBriefcase className="text-gray-400" size={48} />
        <p className="text-gray-500">You haven't created any internships yet</p>
        <Button>Create Your First Internship</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Your Internships</h1>

      <Tabs defaultValue="internships" className="space-y-6">
        <TabsList>
          <TabsTrigger value="internships">
            <FiBriefcase className="mr-2" /> My Internships
          </TabsTrigger>
          <TabsTrigger value="applications" disabled={!selectedInternship}>
            <FiUsers className="mr-2" /> Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internships">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Internship List */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold">Your Internships</h2>
              <div className="space-y-3">
                {internships.map((internship) => (
                  <Card
                    key={internship.id}
                    className={`cursor-pointer transition-colors ${
                      selectedInternship === internship.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedInternship(internship.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {internship.title}
                      </CardTitle>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{internship.type}</Badge>
                        <Badge
                          variant={
                            internships.find((i) => i.id === selectedInternship)
                              ?.status === "open"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {internships.find((i) => i.id === selectedInternship)
                            ?.status === "open"
                            ? "Open"
                            : "Closed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Deadline: {format(new Date(internship.deadline), "PPP")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Internship Details/Edit */}
            <div className="md:col-span-2">
              {editingInternship ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Internship</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <Input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Deadline
                      </label>
                      <Input
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) =>
                          setEditForm({ ...editForm, deadline: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status"
                        checked={editForm.status === "open"}
                        onCheckedChange={(checked) =>
                          setEditForm({
                            ...editForm,
                            status: checked ? "open" : "closed",
                          })
                        }
                      />
                      <label htmlFor="status" className="text-sm font-medium">
                        Open Listing
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingInternship(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateInternship}>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                selectedInternship && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {
                              internships.find(
                                (i) => i.id === selectedInternship
                              )?.title
                            }
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">
                              {
                                internships.find(
                                  (i) => i.id === selectedInternship
                                )?.type
                              }
                            </Badge>
                            <Badge
                              variant={
                                internships.find(
                                  (i) => i.id === selectedInternship
                                )?.status === "open"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {internships.find(
                                (i) => i.id === selectedInternship
                              )?.status === "open"
                                ? "Open"
                                : "Closed"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingInternship(
                              internships.find(
                                (i) => i.id === selectedInternship
                              ) || null
                            )
                          }
                        >
                          <FiEdit className="mr-2" /> Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium">Description</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {
                            internships.find((i) => i.id === selectedInternship)
                              ?.description
                          }
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Deadline</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {format(
                            new Date(
                              internships.find(
                                (i) => i.id === selectedInternship
                              )?.deadline || ""
                            ),
                            "PPPP"
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Applications</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {applications.length} total applications
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          {selectedInternship && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Applications for{" "}
                  {internships.find((i) => i.id === selectedInternship)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FiUsers className="text-gray-400 mb-4" size={32} />
                    <p className="text-gray-500">No applications yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.userName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                internships.find(
                                  (i) => i.id === selectedInternship
                                )?.status === "open"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {internships.find(
                                (i) => i.id === selectedInternship
                              )?.status === "open"
                                ? "Open"
                                : "Closed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(application.submittedAt, "PP")}
                          </TableCell>
                          <TableCell className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateApplicationStatus(
                                  application.id,
                                  "open"
                                )
                              }
                              disabled={application.status === "closed"}
                            >
                              <FiCheck className="mr-2" /> Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateApplicationStatus(
                                  application.id,
                                  "open"
                                )
                              }
                              disabled={application.status === "closed"}
                            >
                              <FiX className="mr-2" /> Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
