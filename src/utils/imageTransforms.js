/**
 * 图像变换工具函数
 * 用于处理DICOM图像的各种变换操作
 */

/**
 * 重置图像到初始状态
 * @param {Object} viewport - Cornerstone viewport实例
 */
export const resetImage = (viewport) => {
  if (!viewport) return;

  try {
    // 重置相机
    viewport.resetCamera();

    // 重置图像属性
    viewport.setProperties({
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
      invert: false,
      voiRange: undefined, // 将使用默认的窗宽窗位
    });

    viewport.render();
    console.log('图像已重置到初始状态');
  } catch (error) {
    console.error('重置图像失败:', error);
  }
};

/**
 * 水平翻转图像
 * @param {Object} viewport - Cornerstone viewport实例
 */
export const flipHorizontal = (viewport) => {
  if (!viewport) return;

  try {
    const currentProperties = viewport.getProperties();
    const newFlipH = !currentProperties.flipHorizontal;

    viewport.setProperties({
      flipHorizontal: newFlipH,
    });

    viewport.render();
    console.log(`图像水平翻转: ${newFlipH ? '开启' : '关闭'}`);
  } catch (error) {
    console.error('水平翻转失败:', error);
  }
};

/**
 * 垂直翻转图像
 * @param {Object} viewport - Cornerstone viewport实例
 */
export const flipVertical = (viewport) => {
  if (!viewport) return;

  try {
    const currentProperties = viewport.getProperties();
    const newFlipV = !currentProperties.flipVertical;

    viewport.setProperties({
      flipVertical: newFlipV,
    });

    viewport.render();
    console.log(`图像垂直翻转: ${newFlipV ? '开启' : '关闭'}`);
  } catch (error) {
    console.error('垂直翻转失败:', error);
  }
};

/**
 * 旋转图像
 * @param {Object} viewport - Cornerstone viewport实例
 * @param {number} angle - 旋转角度（度）
 */
export const rotateImage = (viewport, angle) => {
  if (!viewport) return;

  try {
    const currentProperties = viewport.getProperties();
    const currentRotation = currentProperties.rotation || 0;
    const newRotation = (currentRotation + angle) % 360;

    viewport.setProperties({
      rotation: newRotation,
    });

    viewport.render();
    console.log(`图像旋转到: ${newRotation}度`);
  } catch (error) {
    console.error('旋转图像失败:', error);
  }
};

/**
 * 反色图像
 * @param {Object} viewport - Cornerstone viewport实例
 */
export const invertImage = (viewport) => {
  if (!viewport) return;

  try {
    const currentProperties = viewport.getProperties();
    const newInvert = !currentProperties.invert;

    viewport.setProperties({
      invert: newInvert,
    });

    viewport.render();
    console.log(`图像反色: ${newInvert ? '开启' : '关闭'}`);
  } catch (error) {
    console.error('反色图像失败:', error);
  }
};

/**
 * 设置窗宽窗位
 * @param {Object} viewport - Cornerstone viewport实例
 * @param {number} width - 窗宽
 * @param {number} center - 窗位
 */
export const setWindowLevel = (viewport, width, center) => {
  if (!viewport) return;

  try {
    viewport.setProperties({
      voiRange: {
        lower: center - width / 2,
        upper: center + width / 2,
      },
    });

    viewport.render();
    console.log(`窗宽窗位设置为: 宽度=${width}, 中心=${center}`);
  } catch (error) {
    console.error('设置窗宽窗位失败:', error);
  }
};

/**
 * 获取当前图像属性
 * @param {Object} viewport - Cornerstone viewport实例
 * @returns {Object} 图像属性对象
 */
export const getImageProperties = (viewport) => {
  if (!viewport) return null;

  try {
    const properties = viewport.getProperties();
    const camera = viewport.getCamera();

    return {
      rotation: properties.rotation || 0,
      flipHorizontal: properties.flipHorizontal || false,
      flipVertical: properties.flipVertical || false,
      invert: properties.invert || false,
      voiRange: properties.voiRange,
      zoom: camera.zoom || 1,
      pan: camera.position || { x: 0, y: 0 },
    };
  } catch (error) {
    console.error('获取图像属性失败:', error);
    return null;
  }
};

/**
 * 缩放图像
 * @param {Object} viewport - Cornerstone viewport实例
 * @param {number} factor - 缩放系数
 */
export const zoomImage = (viewport, factor) => {
  if (!viewport) return;

  try {
    const camera = viewport.getCamera();
    const newZoom = camera.zoom * factor;

    // 限制缩放范围
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom));

    viewport.setCamera({
      zoom: clampedZoom,
    });

    viewport.render();
    console.log(`图像缩放到: ${Math.round(clampedZoom * 100)}%`);
    return clampedZoom;
  } catch (error) {
    console.error('缩放图像失败:', error);
    return 1;
  }
};

/**
 * 平移图像
 * @param {Object} viewport - Cornerstone viewport实例
 * @param {number} deltaX - X轴偏移量
 * @param {number} deltaY - Y轴偏移量
 */
export const panImage = (viewport, deltaX, deltaY) => {
  if (!viewport) return;

  try {
    const camera = viewport.getCamera();
    const currentPosition = camera.position || { x: 0, y: 0 };

    viewport.setCamera({
      position: {
        x: currentPosition.x + deltaX,
        y: currentPosition.y + deltaY,
      },
    });

    viewport.render();
    console.log(`图像平移: (${deltaX}, ${deltaY})`);
  } catch (error) {
    console.error('平移图像失败:', error);
  }
};

/**
 * 适应窗口大小
 * @param {Object} viewport - Cornerstone viewport实例
 */
export const fitToWindow = (viewport) => {
  if (!viewport) return;

  try {
    viewport.resetCamera();
    viewport.render();
    console.log('图像已适应窗口大小');
    return 1; // 返回缩放级别
  } catch (error) {
    console.error('适应窗口失败:', error);
    return 1;
  }
};
