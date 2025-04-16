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

// Updated form schema with new fields
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["university", "startup", "corporate", "government", "other"]),
  department: z.string().optional(),
  supervisor: z.string().min(2, "Supervisor/Contact is required"),
  duration: z.string().min(2, "Duration is required"),
  compensationType: z.enum(["paid", "unpaid"]),
  compensationAmount: z.string().optional(),
  responseType: z.enum(["in-app", "email", "site"]),
  description: z.string().min(20, "Description must be at least 20 characters"),
  deadline: z.string().min(1, "Deadline is required"),
  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters"),
  skills: z.string().min(2, "Skills are required"),
  location: z.string().optional(),
  applicationLink: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
  contactEmail: z.string().email("Please enter a valid email").optional(),
});

interface AddInternshipModalProps {
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function AddInternshipModal({
  onClose,
  onSubmitSuccess,
}: AddInternshipModalProps) {
  const { user, name } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: undefined,
      department: "",
      supervisor: "",
      duration: "",
      compensationType: "paid",
      compensationAmount: "",
      responseType: "in-app",
      description: "",
      deadline: "",
      requirements: "",
      skills: "",
      location: "",
      applicationLink: "",
      contactEmail: "",
    },
  });

  const compensationType = form.watch("compensationType");
  const responseType = form.watch("responseType");

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (!user) {
        throw new Error("You must be logged in to add an internship");
      }

      const skillsArray = data.skills.split(",").map((skill) => skill.trim());

      const internshipData = {
        title: data.title,
        type: data.type,
        department: data.department || null,
        professor: data.type === "university" ? data.supervisor : null,
        company: ["startup", "corporate", "other"].includes(data.type)
          ? data.supervisor
          : null,
        organization: data.type === "government" ? data.supervisor : null,
        duration: data.duration,
        isPaid: data.compensationType === "paid",
        stipend:
          data.compensationType === "paid"
            ? data.compensationAmount || null
            : null,
        equity:
          data.type === "startup" ? data.compensationAmount || null : null,
        deadline: data.deadline,
        responseType: data.responseType,
        contactEmail: data.responseType === "email" ? data.contactEmail : null,
        applicationLink:
          data.responseType === "site" ? data.applicationLink : null,
        description: data.description,
        requirements: data.requirements,
        skills: skillsArray,
        location: data.location || null,
        createdAt: serverTimestamp(),
        createdBy: name || user?.uid,
      };

      await addDoc(collection(FIREBASE_DB, "internships"), internshipData);

      form.reset();
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Error adding internship:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internship Title*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Research Assistant in AI Lab"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internship Type*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department/Field</FormLabel>
                <FormControl>
                  <Input placeholder="Computer Science" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supervisor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor/Contact*</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. Smith or company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration*</FormLabel>
                <FormControl>
                  <Input placeholder="3 months or Summer 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="paid" />
                      </FormControl>
                      <FormLabel className="font-normal">Paid</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="unpaid" />
                      </FormControl>
                      <FormLabel className="font-normal">Unpaid</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {compensationType === "paid" && (
            <FormField
              control={form.control}
              name="compensationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compensation Amount*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="$1,500/month or specify amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Python, Machine Learning, Research"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Separate skills with commas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="On-campus, Remote, or City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responseType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Response Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="in-app" />
                      </FormControl>
                      <FormLabel className="font-normal">In-app</FormLabel>
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
                        <RadioGroupItem value="email" />
                      </FormControl>
                      <FormLabel className="font-normal">Email</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="site" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        External Link
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {responseType === "site" && (
            <FormField
              control={form.control}
              name="applicationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/apply" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {responseType === "email" && (
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the internship, research focus, or project details"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Minimum GPA, required courses, technical skills, etc."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Submitting..."
              : "Submit Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
