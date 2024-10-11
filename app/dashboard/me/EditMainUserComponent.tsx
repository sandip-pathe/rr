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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaAngleDown } from "react-icons/fa";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  SEARCHABLE_SELECT = "searchableSelect",
}

const degreeOptions = [
  "Bachelor of Science",
  "Bachelor of Arts",
  "Bachelor of Engineering",
  "Master of Science",
  "Master of Business Administration",
  "Doctor of Philosophy",
];

const db = getFirestore();

const EditMainUserComponent = () => {
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
        className="space-y-6 flex-1 bg-black p-8 pb-0"
      >
        <section className="mb-12 space-y-4">
          <h1 className="header">Edit Profile Details</h1>
        </section>
        <div>
          <h3 className="mb-2 font-semibold">Degree</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SEARCHABLE_SELECT}
            name="degree"
            placeholder="Enter or select your degree"
            options={degreeOptions}
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Current Activity</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="description"
            placeholder="Looking for collaborators, a new postion, feedback, or something else? Enter your current activity to let people know"
          />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Personal Website</h3>
          <CustomFormField
            control={form.control}
            name="website"
            fieldType={FormFieldType.INPUT}
            placeholder="Add link to your website"
          />
        </div>
        <Collapsible>
          <CollapsibleTrigger className="text-sm text-gray-400 flex felx-wrap items-center">
            Edit name and other details
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <h3 className="my-2 font-semibold">Name</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                placeholder="Enter your full name"
                name="name"
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Institution</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="institution"
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Department</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SEARCHABLE_SELECT}
                name="department"
                options={degreeOptions}
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Position</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="position"
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Location</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="location"
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Description</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                placeholder="Describe Your role"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div className="flex-wrap flex gap-5">
          <SubmitButton
            className="w-fit p-4 rounded-none"
            isLoading={isLoading}
          >
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default EditMainUserComponent;
