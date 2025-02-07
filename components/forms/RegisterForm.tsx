"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { registrationTwoValidation } from "@/lib/Validation";
import { useRouter } from "next/navigation";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { FormFieldType } from "../../enum/FormFieldTypes";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/app/auth/AuthContext";

const degreeOptions = [
  "Bachelor of Science",
  "Bachelor of Arts",
  "Bachelor of Engineering",
  "Master of Science",
  "Master of Business Administration",
  "Doctor of Philosophy",
];

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof registrationTwoValidation>>({
    resolver: zodResolver(registrationTwoValidation),
    defaultValues: {
      degree: "",
      role: "student",
      introduction: "",
    },
  });

  async function onSubmit({
    degree,
    role,
    introduction,
  }: z.infer<typeof registrationTwoValidation>) {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const userRef = doc(FIREBASE_DB, "users", user.uid);
      await updateDoc(userRef, {
        degree,
        role,
        introduction,
        location: "",
        institution: "Vidyalankar Institute of Technology",
        institutionId: "9hGWzNPZ1oMKTCJxffKy",
        department: "",
        skills: [],
        desciplines: [],
      });

      router.push(`/dashboard/projects`);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋</h1>
          <p className="text-dark-700">Just a Few More Details</p>
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
          <h3 className="my-2 font-semibold">Role</h3>
          <RadioGroup
            defaultValue="student"
            className="flex items-center space-x-2 flex-row"
            onValueChange={(value) => form.setValue("role", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="student" id="student" />
              <Label htmlFor="student">Student</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="professor" id="professor" />
              <Label htmlFor="professor">Professor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="professional" id="professional" />
              <Label htmlFor="professional">Professional</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="my-2 font-semibold">Introduction</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="introduction"
            placeholder="Describe your role, add your interests, and what you are looking for"
          />
        </div>

        <SubmitButton isLoading={isLoading}>Finish registration</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
