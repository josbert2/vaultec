import { getCurrentUser } from "@/actions/user-action";
import Container from "@/components/container";
import DashboardNavigation from "@/components/dashboard-navigation";
import Sidebar from "@/components/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React from "react";

const DashboardLayout = async ({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) => {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Container className="max-w-screen-3xl">
        <DashboardNavigation />

        <ResizablePanelGroup direction="horizontal" className="min-h-screen">
          <ResizablePanel defaultSize={19} className="hidden md:block">
            <Sidebar currentUser={currentUser} />
          </ResizablePanel>

          <ResizableHandle withHandle className="hidden border-border md:flex" />

          <ResizablePanel defaultSize={81}>
            <div className="max-h-screen overflow-y-auto bg-background">
              <Container className="max-w-screen-lg px-5 py-3">
                {children}
              </Container>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Container>
    </div>
  );
};

export default DashboardLayout;
