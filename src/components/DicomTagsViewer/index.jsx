import React, { useState, useMemo } from 'react';
import { Table, Input } from 'antd';

const { Search } = Input;

function DicomTagsViewer({ tags }) {
  const [searchText, setSearchText] = useState('');

  if (!tags) {
    return <div>No DICOM tags available</div>;
  }

  const columns = [
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
    },
    {
      title: 'VR',
      dataIndex: 'vr',
      key: 'vr',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text) => <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>,
    },
  ];

  const data = useMemo(() => {
    return Object.entries(tags).map(([tag, { vr, value }]) => {
      return {
        key: tag,
        tag: tag,
        vr: vr,
        value: value || 'N/A',
      };
    });
  }, [tags]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(item => 
      item.tag.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.value && item.value.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [data, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  return (
    <div>
      <Search
        placeholder="搜索 Tag 或值"
        onSearch={handleSearch}
        style={{ marginBottom: 16 }}
      />
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        scroll={{ y: 400 }} 
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
}

export default DicomTagsViewer;