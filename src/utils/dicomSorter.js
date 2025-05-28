import dicomParser from 'dicom-parser';

/**
 * DICOM文件排序工具
 * 根据DICOM标签对图像进行正确排序
 */

/**
 * 解析DICOM文件的关键排序标签
 * @param {File} file - DICOM文件对象
 * @returns {Promise<Object>} 包含排序信息的对象
 */
async function parseDicomSortingInfo(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);

    // 提取关键的排序标签
    const sortingInfo = {
      file: file,
      instanceNumber: null,
      sliceLocation: null,
      imagePositionPatient: null,
      acquisitionNumber: null,
      seriesNumber: null,
      fileName: file.name,
      originalIndex: null, // 原始索引，作为兜底排序方案
    };

    // Instance Number (0020,0013) - 最常用的排序标签
    try {
      const instanceNumber = dataSet.string('x00200013');
      if (instanceNumber) {
        sortingInfo.instanceNumber = parseInt(instanceNumber, 10);
      }
    } catch {
      console.debug('未找到Instance Number标签');
    }

    // Slice Location (0020,1041) - 切片位置
    try {
      const sliceLocation = dataSet.string('x00201041');
      if (sliceLocation) {
        sortingInfo.sliceLocation = parseFloat(sliceLocation);
      }
    } catch {
      console.debug('未找到Slice Location标签');
    }

    // Image Position Patient (0020,0032) - 图像位置（取Z坐标）
    try {
      const imagePositionPatient = dataSet.string('x00200032');
      if (imagePositionPatient) {
        const positions = imagePositionPatient.split('\\').map(Number);
        if (positions.length >= 3) {
          sortingInfo.imagePositionPatient = positions[2]; // Z坐标
        }
      }
    } catch {
      console.debug('未找到Image Position Patient标签');
    }

    // Acquisition Number (0020,0012)
    try {
      const acquisitionNumber = dataSet.string('x00200012');
      if (acquisitionNumber) {
        sortingInfo.acquisitionNumber = parseInt(acquisitionNumber, 10);
      }
    } catch {
      console.debug('未找到Acquisition Number标签');
    }

    // Series Number (0020,0011)
    try {
      const seriesNumber = dataSet.string('x00200011');
      if (seriesNumber) {
        sortingInfo.seriesNumber = parseInt(seriesNumber, 10);
      }
    } catch {
      console.debug('未找到Series Number标签');
    }

    return sortingInfo;
  } catch (error) {
    console.warn(`解析DICOM文件 ${file.name} 失败:`, error);
    // 返回基本信息，即使解析失败
    return {
      file: file,
      instanceNumber: null,
      sliceLocation: null,
      imagePositionPatient: null,
      acquisitionNumber: null,
      seriesNumber: null,
      fileName: file.name,
      originalIndex: null,
    };
  }
}

/**
 * 多级排序比较函数
 * @param {Object} a - 第一个排序信息对象
 * @param {Object} b - 第二个排序信息对象
 * @returns {number} 排序结果
 */
function compareDicomSortingInfo(a, b) {
  // 1. 优先按Series Number排序
  if (a.seriesNumber !== null && b.seriesNumber !== null) {
    if (a.seriesNumber !== b.seriesNumber) {
      return a.seriesNumber - b.seriesNumber;
    }
  } else if (a.seriesNumber !== null) {
    return -1;
  } else if (b.seriesNumber !== null) {
    return 1;
  }

  // 2. 按Instance Number排序（最常用）
  if (a.instanceNumber !== null && b.instanceNumber !== null) {
    if (a.instanceNumber !== b.instanceNumber) {
      return a.instanceNumber - b.instanceNumber;
    }
  } else if (a.instanceNumber !== null) {
    return -1;
  } else if (b.instanceNumber !== null) {
    return 1;
  }

  // 3. 按Slice Location排序
  if (a.sliceLocation !== null && b.sliceLocation !== null) {
    if (Math.abs(a.sliceLocation - b.sliceLocation) > 0.001) {
      return a.sliceLocation - b.sliceLocation;
    }
  } else if (a.sliceLocation !== null) {
    return -1;
  } else if (b.sliceLocation !== null) {
    return 1;
  }

  // 4. 按Image Position Patient (Z坐标)排序
  if (a.imagePositionPatient !== null && b.imagePositionPatient !== null) {
    if (Math.abs(a.imagePositionPatient - b.imagePositionPatient) > 0.001) {
      return a.imagePositionPatient - b.imagePositionPatient;
    }
  } else if (a.imagePositionPatient !== null) {
    return -1;
  } else if (b.imagePositionPatient !== null) {
    return 1;
  }

  // 5. 按Acquisition Number排序
  if (a.acquisitionNumber !== null && b.acquisitionNumber !== null) {
    if (a.acquisitionNumber !== b.acquisitionNumber) {
      return a.acquisitionNumber - b.acquisitionNumber;
    }
  } else if (a.acquisitionNumber !== null) {
    return -1;
  } else if (b.acquisitionNumber !== null) {
    return 1;
  }

  // 6. 按文件名排序（自然排序）
  if (a.fileName !== b.fileName) {
    return a.fileName.localeCompare(b.fileName, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  // 7. 最后按原始索引排序
  if (a.originalIndex !== null && b.originalIndex !== null) {
    return a.originalIndex - b.originalIndex;
  }

  return 0;
}

/**
 * 对DICOM文件列表进行排序
 * @param {Array} fileList - 文件列表
 * @returns {Promise<Array>} 排序后的文件列表
 */
export async function sortDicomFiles(fileList) {
  if (!fileList || fileList.length <= 1) {
    return fileList;
  }

  console.log('开始对DICOM文件进行排序...');

  try {
    // 解析所有文件的排序信息
    const sortingInfoPromises = fileList.map(async (fileObj, index) => {
      const file = fileObj.originFileObj || fileObj; // 兼容不同的文件对象格式
      const info = await parseDicomSortingInfo(file);
      info.originalIndex = index; // 保存原始索引
      info.originalFileObj = fileObj; // 保存原始文件对象
      return info;
    });

    const sortingInfos = await Promise.all(sortingInfoPromises);

    // 排序
    sortingInfos.sort(compareDicomSortingInfo);

    // 返回排序后的文件列表
    const sortedFileList = sortingInfos.map((info) => info.originalFileObj);

    console.log('DICOM文件排序完成');
    console.log(
      '排序信息:',
      sortingInfos.map((info) => ({
        fileName: info.fileName,
        instanceNumber: info.instanceNumber,
        sliceLocation: info.sliceLocation,
        imagePositionPatient: info.imagePositionPatient,
      }))
    );

    return sortedFileList;
  } catch (error) {
    console.error('DICOM文件排序失败:', error);
    // 如果排序失败，返回原始列表
    return fileList;
  }
}

/**
 * 简单的文件名排序（兜底方案）
 * @param {Array} fileList - 文件列表
 * @returns {Array} 按文件名排序的文件列表
 */
export function sortByFileName(fileList) {
  if (!fileList || fileList.length <= 1) {
    return fileList;
  }

  return [...fileList].sort((a, b) => {
    const nameA = a.originFileObj?.name || a.name || '';
    const nameB = b.originFileObj?.name || b.name || '';
    return nameA.localeCompare(nameB, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}
