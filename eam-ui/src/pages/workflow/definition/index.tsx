import React, { useEffect, useState } from 'react';
import {
    Table, Button, Card, message, Modal, Upload, Tag, Space,
    Popconfirm, Tooltip, Badge
} from 'antd';
import {
    UploadOutlined, EyeOutlined, PauseCircleOutlined,
    PlayCircleOutlined, DeleteOutlined, CodeOutlined, EditOutlined
} from '@ant-design/icons';
import {
    listDefinitions, getDefinitionXml, deployDefinition,
    suspendDefinition, activateDefinition, deleteDeployment,
    ProcessDefinition
} from '../../../api/workflow';
import BpmnView from '../components/BpmnView';
import BpmnModeler from '../components/BpmnModeler';

const WorkflowDefinitionList: React.FC = () => {
    const [data, setData] = useState<ProcessDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [xmlVisible, setXmlVisible] = useState(false);
    const [currentXml, setCurrentXml] = useState('');
    const [modelerVisible, setModelerVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<ProcessDefinition | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await listDefinitions();
            setData(res.data || []);
        } catch {
            message.error('加载流程定义失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchList(); }, []);

    const handlePreview = async (record: ProcessDefinition) => {
        setCurrentRecord(record);
        try {
            const res = await getDefinitionXml(record.id);
            setCurrentXml(res.data);
            setXmlVisible(true);
        } catch {
            message.error('加载流程图失败');
        }
    };

    const handleEdit = async (record: ProcessDefinition) => {
        setCurrentRecord(record);
        try {
            const res = await getDefinitionXml(record.id);
            setCurrentXml(res.data);
            setModelerVisible(true);
        } catch {
            message.error('加载流程图失败');
        }
    };

    const withLoading = (key: string, fn: () => Promise<void>) => async () => {
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            await fn();
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleSuspend = (record: ProcessDefinition) =>
        withLoading(`suspend_${record.id}`, async () => {
            await suspendDefinition(record.id);
            message.success('已挂起');
            fetchList();
        })();

    const handleActivate = (record: ProcessDefinition) =>
        withLoading(`activate_${record.id}`, async () => {
            await activateDefinition(record.id);
            message.success('已激活');
            fetchList();
        })();

    const handleDelete = (record: ProcessDefinition) =>
        withLoading(`delete_${record.deploymentId}`, async () => {
            await deleteDeployment(record.deploymentId);
            message.success('已删除部署');
            fetchList();
        })();

    const columns = [
        {
            title: '流程名称',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: ProcessDefinition) => (
                <Space>
                    {name || record.key}
                    {record.suspended && <Tag color="orange">已挂起</Tag>}
                </Space>
            ),
        },
        { title: '流程Key', dataIndex: 'key', key: 'key', width: 180 },
        {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            width: 70,
            render: (v: number) => <Tag color="cyan">v{v}</Tag>,
        },
        {
            title: '状态',
            key: 'status',
            width: 90,
            render: (_: any, record: ProcessDefinition) =>
                record.suspended
                    ? <Badge status="warning" text="已挂起" />
                    : <Badge status="success" text="运行中" />,
        },
        { title: '部署ID', dataIndex: 'deploymentId', key: 'deploymentId', width: 220, ellipsis: true },
        {
            title: '操作',
            key: 'action',
            width: 280,
            render: (_: any, record: ProcessDefinition) => (
                <Space size="small">
                    <Tooltip title="查看 BPMN 流程图">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handlePreview(record)}
                        >
                            查看
                        </Button>
                    </Tooltip>

                    <Tooltip title="在线修改流程">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        >
                            编辑
                        </Button>
                    </Tooltip>

                    {record.suspended ? (
                        <Tooltip title="激活后可继续发起新流程实例">
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<PlayCircleOutlined />}
                                loading={!!actionLoading[`activate_${record.id}`]}
                                onClick={() => handleActivate(record)}
                            >
                                激活
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip title="挂起后不能发起新实例，进行中实例继续">
                            <Button
                                size="small"
                                icon={<PauseCircleOutlined />}
                                loading={!!actionLoading[`suspend_${record.id}`]}
                                onClick={() => handleSuspend(record)}
                            >
                                挂起
                            </Button>
                        </Tooltip>
                    )}

                    <Popconfirm
                        title="确认删除此部署？"
                        description="将同时删除相关的运行中实例，操作不可逆！"
                        onConfirm={() => handleDelete(record)}
                        okText="确认删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={!!actionLoading[`delete_${record.deploymentId}`]}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            await deployDefinition(file as File);
            message.success('部署成功');
            onSuccess(null);
            fetchList();
        } catch (err) {
            message.error('部署失败');
            onError(err);
        }
    };

    const handleDeployModeler = async (file: File) => {
        try {
            await deployDefinition(file);
            message.success('部署成功');
            setModelerVisible(false);
            fetchList();
        } catch (err) {
            message.error('部署失败');
        }
    };

    return (
        <>
            <Card
                title="流程引擎管理"
                extra={
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setModelerVisible(true)}
                        >
                            在线设计
                        </Button>
                        <Upload
                            customRequest={customRequest}
                            showUploadList={false}
                            accept=".bpmn20.xml,.bpmn,.xml"
                        >
                            <Button icon={<UploadOutlined />} type="primary">
                                部署新流程
                            </Button>
                        </Upload>
                    </Space>
                }
            >
                <Table
                    loading={loading}
                    dataSource={data}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={`流程图预览 — ${currentRecord?.name || currentRecord?.key || ''}`}
                open={xmlVisible}
                onCancel={() => setXmlVisible(false)}
                footer={null}
                width={1100}
                destroyOnClose
            >
                <BpmnView xml={currentXml} />
            </Modal>

            <BpmnModeler
                visible={modelerVisible}
                onClose={() => {
                    setModelerVisible(false);
                    setCurrentXml('');
                }}
                xml={currentXml}
                onDeploy={handleDeployModeler}
            />
        </>
    );
};

export default WorkflowDefinitionList;
