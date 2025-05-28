// DICOM文件管理slice
export const createDicomSlice = (set, get) => ({
  // 状态
  currentDicomFile: null,
  dicomFiles: [],
  dicomMetadata: {},

  // Actions
  setCurrentDicomFile: (file) =>
    set(
      () => ({
        currentDicomFile: file,
      }),
      false,
      'setCurrentDicomFile'
    ),

  addDicomFile: (file) =>
    set(
      (state) => ({
        dicomFiles: [...state.dicomFiles, file],
      }),
      false,
      'addDicomFile'
    ),

  removeDicomFile: (fileId) =>
    set(
      (state) => ({
        dicomFiles: state.dicomFiles.filter((f) => f.id !== fileId),
        currentDicomFile: state.currentDicomFile?.id === fileId ? null : state.currentDicomFile,
      }),
      false,
      'removeDicomFile'
    ),

  clearDicomFiles: () =>
    set(
      () => ({
        dicomFiles: [],
        currentDicomFile: null,
        dicomMetadata: {},
      }),
      false,
      'clearDicomFiles'
    ),

  setDicomMetadata: (fileId, metadata) =>
    set(
      (state) => ({
        dicomMetadata: {
          ...state.dicomMetadata,
          [fileId]: metadata,
        },
      }),
      false,
      'setDicomMetadata'
    ),

  // 复合操作
  loadDicomFile: async (file) => {
    const { setLoading, setError, setCurrentDicomFile, addDicomFile } = get();

    try {
      setLoading(true);
      setError(null);

      // 处理文件
      const processedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file,
        uploadTime: new Date().toISOString(),
      };

      addDicomFile(processedFile);
      setCurrentDicomFile(processedFile);

      return processedFile;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  },
});
