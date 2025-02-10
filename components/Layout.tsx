import { PageHeadingProvider } from "@/app/auth/PageHeadingContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <div className="flex overflow-auto">
        <Sidebar />
        <main className="flex-grow ml-20 mt-12">{children}</main>
      </div>
    </>
  );
};

export default Layout;
