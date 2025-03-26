import { AsideNavigation } from "../components/AsideNavigation";
import { Header } from "../components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <div className="h-screen flex w-full">
          {/* left */}
          
              <AsideNavigation/>
          
          {/* right */}
          
          <div className="flex flex-col transition-all duration-300 w-full" id="content-container">
        <Header />
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
          
      </div>
   
  );
}
