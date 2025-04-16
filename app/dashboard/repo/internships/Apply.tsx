"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/app/auth/AuthContext";
import { FiExternalLink, FiAlertCircle } from "react-icons/fi";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { toast } from "sonner";
import { IoClose } from "react-icons/io5";
import { Internship } from "@/types/Internship";

interface ApplicationFormData {
  coverLetter: string;
  relevantCourses: string;
  availability: string;
  shareProfile: boolean;
  resumeUrl: string;
  transcriptUrl: string;
}

export default function ApplyInternshipModal({
  onClose,
  internship,
}: {
  onClose: () => void;
  internship: Internship;
}) {
  const { user, loading: authLoading, name } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: "",
    relevantCourses: "",
    availability: "",
    shareProfile: true,
    resumeUrl: "",
    transcriptUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<ApplicationFormData>>(
    {}
  );
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  useEffect(() => {
    if (internship.deadline) {
      setIsDeadlinePassed(new Date(internship.deadline) < new Date());
    }
  }, [internship.deadline]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof ApplicationFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: Partial<ApplicationFormData> = {};
    if (!formData.coverLetter.trim()) errors.coverLetter = "Required";
    if (!formData.relevantCourses.trim()) errors.relevantCourses = "Required";
    if (!formData.availability.trim()) errors.availability = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (
    file: File,
    type: "resume" | "transcript"
  ) => {
    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress(progress);
      }

      // In a real app, you would upload to Firebase Storage here
      const fakeUrl = `https://example.com/${type}-${Date.now()}-${file.name}`;

      setFormData((prev) => ({
        ...prev,
        [`${type}Url`]: fakeUrl,
      }));

      toast.success("File uploaded successfully", {
        description: `Your ${type} has been uploaded`,
      });
    } catch (error) {
      toast.error("File upload failed", {
        description: "There was an error uploading your file",
      });
      console.error("File upload error:", error);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) {
      toast.error("You must be logged in to apply for internships", {
        description: "Please log in to your account",
      });
      return;
    }
    if (isDeadlinePassed) {
      toast.error("Application deadline has passed", {
        description: "You cannot apply for this internship anymore",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        internshipId: internship.id,
        internshipTitle: internship.title,
        internshipType: internship.type,
        organization: internship.organization,
        userId: user.uid,
        userName: name || "Anonymous",
        status: "submitted",
        submittedAt: serverTimestamp(),
        ...formData,
      };

      // Add to Firestore
      await addDoc(collection(FIREBASE_DB, "applications"), applicationData);

      toast.success("Application submitted successfully", {
        description: "Your application has been submitted",
      });

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to submit application", {
        description: "There was an error submitting your application",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {`Apply for ${internship.title}`}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <IoClose size={24} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {internship.organization && (
              <span className="ml-2">{`• ${internship.organization}`}</span>
            )}
            {internship.organization && (
              <span className="ml-2">{`• ${internship.type}`}</span>
            )}

            {internship.deadline && (
              <span className="ml-2">
                • Deadline: {new Date(internship.deadline).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        {isDeadlinePassed && (
          <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
            <FiAlertCircle className="text-red-500 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">
              The application deadline has passed. Late applications may not be
              considered.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="coverLetter">
              Cover Letter <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Explain why you're a good fit for this position..."
              className="min-h-[150px]"
            />
            {formErrors.coverLetter && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.coverLetter}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="relevantCourses">
                Relevant Courses/Skills <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="relevantCourses"
                name="relevantCourses"
                value={formData.relevantCourses}
                onChange={handleChange}
                placeholder="List courses you've taken or skills you have that relate to this position"
              />
              {formErrors.relevantCourses && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.relevantCourses}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="availability">
                Availability <span className="text-red-500">*</span>
              </Label>
              <Input
                id="availability"
                name="availability"
                type="text"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g., Summer 2024, 20 hours/week during semester"
              />
              {formErrors.availability && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.availability}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Documents</Label>
            <div className="grid gap-4 md:grid-cols-2 mt-2">
              <div className="border rounded-md p-4">
                <Label htmlFor="resume">Resume</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileUpload(e.target.files[0], "resume")
                  }
                  className="mt-2"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="mt-2" />
                )}
                {formData.resumeUrl && (
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <FiExternalLink className="mr-1" />
                    <span>Resume uploaded</span>
                  </div>
                )}
              </div>

              <div className="border rounded-md p-4">
                <Label htmlFor="transcript">Transcript (Optional)</Label>
                <Input
                  id="transcript"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileUpload(e.target.files[0], "transcript")
                  }
                  className="mt-2"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="mt-2" />
                )}
                {formData.transcriptUrl && (
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <FiExternalLink className="mr-1" />
                    <span>Transcript uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shareProfile"
              checked={formData.shareProfile}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  shareProfile: Boolean(checked),
                }))
              }
            />
            <Label htmlFor="shareProfile">
              Share my profile with {internship.organization}
            </Label>
          </div>

          {formData.shareProfile && user?.uid && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <p className="text-sm">
                Your profile will be shared:{" "}
                <a
                  href={`/dashboard/profile/${user.uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  View my profile <FiExternalLink className="ml-1" size={14} />
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isDeadlinePassed}>
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </form>
  );
}
