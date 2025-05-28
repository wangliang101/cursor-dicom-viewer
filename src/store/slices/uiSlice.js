// UI状态管理slice
export const createUISlice = (set) => ({
  // UI状态
  ui: {
    isLoading: false,
    sidebarOpen: true,
    toolbarVisible: true,
    currentTool: 'WindowLevel',
    fullscreen: false,
    theme: 'light',
    language: 'zh',
    uploadModalVisible: false,
    tagsModalVisible: false,
  },

  // 错误状态
  error: null,
  notifications: [],

  // Actions
  setLoading: (loading) =>
    set(
      (state) => ({
        ui: { ...state.ui, isLoading: loading },
      }),
      false,
      'setLoading'
    ),

  toggleSidebar: () =>
    set(
      (state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      }),
      false,
      'toggleSidebar'
    ),

  setSidebarOpen: (open) =>
    set(
      (state) => ({
        ui: { ...state.ui, sidebarOpen: open },
      }),
      false,
      'setSidebarOpen'
    ),

  setCurrentTool: (tool) =>
    set(
      (state) => ({
        ui: { ...state.ui, currentTool: tool },
      }),
      false,
      'setCurrentTool'
    ),

  toggleFullscreen: () =>
    set(
      (state) => ({
        ui: { ...state.ui, fullscreen: !state.ui.fullscreen },
      }),
      false,
      'toggleFullscreen'
    ),

  setFullscreen: (fullscreen) =>
    set(
      (state) => ({
        ui: { ...state.ui, fullscreen },
      }),
      false,
      'setFullscreen'
    ),

  toggleToolbar: () =>
    set(
      (state) => ({
        ui: { ...state.ui, toolbarVisible: !state.ui.toolbarVisible },
      }),
      false,
      'toggleToolbar'
    ),

  setToolbarVisible: (visible) =>
    set(
      (state) => ({
        ui: { ...state.ui, toolbarVisible: visible },
      }),
      false,
      'setToolbarVisible'
    ),

  setTheme: (theme) =>
    set(
      (state) => ({
        ui: { ...state.ui, theme },
      }),
      false,
      'setTheme'
    ),

  setLanguage: (language) =>
    set(
      (state) => ({
        ui: { ...state.ui, language },
      }),
      false,
      'setLanguage'
    ),

  // 新增：模态框操作
  setUploadModalVisible: (visible) =>
    set(
      (state) => ({
        ui: { ...state.ui, uploadModalVisible: visible },
      }),
      false,
      'setUploadModalVisible'
    ),

  setTagsModalVisible: (visible) =>
    set(
      (state) => ({
        ui: { ...state.ui, tagsModalVisible: visible },
      }),
      false,
      'setTagsModalVisible'
    ),

  // 错误处理
  setError: (error) =>
    set(
      () => ({
        error,
      }),
      false,
      'setError'
    ),

  clearError: () =>
    set(
      () => ({
        error: null,
      }),
      false,
      'clearError'
    ),

  // 通知系统
  addNotification: (notification) =>
    set(
      (state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
          },
        ],
      }),
      false,
      'addNotification'
    ),

  removeNotification: (id) =>
    set(
      (state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }),
      false,
      'removeNotification'
    ),

  clearNotifications: () =>
    set(
      () => ({
        notifications: [],
      }),
      false,
      'clearNotifications'
    ),

  // 复合操作
  showSuccess: (message) => {
    const { addNotification } = set.get ? set.get() : {};
    if (addNotification) {
      addNotification({
        type: 'success',
        message,
        duration: 3000,
      });
    }
  },

  showError: (message) => {
    const { addNotification, setError } = set.get ? set.get() : {};
    if (addNotification && setError) {
      setError(message);
      addNotification({
        type: 'error',
        message,
        duration: 5000,
      });
    }
  },

  showWarning: (message) => {
    const { addNotification } = set.get ? set.get() : {};
    if (addNotification) {
      addNotification({
        type: 'warning',
        message,
        duration: 4000,
      });
    }
  },

  showInfo: (message) => {
    const { addNotification } = set.get ? set.get() : {};
    if (addNotification) {
      addNotification({
        type: 'info',
        message,
        duration: 3000,
      });
    }
  },
});
