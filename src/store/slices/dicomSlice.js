// DICOM文件管理slice
export const createDicomSlice = (set, get) => ({
  // 状态
  currentDicomFile: null,
  dicomFiles: [],
  dicomMetadata: {},
  // 新增：图像相关状态
  images: [], // 存储图像ID数组
  currentImageIndex: 0,
  totalImages: 0,
  isPlaying: false,
  framesPerSecond: 24,

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
        images: [],
        currentImageIndex: 0,
        totalImages: 0,
        isPlaying: false,
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

  // 新增：图像相关操作
  setImages: (imageIds) =>
    set(
      () => ({
        images: imageIds,
        totalImages: imageIds.length,
        currentImageIndex: 0,
      }),
      false,
      'setImages'
    ),

  setCurrentImageIndex: (index) =>
    set(
      (state) => ({
        currentImageIndex: Math.max(0, Math.min(index, state.totalImages - 1)),
      }),
      false,
      'setCurrentImageIndex'
    ),

  nextImage: () =>
    set(
      (state) => ({
        currentImageIndex:
          state.totalImages > 0 ? (state.currentImageIndex + 1) % state.totalImages : 0,
      }),
      false,
      'nextImage'
    ),

  prevImage: () =>
    set(
      (state) => ({
        currentImageIndex:
          state.totalImages > 0
            ? state.currentImageIndex === 0
              ? state.totalImages - 1
              : state.currentImageIndex - 1
            : 0,
      }),
      false,
      'prevImage'
    ),

  setIsPlaying: (playing) =>
    set(
      () => ({
        isPlaying: playing,
      }),
      false,
      'setIsPlaying'
    ),

  setFramesPerSecond: (fps) =>
    set(
      () => ({
        framesPerSecond: fps,
      }),
      false,
      'setFramesPerSecond'
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

  // 处理上传文件列表并生成图像ID
  processUploadedFiles: async (fileList) => {
    const { setImages, setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      if (fileList && fileList.length > 0) {
        const imageIds = fileList.map(
          (file) => `wadouri:${URL.createObjectURL(file.originFileObj)}`
        );
        setImages(imageIds);
        return imageIds;
      }
      return [];
    } catch (error) {
      setError('处理DICOM文件失败');
      throw error;
    } finally {
      setLoading(false);
    }
  },
});
