import { useState, useMemo, useEffect } from 'react';
import { Table, Input } from 'antd';
import TAG_DICT from './dicomTag';

const { Search } = Input;

function DicomTagsViewer({ tags }) {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!tags) {
      setSearchText('');
    }
  }, [tags]);

  const columns = [
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      width: 80,
    },
    {
      title: 'VR',
      dataIndex: 'vr',
      key: 'vr',
      width: 40,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (text) => {
        return text || 'Unknown';
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>
      ),
    },
  ];

  const data = useMemo(() => {
    return Object.entries(tags).map(([tag, { vr, value }]) => {
      const formattedTag = `(${tag.slice(1, 5)},${tag.slice(5)})`;
      return {
        key: tag,
        tag: tag,
        vr: vr,
        name: TAG_DICT[formattedTag]?.name || 'Unknown',
        value: value || 'N/A',
      };
    });
  }, [tags]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(
      (item) =>
        item.tag.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.value && item.value.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [data, searchText]);

  if (!tags) {
    return <div>No DICOM tags available</div>;
  }

  const handleSearch = (value) => {
    setSearchText(value);
  };

  return (
    <div>
      <Search
        placeholder="搜索 Tag、名称或值"
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
