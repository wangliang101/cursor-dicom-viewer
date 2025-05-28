import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createDicomSlice } from './slices/dicomSlice';
import { createViewerSlice } from './slices/viewerSlice';
import { createUISlice } from './slices/uiSlice';

// 合并所有slice的状态管理
const useDicomStore = create(
  devtools(
    persist(
      (set, get) => ({
        // 合并所有slice
        ...createDicomSlice(set, get),
        ...createViewerSlice(set),
        ...createUISlice(set),

        // 全局操作
        resetAll: () => {
          const { resetViewerSettings, clearDicomFiles, clearError, clearNotifications } = get();
          resetViewerSettings();
          clearDicomFiles();
          clearError();
          clearNotifications();
        },

        // 获取状态选择器
        getViewerState: () => {
          const state = get();
          return {
            currentFile: state.currentDicomFile,
            settings: state.viewerSettings,
            toolSettings: state.toolSettings,
            currentTool: state.ui.currentTool,
          };
        },

        getUIState: () => {
          const state = get();
          return {
            isLoading: state.ui.isLoading,
            sidebarOpen: state.ui.sidebarOpen,
            toolbarVisible: state.ui.toolbarVisible,
            fullscreen: state.ui.fullscreen,
            theme: state.ui.theme,
            language: state.ui.language,
            error: state.error,
            notifications: state.notifications,
          };
        },
      }),
      {
        name: 'dicom-viewer-storage',
        partialize: (state) => ({
          viewerSettings: state.viewerSettings,
          toolSettings: state.toolSettings,
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            toolbarVisible: state.ui.toolbarVisible,
            currentTool: state.ui.currentTool,
            theme: state.ui.theme,
            language: state.ui.language,
          },
        }),
      }
    ),
    {
      name: 'dicom-store',
    }
  )
);

export default useDicomStore;
