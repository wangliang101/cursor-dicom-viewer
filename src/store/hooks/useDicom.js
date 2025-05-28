import useDicomStore from '../index';
import { useCallback } from 'react';

// DICOM文件管理hooks
export const useDicomFiles = () => {
  const dicomFiles = useDicomStore((state) => state.dicomFiles);
  const currentDicomFile = useDicomStore((state) => state.currentDicomFile);
  const dicomMetadata = useDicomStore((state) => state.dicomMetadata);

  const addDicomFile = useDicomStore((state) => state.addDicomFile);
  const removeDicomFile = useDicomStore((state) => state.removeDicomFile);
  const setCurrentDicomFile = useDicomStore((state) => state.setCurrentDicomFile);
  const clearDicomFiles = useDicomStore((state) => state.clearDicomFiles);
  const loadDicomFile = useDicomStore((state) => state.loadDicomFile);
  const setDicomMetadata = useDicomStore((state) => state.setDicomMetadata);

  return {
    // 状态
    dicomFiles,
    currentDicomFile,
    dicomMetadata,

    // 操作
    addDicomFile,
    removeDicomFile,
    setCurrentDicomFile,
    clearDicomFiles,
    loadDicomFile,
    setDicomMetadata,

    // 计算属性
    hasFiles: dicomFiles.length > 0,
    fileCount: dicomFiles.length,
    currentMetadata: currentDicomFile ? dicomMetadata[currentDicomFile.id] : null,
  };
};

// 当前DICOM文件hook
export const useCurrentDicom = () => {
  const currentDicomFile = useDicomStore((state) => state.currentDicomFile);
  const dicomMetadata = useDicomStore((state) => state.dicomMetadata);
  const setCurrentDicomFile = useDicomStore((state) => state.setCurrentDicomFile);

  const currentMetadata = currentDicomFile ? dicomMetadata[currentDicomFile.id] : null;

  const selectFile = useCallback(
    (file) => {
      setCurrentDicomFile(file);
    },
    [setCurrentDicomFile]
  );

  return {
    currentFile: currentDicomFile,
    metadata: currentMetadata,
    selectFile,
    hasCurrentFile: !!currentDicomFile,
  };
};

// DICOM文件列表操作hook
export const useDicomList = () => {
  const dicomFiles = useDicomStore((state) => state.dicomFiles);
  const currentDicomFile = useDicomStore((state) => state.currentDicomFile);

  const addDicomFile = useDicomStore((state) => state.addDicomFile);
  const removeDicomFile = useDicomStore((state) => state.removeDicomFile);
  const setCurrentDicomFile = useDicomStore((state) => state.setCurrentDicomFile);
  const clearDicomFiles = useDicomStore((state) => state.clearDicomFiles);

  const selectNext = useCallback(() => {
    if (!currentDicomFile || dicomFiles.length === 0) return;

    const currentIndex = dicomFiles.findIndex((f) => f.id === currentDicomFile.id);
    const nextIndex = (currentIndex + 1) % dicomFiles.length;
    setCurrentDicomFile(dicomFiles[nextIndex]);
  }, [currentDicomFile, dicomFiles, setCurrentDicomFile]);

  const selectPrevious = useCallback(() => {
    if (!currentDicomFile || dicomFiles.length === 0) return;

    const currentIndex = dicomFiles.findIndex((f) => f.id === currentDicomFile.id);
    const previousIndex = currentIndex === 0 ? dicomFiles.length - 1 : currentIndex - 1;
    setCurrentDicomFile(dicomFiles[previousIndex]);
  }, [currentDicomFile, dicomFiles, setCurrentDicomFile]);

  const selectByIndex = useCallback(
    (index) => {
      if (index >= 0 && index < dicomFiles.length) {
        setCurrentDicomFile(dicomFiles[index]);
      }
    },
    [dicomFiles, setCurrentDicomFile]
  );

  return {
    files: dicomFiles,
    currentFile: currentDicomFile,
    currentIndex: currentDicomFile ? dicomFiles.findIndex((f) => f.id === currentDicomFile.id) : -1,

    // 操作
    addFile: addDicomFile,
    removeFile: removeDicomFile,
    clearFiles: clearDicomFiles,
    selectNext,
    selectPrevious,
    selectByIndex,

    // 计算属性
    hasNext: currentDicomFile
      ? dicomFiles.findIndex((f) => f.id === currentDicomFile.id) < dicomFiles.length - 1
      : false,
    hasPrevious: currentDicomFile
      ? dicomFiles.findIndex((f) => f.id === currentDicomFile.id) > 0
      : false,
    count: dicomFiles.length,
  };
};
