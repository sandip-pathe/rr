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

export enum FormFieldType {
  INPUT = "input",
}

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For error handling

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
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        router.push(`/dashboard`);
      }
    } catch (error) {
      setError("Failed to login. Please check your email or password.");
      console.log("Login error:", error);
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
        {/* Display error message if login fails */}
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
          autocomplete="current-password"
        />
        <Link href="/auth/register" className="text-green-500">
          Forgot Password?
        </Link>
        <SubmitButton isLoading={isLoading}>Log In</SubmitButton>
      </form>
    </Form>
  );
};

export default LoginPage;
