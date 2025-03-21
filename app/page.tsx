"use client";

import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/forms/LoginForm";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="container my-auto">
        <div className="sub-container max-w-[496px]">
          <div className="flex flex-row items-center justify-start gap-4 mb-10">
            <Image
              src="/assets/icons/Logomark.svg"
              height={1000}
              width={1000}
              alt="logo"
              className="h-10 w-fit"
            />
            <h1 className="text-4xl font-semibold">Research Repo Web App</h1>
          </div>
          <LoginForm />
          <div className="text-14-regular mt-10 flex justify-between">
            <Link href="/auth/register" className="text-[#7839EE]">
              Register
            </Link>
            <Link href="/?admin=true" className="text-[#7839EE]">
              Admin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
