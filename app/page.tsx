"use client";

import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/forms/LoginForm";
import ExampleComponent from "@/components/DataFetch";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="container my-auto">
        <div className="sub-container max-w-[496px]">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />
          <LoginForm />
          <div className="text-14-regular mt-10 flex justify-between">
            <Link href="/auth/register" className="text-green-500">
              Register
            </Link>
            <Link href="/dashboard" className="text-green-500">
              Dashboard
            </Link>
            <Link href="/?admin=true" className="text-green-500">
              Admin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
