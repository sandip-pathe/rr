"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CustomModal from "@/components/ModalWrapper";
import { useAuth } from "@/app/auth/AuthContext";

export default function ApplyInternshipModal({
  isOpen,
  onClose,
  internship,
}: {
  isOpen: boolean;
  onClose: () => void;
  internship: {
    id: string;
    title: string;
    type: string;
    organization: string;
  };
}) {
  const { user, loading, name } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: "",
    relevantCourses: "",
    availability: "",
    shareProfile: true,
  });
  const userId = user?.uid;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!user) {
      console.error("User not authenticated");
      setIsSubmitting(false);
      return;
    }
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Application submitted:", {
        internshipId: internship.id,
        userId,
        ...formData,
      });

      // Close modal and optionally refresh data
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Application error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {`Apply for ${internship.title}`}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {`Applying to ${internship.organization}'s ${internship.type} position`}
          </p>
          <div>
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Explain why you're a good fit for this position..."
              required
              className="min-h-[150px]"
            />
          </div>

          <div>
            <Label htmlFor="relevantCourses">Relevant Courses/Skills *</Label>
            <Textarea
              id="relevantCourses"
              name="relevantCourses"
              value={formData.relevantCourses}
              onChange={handleChange}
              placeholder="List courses you've taken or skills you have that relate to this position"
              required
            />
          </div>

          <div>
            <Label htmlFor="availability">Availability *</Label>
            <Input
              id="availability"
              name="availability"
              type="text"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g., Summer 2024, 20 hours/week during semester"
              required
            />
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

          {formData.shareProfile && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <p className="text-sm">
                Your profile will be shared:{" "}
                <a
                  href={`/dashboard/people/${userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View my profile
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
}
