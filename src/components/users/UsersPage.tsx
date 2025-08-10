'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersTab from './Tabs/UsersTab';
import RolesTab from './Tabs/RolesTab';
import PermissionsTab from './Tabs/PermissionsTab';
import PaymentsTab from './Tabs/PaymentsTab';


const UsersPage = () => {
  return (
    <div className="sm:p-4 space-y-6 h-screen overflow-y-auto pb-24">
      <h1 className="sm:text-2xl text-lg font-semibold text-gray-800">User Management</h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="flex w-full sm:max-w-2xl px-2 py-4 gap-2 bg-white text-gray-700 rounded-xl shadow-sm">
          <TabsTrigger value="users" className="flex-1 text-center p-2">
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex-1 text-center p-2">
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1 text-center p-2">
            Permissions
          </TabsTrigger>
          {/* <TabsTrigger value="activity" className="flex-1 text-center p-2">
            User Activity
          </TabsTrigger> */}
          <TabsTrigger value="payments" className="flex-1 text-center p-2">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
