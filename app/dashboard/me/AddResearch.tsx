"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import DatePickerShadCN from "@/components/DatePicker";
import { FormFieldType } from "../../../enum/FormFieldTypes";
import { useAuth } from "@/app/auth/AuthContext";
import { MdCloudUpload } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { toast } from "sonner";

// Constants
const WORK_TYPES = [
  "Article",
  "Paper",
  "Conference Paper",
  "White Paper",
  "Patent",
  "Book",
  "Book Chapter",
  "Journal",
  "Magazine",
  "Thesis",
  "Dissertation",
  "Report",
  "Presentation",
  "Poster",
  "Project",
  "Software Project",
  "Hardware Project",
  "App",
  "Website",
  "Dataset",
  "Preprint",
  "Technical Documentation",
];

interface User {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
}

interface WorkData {
  type: string;
  title: string;
  description: string;
  authors: Array<{
    id: string;
    name: string;
    email?: string;
    photoURL?: string;
  }>;
  date: Date;
  publishedIn: string;
  publisher: string;
  location: string;
  edition: string;
  doi: string;
  reads: number;
  citations: number;
  futureScope: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email?: string;
    photoURL?: string;
  };
  updatedAt?: Date;
}

interface Props {
  onClick: () => void;
}

const AddWork: React.FC<Props> = ({ onClick }) => {
  const { user, name } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<WorkData>({
    defaultValues: {
      type: "",
      title: "",
      description: "",
      authors: [],
      date: new Date(),
      publishedIn: "",
      publisher: "",
      location: "",
      edition: "",
      doi: "",
      reads: 0,
      citations: 0,
      futureScope: "",
      createdAt: new Date(),
      createdBy: {
        id: user?.uid || "",
        name: name || "",
      },
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(FIREBASE_DB, "users");
        const usersSnap = await getDocs(usersRef);
        const usersList = usersSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().displayName || "Unknown User",
          email: doc.data().email,
          photoURL: doc.data().photoURL,
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load user list");
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (data: WorkData) => {
    setIsLoading(true);
    try {
      // Prepare author data
      const selectedAuthors = data.authors
        .map((author) => {
          const foundUser = users.find((u) => u.id === author.id);
          return foundUser
            ? {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                photoURL: foundUser.photoURL,
              }
            : null;
        })
        .filter(Boolean);

      // Create authorIds mapping for easy querying
      const authorIds = selectedAuthors.reduce((acc, author) => {
        if (author) {
          acc[author.id] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);

      // Prepare complete work data
      const workData = {
        ...data,
        authors: selectedAuthors,
        authorIds,
        createdAt: new Date(),
        createdBy: {
          id: user?.uid || "",
          name: name || "",
          email: user?.email,
          photoURL: user?.photoURL,
        },
        updatedAt: new Date(),
      };

      // Save to Firestore
      await setDoc(doc(FIREBASE_DB, "work", crypto.randomUUID()), workData);

      // Reset form and close modal
      form.reset();
      toast.success("Work added successfully!");
      onClick();
    } catch (error) {
      console.error("Error adding work:", error);
      toast.error("Failed to add work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 flex-1 bg-black p-8 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <IoIosClose size={28} />
        </button>

        <h1 className="text-2xl font-bold mb-6">Add Your Work</h1>

        {/* Work Type */}
        <div className="space-y-2">
          <h3 className="font-semibold">Work Type</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SEARCHABLE_SELECT}
            name="type"
            placeholder="Select work type"
            options={WORK_TYPES}
            allowNewOptions={false}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="font-semibold">Title</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="title"
            placeholder="Enter title of your work"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-semibold">Description / Abstract</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="description"
            placeholder="Enter a brief description"
          />
        </div>

        {/* Publication Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="publishedIn"
            placeholder="Publication venue (e.g., IEEE, ArXiv)"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="publisher"
            placeholder="Publisher or Institution"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="location"
            placeholder="Location (if applicable)"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="edition"
            placeholder="Edition (if applicable)"
          />
        </div>

        {/* Authors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Authors</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            name="authors"
            placeholder="Select co-authors"
            options={users}
            optionKey="id"
            optionLabel="name"
          />
        </div>

        {/* Date and DOI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Publication Date</h3>
            <DatePickerShadCN
              date={form.watch("date")}
              setDate={(date) => form.setValue("date", date as Date)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">DOI / Link</h3>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="doi"
              placeholder="Enter DOI, GitHub link, or URL"
            />
          </div>
        </div>

        {/* File Upload Placeholder */}
        <div className="space-y-2">
          <h3 className="font-semibold">File</h3>
          <div className="border-gray-600 flex flex-col gap-2 h-[150px] items-center justify-center rounded-md border-2 border-dashed text-sm bg-gray-900/50">
            <MdCloudUpload className="w-8 h-8 text-gray-400" />
            <p className="text-gray-300">Upload file (coming soon)</p>
            <p className="text-gray-500 text-xs">Max file size: 10MB</p>
          </div>
        </div>

        {/* Future Scope */}
        <div className="space-y-2">
          <h3 className="font-semibold">Future Scope</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="futureScope"
            placeholder="What's next for this work?"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-wrap gap-4 pt-4">
          <SubmitButton
            className="w-full md:w-auto px-8 py-3"
            isLoading={isLoading}
          >
            Add Work
          </SubmitButton>
          <button
            type="button"
            onClick={onClick}
            className="text-gray-400 hover:text-white transition-colors text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </Form>
  );
};

export default AddWork;
