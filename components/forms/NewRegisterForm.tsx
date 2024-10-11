"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { RegisterFormValidation } from "@/lib/Validation";

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

const db = getFirestore();

const ProfileForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof RegisterFormValidation>>({
    resolver: zodResolver(RegisterFormValidation),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit({
    name,
    email,
    password,
  }: z.infer<typeof RegisterFormValidation>) {
    setIsLoading(true);
    try {
      console.log("Before CreateUser");
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
        });

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋</h1>
          <p className="text-dark-700">Join Community of 1000+ researchers</p>
        </section>
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          name="name"
          label="Full name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
          control={form.control}
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          name="email"
          label="Email"
          placeholder="Johndoe@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
          control={form.control}
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          iconSrc="/assets/icons/lock.svg"
          iconAlt="password"
          control={form.control}
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default ProfileForm;
