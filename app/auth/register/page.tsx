import UserForm from "@/components/forms/NewRegisterForm";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen ">
      <section className=" container my-auto">
        <div className="sub-container max-w-[496px]">
          <div className="flex flex-row items-center justify-start gap-4 mb-10">
            <Image
              src="/assets/icons/logow.svg"
              height={1000}
              width={1000}
              alt="logo"
              className="h-10 w-fit"
            />
            <h1 className="text-4xl font-semibold">Research Repo Web App</h1>
          </div>
          <UserForm />
          <div className="text-14-regular mt-10 flex justify-between">
            <Link href="../../" className="text-green-500">
              Login
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
