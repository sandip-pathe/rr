import UserForm from "@/components/forms/NewRegisterForm";
import Link from "next/link";
import Image from "next/image";
import { PresenceWrapper } from "@/components/useStatus";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen ">
      <section className=" container my-auto">
        <div className="sub-container max-w-[496px]">
          <div className="flex flex-row items-center justify-start gap-4 mb-10">
            <PresenceWrapper />
            <Image
              src="/assets/icons/Logomark.svg"
              height={1000}
              width={1000}
              alt="logo"
              className="h-10 w-fit"
            />
            <h1 className="text-2xl font-bold text-[#7839EE]">
              Research Repo Web App
            </h1>
          </div>
          <UserForm />
          <div className="text-14-regular mt-10 flex justify-between">
            <Link href="../../" className="text-[#7839EE]">
              Login
            </Link>
            <Link href="/?admin=true" className="text-[#7839EE]">
              Forgot Password?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
