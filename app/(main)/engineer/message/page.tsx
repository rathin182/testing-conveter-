import DashboardShell from "@/components/layout/DashboardShell";
import DirectMessageUI from "@/components/chat/DirectMessageUI";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function MessagePage() {
  return (
    // <DashboardShell>
    //   <div className="max-w-[1400px] mx-auto w-full">
    //     <DirectMessageUI />
    //   </div>
    // </DashboardShell>
    <div className="flex overflow-hidden h-screen">
          <Sidebar />
          <div className="w-full">
            <Topbar />
            {/* <p className="w-full">hello message</p> */}
            <div className="m-1">
              <DirectMessageUI />
            </div>
          </div>
          </div>
  );
}