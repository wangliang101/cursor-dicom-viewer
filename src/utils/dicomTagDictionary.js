const dicomTagDictionary = {
  '00100010': 'Patient's Name',
  '00100020': 'Patient ID',
  '00100030': 'Patient's Birth Date',
  '00100040': 'Patient's Sex',
  '00080020': 'Study Date',
  '00080030': 'Study Time',
  '00080050': 'Accession Number',
  '00080060': 'Modality',
  '00080090': 'Referring Physician's Name',
  '0008103E': 'Series Description',
  '00081030': 'Study Description',
  '00200011': 'Series Number',
  '00200013': 'Instance Number',
  // 添加更多常用的 DICOM tags...
};

export function getTagInfo(tag) {
  // 移除前导 'x' 如果存在
  const cleanTag = tag.startsWith('x') ? tag.slice(1) : tag;
  return dicomTagDictionary[cleanTag] || 'Unknown';
}