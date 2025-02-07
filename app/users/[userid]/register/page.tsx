import RegisterForm from "@/components/forms/RegisterForm";
import Image from "next/image";

const Register = async ({ params: { userId } }: SearchParamProps) => {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="container scrollbar-hide">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <RegisterForm />
          <p className="copyright py-12">© 2025 MINI PROJECT</p>
        </div>
      </section>

      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default Register;
