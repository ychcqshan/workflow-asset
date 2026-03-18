import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Card, Tag, Input, Form, Select, Row, Col, message, Modal, DatePicker, Upload, Image, Timeline, Drawer } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, QrcodeOutlined, EditOutlined, DeleteOutlined, ImportOutlined } from '@ant-design/icons';
import { listAsset, Asset, addAsset, updateAsset, deleteAsset, getAsset } from '../../../api/asset';
import { treeCategory, Category } from '../../../api/category';
import request from '../../../api/request';
import dayjs from 'dayjs';

const AssetLedger: React.FC = () => {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [data, setData] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [queryParams, setQueryParams] = useState({ pageNum: 1, pageSize: 10 });
    const [records, setRecords] = useState<any[]>([]);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAsset, setCurrentAsset] = useState<Partial<Asset> | null>(null);

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [currentQrUrl, setCurrentQrUrl] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const values = searchForm.getFieldsValue();
            const res = await listAsset({ ...queryParams, ...values });
            setData(res.data.records || []);
            setTotal(res.data.total || 0);
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await treeCategory();
            setCategories(res.data);
        } catch (error: any) {
            console.error('Fetch categories failed', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [queryParams]);

    const handleSearch = () => {
        setQueryParams({ ...queryParams, pageNum: 1 });
    };

    const handleReset = () => {
        searchForm.resetFields();
        handleSearch();
    };

    const handleAdd = () => {
        setCurrentAsset(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = async (record: Asset) => {
        try {
            const res = await getAsset(record.id);
            const assetData = res.data;
            setCurrentAsset(assetData);
            form.setFieldsValue({
                ...assetData,
                purchaseDate: assetData.purchaseDate ? dayjs(assetData.purchaseDate) : null,
            });
            setIsModalOpen(true);
        } catch (error: any) {
            message.error('获取资产详情失败');
        }
    };

    const handleDelete = (record: Asset) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除资产 [${record.assetName}] 吗？`,
            onOk: async () => {
                try {
                    await deleteAsset(record.id.toString());
                    message.success('删除成功');
                    fetchData();
                } catch (error: any) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleShowQrCode = (record: Asset) => {
        const token = localStorage.getItem('eam_token');
        const url = `/api/asset/ledger/qrcode/${record.id}?token=${token}`;
        setCurrentQrUrl(url);
        setCurrentAsset(record);
        setIsQrModalOpen(true);
    };

    const handleShowTimeline = async (record: Asset) => {
        setCurrentAsset(record);
        try {
            const res = await request.get(`/asset/record/list/${record.id}`);
            setRecords(res.data || []);
            setIsTimelineOpen(true);
        } catch (error: any) {
            message.error('获取履历失败');
        }
    };

    const handleDownloadQrCode = () => {
        if (!currentQrUrl) return;
        const a = document.createElement('a');
        a.href = currentQrUrl;
        a.download = `QR_Asset_${currentAsset?.assetCode}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null,
            };

            if (currentAsset?.id) {
                await updateAsset({ ...payload, id: currentAsset.id });
                message.success('修改成功');
            } else {
                await addAsset(payload);
                message.success('新增成功');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error('Validation failed', error);
        }
    };

    const statusMap: any = {
        '0': { text: '闲置', color: 'default' },
        '1': { text: '在用', color: 'success' },
        '2': { text: '维修', color: 'warning' },
        '3': { text: '报废', color: 'error' },
    };

    const columns = [
        { title: '资产编号', dataIndex: 'assetCode', key: 'assetCode' },
        { title: '资产名称', dataIndex: 'assetName', key: 'assetName' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
            ),
        },
        { title: '规格型号', dataIndex: 'spec', key: 'spec' },
        { title: '存放地点', dataIndex: 'location', key: 'location' },
        { title: '购置日期', dataIndex: 'purchaseDate', key: 'purchaseDate' },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Asset) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleShowTimeline(record)}>履历</Button>
                    <Button type="link" icon={<QrcodeOutlined />} onClick={() => handleShowQrCode(record)}>二维码</Button>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>修改</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
                </Space>
            ),
        },
    ];

    const handleImport = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);
        try {
            // 这里为了简单直接使用 fetch 或 axios，或者封装 api
            const response = await fetch('/api/asset/ledger/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('eam_token')}`
                },
                body: formData
            });
            const res = await response.json();
            if (res.code === 200) {
                message.success('导入成功');
                fetchData();
                onSuccess("ok");
            } else {
                message.error(res.msg || '导入失败');
                onError(new Error(res.msg));
            }
        } catch (error: any) {
            message.error('网络错误，导入失败');
            onError(error);
        }
    };

    return (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Card>
                <Form form={searchForm} layout="inline">
                    <Form.Item label="资产名称" name="assetName">
                        <Input placeholder="请输入名称" allowClear />
                    </Form.Item>
                    <Form.Item label="状态" name="status">
                        <Select placeholder="请选择" style={{ width: 120 }} allowClear>
                            {Object.entries(statusMap).map(([key, val]: any) => (
                                <Select.Option key={key} value={key}>{val.text}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
                        <Button icon={<ReloadOutlined />} style={{ marginLeft: 8 }} onClick={handleReset}>重置</Button>
                    </Form.Item>
                </Form>
            </Card>
            <Card
                title="资产总账"
                extra={
                    <Space>
                        <Upload customRequest={handleImport} showUploadList={false} accept=".xlsx,.xls">
                            <Button icon={<ImportOutlined />}>批量导入</Button>
                        </Upload>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增资产</Button>
                    </Space>
                }
            >
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={{
                        current: queryParams.pageNum,
                        pageSize: queryParams.pageSize,
                        total,
                        onChange: (page, pageSize) => setQueryParams({ ...queryParams, pageNum: page, pageSize }),
                    }}
                />
            </Card>

            <Modal
                title={currentAsset ? '修改资产' : '新增资产'}
                open={isModalOpen}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalOpen(false)}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="资产名称" name="assetName" rules={[{ required: true, message: '请输入资产名称' }]}>
                                <Input placeholder="请输入资产名称" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="资产分类" name="categoryId" rules={[{ required: true, message: '请选择资产分类' }]}>
                                <Select placeholder="请选择分类">
                                    {categories.map(cat => (
                                        <Select.Option key={cat.id} value={cat.id}>{cat.categoryName}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="状态" name="status" initialValue="0">
                                <Select>
                                    {Object.entries(statusMap).map(([key, val]: any) => (
                                        <Select.Option key={key} value={key}>{val.text}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="购置日期" name="purchaseDate">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="规格型号" name="spec">
                                <Input placeholder="请输入规格型号" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="SN 码" name="snCode">
                                <Input placeholder="请输入序列号" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="价格" name="price">
                                <Input type="number" placeholder="请输入价格" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="存放地点" name="location">
                                <Input placeholder="请输入存放地点" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="备注" name="remark">
                                <Input.TextArea placeholder="请输入备注" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="资产二维码"
                open={isQrModalOpen}
                onCancel={() => setIsQrModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsQrModalOpen(false)}>关闭</Button>,
                    <Button key="download" type="primary" onClick={handleDownloadQrCode}>下载图片</Button>,
                    <Button key="print" onClick={() => {
                        const newWin = window.open('', '_blank');
                        if (newWin) {
                            newWin.document.write(`<img src="${currentQrUrl}" onload="window.print();window.close()" />`);
                            newWin.document.close();
                        }
                    }}>打印</Button>
                ]}
            >
                <div style={{ textAlign: 'center' }}>
                    {currentQrUrl && <Image src={currentQrUrl} width={250} preview={false} />}
                    <div style={{ marginTop: 10 }}>资产编码：{currentAsset?.assetCode}</div>
                </div>
            </Modal>

            <Drawer title="资产履历" open={isTimelineOpen} onClose={() => setIsTimelineOpen(false)} width={400}>
                {records.length > 0 ? (
                    <Timeline
                        items={records.map(record => ({
                            color: record.recordType === '入库' ? 'green' : (record.recordType === '维修' ? 'red' : 'blue'),
                            children: (
                                <>
                                    <p style={{ fontWeight: 'bold', margin: 0 }}>{record.recordType}</p>
                                    <p style={{ color: 'gray', fontSize: '12px', margin: '4px 0' }}>{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                                    <p style={{ margin: 0 }}>{record.content}</p>
                                    <p style={{ color: 'gray', fontSize: '12px', marginTop: '4px' }}>操作人 ID: {record.operatorId}</p>
                                </>
                            ),
                        }))}
                    />
                ) : (
                    <div style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>暂无履历记录</div>
                )}
            </Drawer>
        </Space>
    );
};

export default AssetLedger;
