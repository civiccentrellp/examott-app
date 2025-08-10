'use client';

import { useUser } from "@/context/userContext";
import DashboardPage from "@/components/dashboard/DashboardPage";

const Dashboard = () => {
  const { user, loading } = useUser();

  return (
    <div className="min-h-screen">
      <DashboardPage/>
    </div>
  );
};

export default Dashboard;
