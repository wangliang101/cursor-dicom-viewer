// UI状态管理slice
export const createUISlice = (set) => ({
  // UI状态
  ui: {
    isLoading: false,
    sidebarOpen: true,
    toolbarVisible: true,
    currentTool: 'windowLevel',
    fullscreen: false,
    theme: 'dark',
    language: 'zh-CN',
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

  // 错误处理
  setError: (error) => set(() => ({ error }), false, 'setError'),

  clearError: () => set(() => ({ error: null }), false, 'clearError'),

  // 通知管理
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification,
    };

    set(
      (state) => ({
        notifications: [...state.notifications, newNotification],
      }),
      false,
      'addNotification'
    );

    // 自动移除通知
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'autoRemoveNotification'
        );
      }, notification.duration || 5000);
    }

    return id;
  },

  removeNotification: (id) =>
    set(
      (state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }),
      false,
      'removeNotification'
    ),

  clearNotifications: () => set(() => ({ notifications: [] }), false, 'clearNotifications'),

  // 复合UI操作
  showSuccess: (message, options = {}) => {
    const { addNotification } = set.getState ? set.getState() : {};
    return addNotification?.({
      type: 'success',
      message,
      ...options,
    });
  },

  showError: (message, options = {}) => {
    const { addNotification } = set.getState ? set.getState() : {};
    return addNotification?.({
      type: 'error',
      message,
      autoRemove: false,
      ...options,
    });
  },

  showWarning: (message, options = {}) => {
    const { addNotification } = set.getState ? set.getState() : {};
    return addNotification?.({
      type: 'warning',
      message,
      ...options,
    });
  },

  showInfo: (message, options = {}) => {
    const { addNotification } = set.getState ? set.getState() : {};
    return addNotification?.({
      type: 'info',
      message,
      ...options,
    });
  },
});
