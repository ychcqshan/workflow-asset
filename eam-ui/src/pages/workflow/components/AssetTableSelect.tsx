import React, { useState } from 'react';
import { Modal, Table, Input, Space, Button } from 'antd';
import { listAsset, Asset } from '../../../api/asset';

interface AssetTableSelectProps {
    value?: number;
    onChange?: (value: number, record: Asset) => void;
    placeholder?: string;
    onSelect?: (record: Asset) => void;
}

const AssetTableSelect: React.FC<AssetTableSelectProps> = ({ onChange, onSelect, placeholder }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Asset[]>([]);
    const [total, setTotal] = useState(0);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [params, setParams] = useState({ pageNum: 1, pageSize: 5, assetName: '' });

    const fetchData = async (newParams = params) => {
        setLoading(true);
        try {
            const res = await listAsset(newParams);
            setData(res.data.records);
            setTotal(res.data.total);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsModalOpen(true);
        fetchData();
    };

    const handleOk = () => {
        if (selectedAsset) {
            onChange?.(selectedAsset.id, selectedAsset);
            onSelect?.(selectedAsset);
            setIsModalOpen(false);
        }
    };

    const columns = [
        { title: '编号', dataIndex: 'assetCode', key: 'assetCode' },
        { title: '名称', dataIndex: 'assetName', key: 'assetName' },
        { title: '规格', dataIndex: 'spec', key: 'spec' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => s === '0' ? '闲置' : (s === '1' ? '在用' : '报修中')
        }
    ];

    return (
        <>
            <Space.Compact style={{ width: '100%' }}>
                <Input
                    readOnly
                    value={selectedAsset?.assetName || ''}
                    placeholder={placeholder || "点击右侧选择资产"}
                />
                <Button type="primary" onClick={handleOpen}>选择</Button>
            </Space.Compact>

            <Modal
                title="选择资产"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleOk}
                width={800}
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="搜索资产名称"
                        onSearch={(v) => {
                            const p = { ...params, assetName: v, pageNum: 1 };
                            setParams(p);
                            fetchData(p);
                        }}
                        enterButton
                    />
                </div>
                <Table
                    loading={loading}
                    dataSource={data}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        current: params.pageNum,
                        pageSize: params.pageSize,
                        total: total,
                        onChange: (page) => {
                            const p = { ...params, pageNum: page };
                            setParams(p);
                            fetchData(p);
                        }
                    }}
                    rowSelection={{
                        type: 'radio',
                        onChange: (_, selectedRows) => {
                            setSelectedAsset(selectedRows[0]);
                        }
                    }}
                />
            </Modal>
        </>
    );
};

export default AssetTableSelect;
