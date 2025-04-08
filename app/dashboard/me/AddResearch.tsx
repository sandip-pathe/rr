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

const workTypes = [
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

interface Props {
  onClick: () => void;
}

interface User {
  id: string;
  name: string;
}

const AddWork: React.FC<Props> = ({ onClick }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm({
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
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(FIREBASE_DB, "users");
      const usersSnap = await getDocs(usersRef);
      const usersList: User[] = usersSnap.docs.map((doc) => ({
        ...(doc.data() as User),
        id: doc.id,
      }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      const selectedAuthors = data.authors
        .map((authorId: string) => {
          const user = users.find((u) => u.id === authorId);
          return user ? { id: user.id, name: user.name } : null;
        })
        .filter(Boolean);

      const authorIds = selectedAuthors.reduce((acc: any, author: any) => {
        acc[author.id] = true;
        return acc;
      }, {} as Record<string, boolean>);

      const workData = {
        ...data,
        authors: selectedAuthors,
        authorIds,
        createdAt: new Date(),
        createdBy: user?.uid,
      };

      await setDoc(doc(FIREBASE_DB, "work", crypto.randomUUID()), workData);
      form.reset();
      onClick();
    } catch (error) {
      console.error("Error adding work:", error);
      alert("Error adding work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex-1 bg-black p-8"
      >
        <button className="" onClick={onClick}>
          <IoIosClose className="bg-red" size={24} />
        </button>
        <h1 className="header">Add Your Work</h1>
        <div>
          <h3 className="mb-2 font-semibold">Work Type</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SEARCHABLE_SELECT}
            name="type"
            placeholder="Select work type"
            options={workTypes}
            allowNewOptions={false}
          />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Title</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="title"
            placeholder="Enter title of your work"
          />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Description / Abstract</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="description"
            placeholder="Enter a brief description"
          />
        </div>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="publishedIn"
          placeholder="Where was this work published? (e.g., IEEE, ArXiv, GitHub)"
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
          placeholder="Location of publication (if applicable)"
        />
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="edition"
          placeholder="Edition (if applicable)"
        />
        <div>
          <h3 className="mb-2 font-semibold">Authors</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            allowNewOptions={false}
            name="authors"
            label="Add members to the project"
            placeholder="Select multiple members"
            options={users}
            optionKey="id"
            optionLabel="name"
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Date of Publication</h3>
          <DatePickerShadCN
            date={form.watch("date")}
            setDate={(date) => form.setValue("date", date as Date)}
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">DOI / Link</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="doi"
            placeholder="Enter DOI, GitHub link, or other URL"
          />
        </div>
        <div aria-disabled className="disabled select-none">
          <h3 className="mb-2 font-semibold">File</h3>
          <div className="border-gray-600 flex flex-col gap-5 h-[150px]  items-center justify-center rounded-md border-2 border-dashed text-sm">
            <MdCloudUpload className="w-12 h-12" />
            <p className="text-gray-300 text-sm">Upload file</p>
            <p className="text-gray-400 text-xs">
              This feature is not yet supported
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Description / Abstract</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="futureScope"
            placeholder="what's next? what is the future scope of this work?"
          />
        </div>

        <div className="flex-wrap flex gap-5">
          <SubmitButton className="w-fit p-4" isLoading={isLoading}>
            Add Work
          </SubmitButton>
        </div>
        <p
          onClick={onClick}
          className="text-white hover:text-gray-400 select-none cursor-pointer"
        >
          Cancel
        </p>
      </form>
    </Form>
  );
};

export default AddWork;
