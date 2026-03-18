import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Card, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { treeCategory, Category } from '../../../api/category';

const AssetCategory: React.FC = () => {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await treeCategory();
            setData(res.data);
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { title: '分类名称', dataIndex: 'categoryName', key: 'categoryName' },
        { title: '编码前缀', dataIndex: 'categoryPrefix', key: 'categoryPrefix' },
        { title: '排序', dataIndex: 'orderNum', key: 'orderNum' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (status === '0' ? '正常' : '停用'),
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />}>修改</Button>
                    <Button type="link" icon={<PlusOutlined />}>新增</Button>
                    <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <Card title="资产分类" extra={<Button type="primary" icon={<PlusOutlined />}>新增分类</Button>}>
            <Table
                loading={loading}
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={false}
            />
        </Card>
    );
};

export default AssetCategory;
