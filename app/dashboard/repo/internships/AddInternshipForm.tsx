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
import CustomModal from "@/components/ModalWrapper";

interface AddInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void; // Optional callback after successful submission
}

export default function AddInternshipModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: AddInternshipModalProps) {
  const form = useForm();

  function onSubmit(data: any) {
    console.log("Form submitted:", data);
    // Here you would typically call your API
    // After successful submission:
    form.reset();
    onClose();
    if (onSubmitSuccess) onSubmitSuccess();
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-lg font-semibold text-white">
            Add New Internship Opportunity
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Fill out the form to list a new internship for students.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internship Title</FormLabel>
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
                  <FormLabel>Internship Type</FormLabel>
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
                  <FormLabel>Supervisor/Contact</FormLabel>
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
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="3 months or Summer 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compensation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compensation</FormLabel>
                  <FormControl>
                    <Input placeholder="$1,500/month or Equity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the internship, research focus, or project details"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include skills required, expected outcomes, and any
                  prerequisites.
                </FormDescription>
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
            <Button type="submit">Submit Opportunity</Button>
          </div>
        </form>
      </Form>
    </CustomModal>
  );
}
