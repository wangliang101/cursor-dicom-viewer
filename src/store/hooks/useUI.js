import useDicomStore from '../index';
import { useCallback } from 'react';

// UI状态hook
export const useUI = () => {
  const ui = useDicomStore((state) => state.ui);
  const error = useDicomStore((state) => state.error);
  const notifications = useDicomStore((state) => state.notifications);

  const setLoading = useDicomStore((state) => state.setLoading);
  const toggleSidebar = useDicomStore((state) => state.toggleSidebar);
  const setSidebarOpen = useDicomStore((state) => state.setSidebarOpen);
  const toggleFullscreen = useDicomStore((state) => state.toggleFullscreen);
  const setFullscreen = useDicomStore((state) => state.setFullscreen);
  const toggleToolbar = useDicomStore((state) => state.toggleToolbar);
  const setTheme = useDicomStore((state) => state.setTheme);
  const setLanguage = useDicomStore((state) => state.setLanguage);

  return {
    // 状态
    ...ui,
    error,
    notifications,

    // 操作
    setLoading,
    toggleSidebar,
    setSidebarOpen,
    toggleFullscreen,
    setFullscreen,
    toggleToolbar,
    setTheme,
    setLanguage,

    // 计算属性
    hasError: !!error,
    hasNotifications: notifications.length > 0,
    isDarkTheme: ui.theme === 'dark',
  };
};

// 加载状态hook
export const useLoading = () => {
  const isLoading = useDicomStore((state) => state.ui.isLoading);
  const setLoading = useDicomStore((state) => state.setLoading);

  const withLoading = useCallback(
    async (asyncFn) => {
      try {
        setLoading(true);
        return await asyncFn();
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    isLoading,
    setLoading,
    withLoading,
  };
};

// 错误处理hook
export const useError = () => {
  const error = useDicomStore((state) => state.error);
  const setError = useDicomStore((state) => state.setError);
  const clearError = useDicomStore((state) => state.clearError);

  const handleError = useCallback(
    (error) => {
      console.error('DICOM Viewer Error:', error);
      setError(error instanceof Error ? error.message : String(error));
    },
    [setError]
  );

  const handleAsyncError = useCallback(
    async (asyncFn) => {
      try {
        clearError();
        return await asyncFn();
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [clearError, handleError]
  );

  return {
    error,
    hasError: !!error,
    setError,
    clearError,
    handleError,
    handleAsyncError,
  };
};

// 通知管理hook
export const useNotifications = () => {
  const notifications = useDicomStore((state) => state.notifications);
  const addNotification = useDicomStore((state) => state.addNotification);
  const removeNotification = useDicomStore((state) => state.removeNotification);
  const clearNotifications = useDicomStore((state) => state.clearNotifications);

  const showSuccess = useDicomStore((state) => state.showSuccess);
  const showError = useDicomStore((state) => state.showError);
  const showWarning = useDicomStore((state) => state.showWarning);
  const showInfo = useDicomStore((state) => state.showInfo);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // 计算属性
    hasNotifications: notifications.length > 0,
    notificationCount: notifications.length,

    // 按类型分组
    errorNotifications: notifications.filter((n) => n.type === 'error'),
    successNotifications: notifications.filter((n) => n.type === 'success'),
    warningNotifications: notifications.filter((n) => n.type === 'warning'),
    infoNotifications: notifications.filter((n) => n.type === 'info'),
  };
};

// 侧边栏hook
export const useSidebar = () => {
  const sidebarOpen = useDicomStore((state) => state.ui.sidebarOpen);
  const toggleSidebar = useDicomStore((state) => state.toggleSidebar);
  const setSidebarOpen = useDicomStore((state) => state.setSidebarOpen);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  return {
    isOpen: sidebarOpen,
    toggle: toggleSidebar,
    open: openSidebar,
    close: closeSidebar,
  };
};

// 全屏hook
export const useFullscreen = () => {
  const fullscreen = useDicomStore((state) => state.ui.fullscreen);
  const toggleFullscreen = useDicomStore((state) => state.toggleFullscreen);
  const setFullscreen = useDicomStore((state) => state.setFullscreen);

  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    // 可以在这里添加原生全屏API调用
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }, [setFullscreen]);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    // 可以在这里添加原生全屏API调用
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, [setFullscreen]);

  return {
    isFullscreen: fullscreen,
    toggle: toggleFullscreen,
    enter: enterFullscreen,
    exit: exitFullscreen,
  };
};

// 主题hook
export const useTheme = () => {
  const theme = useDicomStore((state) => state.ui.theme);
  const setTheme = useDicomStore((state) => state.setTheme);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, [setTheme]);

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };
};
