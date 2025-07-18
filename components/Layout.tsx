import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <div className="flex overflow-auto">
        <Sidebar />
        <main className="flex-grow lg:ml-20 mt-12 pb-16 lg:pb-0">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
