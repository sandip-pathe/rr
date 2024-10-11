"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import { useState } from "react";
import { EditFormValidation } from "@/lib/Validation";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DatePickerShadCN from "@/components/DatePicker";
import { MdCloudUpload } from "react-icons/md";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  SEARCHABLE_SELECT = "searchableSelect",
  M_SEARCHABLE_SELECT = "mSearchableSelect",
}

const publicationOptions = [
  "artical",
  "paper",
  "conference paper",
  "white paper",
  "patent",
  "book",
  "code",
  "capter",
  "cover page",
];

const db = getFirestore();

const AddResearch = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof EditFormValidation>>({
    resolver: zodResolver(EditFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit({
    name,
    email,
    phone,
  }: z.infer<typeof EditFormValidation>) {
    setIsLoading(true);
    try {
      // Register the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        "default_password"
      );
      const user = userCredential.user;

      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          phone,
        });

        // Redirect or other post-registration logic
        router.push(`/users/${user.uid}/register`);
      }
    } catch (error) {
      console.log("Error registering user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex-1 bg-black p-8 w-2/3"
      >
        <section className="mb-12 space-y-4">
          <h1 className="header">Add your research</h1>
        </section>
        <div>
          <h3 className="mb-2 font-semibold">Publication Type</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SEARCHABLE_SELECT}
            name="degree"
            placeholder="select type of your publication"
            options={publicationOptions}
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">File</h3>
          <div className="border-gray-600 flex flex-col gap-5 h-[150px]  items-center justify-center rounded-md border-2 border-dashed text-sm">
            <MdCloudUpload className="w-12 h-12" />
            <p className="text-gray-300 text-sm">Upload pdf file</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Title</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="title"
            placeholder={"enter title of your work"}
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Authors</h3>
          <CustomFormField
            control={form.control}
            name=""
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            placeholder="Add Authors"
            options={publicationOptions}
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Date</h3>
          <DatePickerShadCN />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-5">
            <span>
              <h3 className="my-2 font-semibold">DOI</h3>
            </span>
            <span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-sm underline">
                    What is a DOI?
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px]">
                      DOIs provide a reliable link to your research online,
                      making it easy for people to cite you.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </div>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            placeholder="Enter DOI of work"
            name="doi"
          />
        </div>
        <div className="flex-wrap flex gap-5">
          <SubmitButton className="w-fit p-4" isLoading={isLoading}>
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default AddResearch;
