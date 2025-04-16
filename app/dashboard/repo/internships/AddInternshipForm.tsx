"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/app/auth/AuthContext";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { IoClose } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoMdInformationCircle } from "react-icons/io";

const internshipTypes = {
  university: "University Research",
  startup: "Student Startup",
  corporate: "Corporate Partnership",
  government: "Government Program",
  other: "Other",
} as const;

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["university", "startup", "corporate", "government", "other"]),
  department: z.string().optional(),
  supervisor: z.string().optional(),
  founders: z.string().optional(),
  duration: z.string().min(2, "Duration is required"),
  workload: z.enum(["full-time", "part-time", "flexible"]),
  compensationType: z.enum(["paid", "unpaid", "stipend"]),
  compensationAmount: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters"),
  skills: z.string().min(2, "Skills are required"),
  location: z.string().optional(),
  status: z.enum(["open", "closed"]),
  responseType: z.enum(["in-app", "email", "site"]),
  applicationLink: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  contactEmail: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInternshipModalProps {
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function AddInternshipModal({
  onClose,
  onSubmitSuccess,
}: AddInternshipModalProps) {
  const { user, name } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: undefined,
      department: "",
      supervisor: "",
      founders: "",
      duration: "",
      workload: "full-time",
      compensationType: "paid",
      compensationAmount: "",
      deadline: "",
      description: "",
      requirements: "",
      skills: "",
      location: "",
      status: "open",
      responseType: "in-app",
      applicationLink: "",
      contactEmail: "",
    },
  });

  const type = form.watch("type");
  const compensationType = form.watch("compensationType");
  const responseType = form.watch("responseType");

  async function onSubmit(data: FormValues) {
    console.log("Form submission started", data);

    try {
      if (!user) {
        console.error("User not authenticated");
        throw new Error("You must be logged in to add an internship");
      }

      console.log("User authenticated:", user.uid);

      if (responseType === "email" && !data.contactEmail) {
        console.error("Contact email required for email response type");
        form.setError("contactEmail", {
          type: "manual",
          message: "Contact email is required",
        });
        return;
      }

      if (responseType === "site" && !data.applicationLink) {
        console.error("Application link required for site response type");
        form.setError("applicationLink", {
          type: "manual",
          message: "Application link is required",
        });
        return;
      }

      const skillsArray = data.skills.split(",").map((skill) => skill.trim());

      const internshipData = {
        id: "", // Will be set by Firestore
        title: data.title,
        type: data.type,
        department: data.department || null,
        professor: data.type === "university" ? data.supervisor : null,
        company: ["startup", "corporate", "other"].includes(data.type)
          ? data.supervisor
          : null,
        founders: data.type === "startup" ? data.founders : null,
        organization: data.type === "government" ? data.supervisor : null,
        duration: data.duration,
        workload: data.workload,
        compensationType: data.compensationType,
        compensation: data.compensationAmount || null,
        deadline: data.deadline,
        description: data.description,
        requirements: data.requirements,
        skills: skillsArray,
        location: data.location || null,
        createdAt: serverTimestamp(),
        createdBy: name || "Anonymous",
        createdId: user.uid,
        status: data.status,
        responseType: data.responseType,
        contactEmail: data.responseType === "email" ? data.contactEmail : null,
        applyLink: data.responseType === "site" ? data.applicationLink : null,
      };

      console.log("Prepared internship data:", internshipData);

      try {
        const testRef = collection(FIREBASE_DB, "test");
        console.log("Testing Firestore connection...");
        await addDoc(testRef, { test: true });
        console.log("Firestore connection successful");
      } catch (firestoreError) {
        console.error("Firestore connection error:", firestoreError);
        throw new Error("Failed to connect to database");
      }

      console.log("Attempting to add document to internships collection...");

      const docRef = await addDoc(
        collection(FIREBASE_DB, "internships"),
        internshipData
      );

      console.log("Document added successfully with ID:", docRef.id);

      console.log("Form reset successfully");

      onClose();
      if (onSubmitSuccess) {
        console.log("Calling onSubmitSuccess callback");
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error adding internship:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          console.log("Form submission initiated");
          try {
            const isValid = await form.trigger();
            console.log("Form validation result:", isValid);
            if (isValid) {
              console.log("Calling onSubmit handler");
              await onSubmit(form.getValues());
            } else {
              console.log("Form validation failed", form.formState.errors);
            }
          } catch (err) {
            console.error("Form submission error:", err);
          }
        }}
      >
        {form.formState.errors.root && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {form.formState.errors.root.message}
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Add New Internship Opportunity
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Fill out the form to list a new internship for students.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="title">Internship Title*</FormLabel>
                <FormControl>
                  <Input
                    id="title"
                    placeholder="Research Assistant in AI Lab"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type Field */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="type">Internship Type*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="university">
                      University Research
                    </SelectItem>
                    <SelectItem value="startup">Student Startup</SelectItem>
                    <SelectItem value="corporate">
                      Corporate Partnership
                    </SelectItem>
                    <SelectItem value="government">
                      Government Program
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Department Field (conditional) */}
          {type === "university" && (
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="department">Department*</FormLabel>
                  <FormControl>
                    <Input
                      id="department"
                      placeholder="Computer Science"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Founders Field (conditional) */}
          {type === "startup" && (
            <FormField
              control={form.control}
              name="founders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="founders">Founders*</FormLabel>
                  <FormControl>
                    <Input
                      id="founders"
                      placeholder="Student founders names"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Supervisor/Contact Field */}
          <FormField
            control={form.control}
            name="supervisor"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="supervisor">
                  {type === "university"
                    ? "Professor/Supervisor*"
                    : type === "startup" || type === "corporate"
                    ? "Company Name*"
                    : type === "government"
                    ? "Organization Name*"
                    : "Contact Name*"}
                </FormLabel>
                <FormControl>
                  <Input
                    id="supervisor"
                    placeholder={
                      type === "university"
                        ? "Dr. Smith"
                        : type === "government"
                        ? "Organization name"
                        : "Company name"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration Field */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="duration">Duration*</FormLabel>
                <FormControl>
                  <Input
                    id="duration"
                    placeholder="3 months or Summer 2024"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Workload Field */}
          <FormField
            control={form.control}
            name="workload"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="workload">Workload*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger id="workload">
                      <SelectValue placeholder="Select workload" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Compensation Type Field */}
          <FormField
            control={form.control}
            name="compensationType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Compensation Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                    aria-labelledby="compensationType-label"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="paid" id="compensation-paid" />
                      </FormControl>
                      <FormLabel
                        htmlFor="compensation-paid"
                        className="font-normal"
                      >
                        Paid
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="unpaid"
                          id="compensation-unpaid"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="compensation-unpaid"
                        className="font-normal"
                      >
                        Unpaid
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="stipend"
                          id="compensation-stipend"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="compensation-stipend"
                        className="font-normal"
                      >
                        Stipend
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Compensation Amount Field (conditional) */}
          {compensationType !== "unpaid" && (
            <FormField
              control={form.control}
              name="compensationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="compensationAmount">
                    {compensationType === "paid"
                      ? "Salary*"
                      : "Stipend Amount*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="compensationAmount"
                      placeholder={
                        compensationType === "paid"
                          ? "$1,500/month"
                          : "$500 one-time"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Deadline Field */}
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="deadline">Application Deadline*</FormLabel>
                <FormControl>
                  <Input id="deadline" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Skills Field */}
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="skills">Required Skills*</FormLabel>
                <FormControl>
                  <Input
                    id="skills"
                    placeholder="Python, Machine Learning, Research"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Separate skills with commas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Field */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="location">Location</FormLabel>
                <FormControl>
                  <Input
                    id="location"
                    placeholder="On-campus, Remote, or City"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Response Type Field */}
          <FormField
            control={form.control}
            name="responseType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel id="responseType-label">
                  Application Method*
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                    aria-labelledby="responseType-label"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="in-app" id="response-in-app" />
                      </FormControl>
                      <FormLabel
                        htmlFor="response-in-app"
                        className="font-normal"
                      >
                        In-app
                      </FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IoMdInformationCircle size={20} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm text-gray-300">
                              Students will apply directly through the app.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="email" id="response-email" />
                      </FormControl>
                      <FormLabel
                        htmlFor="response-email"
                        className="font-normal"
                      >
                        Email
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="site" id="response-site" />
                      </FormControl>
                      <FormLabel
                        htmlFor="response-site"
                        className="font-normal"
                      >
                        External Link
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Application Link Field (conditional) */}
          {responseType === "site" && (
            <FormField
              control={form.control}
              name="applicationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="applicationLink">
                    Application Link*
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="applicationLink"
                      placeholder="https://example.com/apply"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Email Field (conditional) */}
          {responseType === "email" && (
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contactEmail">Contact Email*</FormLabel>
                  <FormControl>
                    <Input
                      id="contactEmail"
                      placeholder="contact@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="description">Description*</FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the internship, research focus, or project details"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirements Field */}
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="requirements">Requirements*</FormLabel>
              <FormControl>
                <Textarea
                  id="requirements"
                  placeholder="Minimum GPA, required courses, technical skills, etc."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log("Cancel button clicked");
              form.reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            onClick={() => console.log("Submit button clicked")}
          >
            {form.formState.isSubmitting
              ? "Submitting..."
              : "Submit Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
