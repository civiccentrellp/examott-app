import { create } from 'zustand';

type DBMSTab = 'OBJECTIVE' | 'DESCRIPTIVE' |'COMPREHENSIVE' | 'VIDEOS' | 'TESTS';

type DBMSTabState = {
  activeTab: DBMSTab;
  setActiveTab: (tab: DBMSTab) => void;
};

export const useDBMSTabStore = create<DBMSTabState>((set) => ({
  activeTab: 'OBJECTIVE',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
