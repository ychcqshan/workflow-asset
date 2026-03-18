import React, { useEffect, useState } from 'react';
import {
    Table, Card, Button, Modal, Form, Input, Select, message, Tag,
    Drawer, Steps, Spin, Tooltip, Space
} from 'antd';
import {
    EyeOutlined, NodeIndexOutlined, PlusOutlined,
    CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined
} from '@ant-design/icons';
import { getMyRequests, submitRequest, getProcessProgress, getDefinitionXml, ProcessProgress, exportBillWord } from '../../../api/workflow';
import BpmnView from '../components/BpmnView';
import AssetTableSelect from '../components/AssetTableSelect';

const statusMap: Record<number, React.ReactNode> = {
    0: <Tag color="default">待提交</Tag>,
    1: <Tag color="blue">审批中</Tag>,
    2: <Tag color="success">已通过</Tag>,
    3: <Tag color="error">已驳回</Tag>,
};

const BILL_TYPE_KEY_MAP: Record<string, string> = {
    '领用': 'AssetBorrowProcess',
    '退库': 'AssetReturnProcess',
    '报修': 'AssetRepairProcess',
    '报废': 'AssetScrapProcess',
};

const MyRequests: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // 流程进度 Drawer
    const [progressDrawerOpen, setProgressDrawerOpen] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);
    const [progressData, setProgressData] = useState<ProcessProgress[]>([]);
    const [currentBpmnXml, setCurrentBpmnXml] = useState('');
    const [activeNodes, setActiveNodes] = useState<string[]>([]);
    const [currentRecord, setCurrentRecord] = useState<any>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem('eam_user_id') || '1';
            const res = await getMyRequests(Number(userId));
            setRequests(res.data || []);
        } catch (error) {
            message.error('获取申请记录失败');
        } finally {
            setLoading(false);
        }
    };

    const handleExportWord = async (id: number) => {
        try {
            const res = await exportBillWord(id);
            // res.data 应该是 Blob 对象
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `资产申请单_${id}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            message.error('导出Word失败');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreate = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const userId = localStorage.getItem('eam_user_id') || '1';
            const deptId = localStorage.getItem('eam_dept_id') || '1';

            await submitRequest({
                ...values,
                initiatorId: Number(userId),
                initiatorDeptId: Number(deptId),
            });
            message.success('申请已提交，流程启动');
            setIsModalOpen(false);
            fetchRequests();
        } catch (error) {
            // 表单校验失败忽略
        }
    };

    const handleViewProgress = async (record: any) => {
        setCurrentRecord(record);
        setProgressDrawerOpen(true);
        setProgressLoading(true);
        setProgressData([]);
        setCurrentBpmnXml('');
        setActiveNodes([]);

        try {
            if (record.procInstId) {
                const [progressRes] = await Promise.allSettled([
                    getProcessProgress(record.procInstId),
                ]);

                if (progressRes.status === 'fulfilled') {
                    const data = progressRes.value.data || [];
                    setProgressData(data);
                    // 找出未完成节点（当前节点）
                    const unfinished = data
                        .filter((d: ProcessProgress) => !d.finished && d.activityType === 'userTask')
                        .map((d: ProcessProgress) => d.activityId);
                    setActiveNodes(unfinished);
                }
            }

            // 加载 BPMN 图（通过 billType 推断 processKey，再列出定义找到最新的）
            // 这里直接调用类型级别简单映射
            // 如果没有 procInstId（未提交），就不展示进度
        } catch (e) {
            message.error('加载进度失败');
        } finally {
            setProgressLoading(false);
        }
    };

    const getStepStatus = (item: ProcessProgress) => {
        if (item.finished) return 'finish';
        if (item.activityType === 'userTask') return 'process';
        return 'wait';
    };

    const getStepIcon = (item: ProcessProgress) => {
        if (item.finished) return <CheckCircleOutlined />;
        if (item.activityType === 'userTask' && !item.finished) return <LoadingOutlined />;
        return <ClockCircleOutlined />;
    };

    const stepItems = progressData.map((item) => ({
        title: item.activityName || item.activityId,
        description: (
            <div style={{ fontSize: 12, color: '#888' }}>
                {item.assignee && <div>办理人: {item.assignee}</div>}
                {item.startTime && <div>开始: {new Date(item.startTime).toLocaleString()}</div>}
                {item.endTime && <div>完成: {new Date(item.endTime).toLocaleString()}</div>}
                {!item.finished && item.activityType === 'userTask' && (
                    <Tag color="blue" style={{ marginTop: 4 }}>当前节点</Tag>
                )}
            </div>
        ),
        status: getStepStatus(item) as any,
        icon: getStepIcon(item),
    }));

    const columns = [
        { title: '单据ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '申请类型', dataIndex: 'billType', key: 'billType', width: 100 },
        { title: '事由', dataIndex: 'reason', key: 'reason', ellipsis: true },
        {
            title: '当前环节',
            dataIndex: 'currentTaskName',
            key: 'currentTaskName',
            width: 120,
            render: (val: string) => val ? <Tag color="processing">{val}</Tag> : '-',
        },
        {
            title: '审核状态',
            dataIndex: 'auditStatus',
            key: 'auditStatus',
            width: 100,
            render: (val: number) => statusMap[val] ?? <Tag>{val}</Tag>,
        },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title={!record.procInstId ? '尚未提交，无流程进度' : ''}>
                        <Button
                            type="link"
                            icon={<NodeIndexOutlined />}
                            disabled={!record.procInstId}
                            onClick={() => handleViewProgress(record)}
                        >
                            进度
                        </Button>
                    </Tooltip>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleExportWord(record.id)}
                    >
                        导出Word
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card
                title="我的申请记录"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        发起新申请
                    </Button>
                }
            >
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* 发起申请弹窗 */}
            <Modal
                title="发起资产业务申请"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="业务类型" name="billType" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="领用">领用申请</Select.Option>
                            <Select.Option value="退库">退库/归还</Select.Option>
                            <Select.Option value="报修">故障报修</Select.Option>
                            <Select.Option value="报废">资产报废</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="相关资产" name="assetId" rules={[{ required: true }]}>
                        <Input type="number" placeholder="请输入资产ID" />
                    </Form.Item>
                    <Form.Item label="申请事由" name="reason" rules={[{ required: true }]}>
                        <Input.TextArea placeholder="请填写此次申请的具体原因" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 流程进度 Drawer */}
            <Drawer
                title={`流程进度 - ${currentRecord?.billType || ''} #${currentRecord?.id || ''}`}
                width={600}
                open={progressDrawerOpen}
                onClose={() => setProgressDrawerOpen(false)}
                destroyOnClose
            >
                <Spin spinning={progressLoading}>
                    {progressData.length > 0 ? (
                        <Steps
                            direction="vertical"
                            items={stepItems}
                            style={{ padding: '8px 0' }}
                        />
                    ) : (
                        !progressLoading && (
                            <div style={{ textAlign: 'center', color: '#999', marginTop: 60 }}>
                                {currentRecord?.procInstId
                                    ? '暂无流程节点数据'
                                    : '该申请尚未生成流程实例'}
                            </div>
                        )
                    )}
                </Spin>
            </Drawer>
        </>
    );
};

export default MyRequests;
