"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { LoginFormValidation } from "@/lib/Validation";
import Link from "next/link";
import { FormFieldType } from "@/enum/FormFieldTypes";

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof LoginFormValidation>>({
    resolver: zodResolver(LoginFormValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit({
    email,
    password,
  }: z.infer<typeof LoginFormValidation>) {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Welcome Back 👋</h1>
          <p className="text-dark-700">Please log in to continue</p>
        </section>
        {error && <p className="text-red-600">{error}</p>}{" "}
        {/* Show error message */}
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
        <SubmitButton isLoading={isLoading}>Log In</SubmitButton>
      </form>
    </Form>
  );
};

export default LoginPage;
