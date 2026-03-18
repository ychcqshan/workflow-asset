import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Button, message, Modal, Form, Input } from 'antd';
import BillDetail from '../components/BillDetail';
import BpmnView from '../components/BpmnView';
import { getMyTasks, approveTask, getDefinitionXml, exportBillWord } from '../../../api/workflow';

const PendingTasks: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<any>(null);
    const [bpmnXml, setBpmnXml] = useState('');
    const [form] = Form.useForm();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // Note: In a real app we derive userId from user details store (Zustand/Redux)
            const userId = localStorage.getItem('eam_user_id') || '1';
            const res = await getMyTasks(Number(userId));
            setTasks(res.data || []);
        } catch (error: any) {
            message.error('获取待办失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAuditClick = async (task: any) => {
        setCurrentTask(task);
        form.resetFields();
        setIsModalOpen(true);
        // 加载流程库 XML 用于展示
        try {
            const res = await getDefinitionXml(task.processDefinitionId);
            setBpmnXml(res.data);
        } catch (e) {
            console.error('Fetch BPMN error', e);
        }
    };

    const handleAuditSubmit = async (isApproved: boolean) => {
        try {
            const values = await form.validateFields();
            const variables = {
                approved: isApproved,
                comment: values.comment || ''
            };
            await approveTask(currentTask.taskId, variables);
            message.success('审批完成');
            setIsModalOpen(false);
            fetchTasks();
        } catch (error: any) {
            console.error('Validation failed', error);
        }
    };

    const handleExportWord = async (billId: string) => {
        try {
            const response = await exportBillWord(Number(billId));
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `申请单_${billId}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error('导出Word失败');
        }
    };

    const columns = [
        { title: '任务ID', dataIndex: 'taskId', key: 'taskId' },
        { title: '单据类型', dataIndex: 'billType', key: 'billType' },
        { title: '任务名称', dataIndex: 'taskName', key: 'taskName' },
        { title: '理由', dataIndex: 'reason', key: 'reason' },
        { title: '到达时间', dataIndex: 'createTime', key: 'createTime' },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => handleAuditClick(record)}>去审批</Button>
                    {record.billId && (
                        <Button type="link" onClick={() => handleExportWord(record.billId)}>导出Word</Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Card title="我的待办任务">
            <Table
                loading={loading}
                columns={columns}
                dataSource={tasks}
                rowKey="taskId"
            />
            <Modal
                title={`审批任务 - ${currentTask?.taskName}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={1000}
            >
                <div style={{ marginBottom: 24 }}>
                    <BpmnView
                        xml={bpmnXml}
                        activeNodes={currentTask?.taskDefinitionKey ? [currentTask.taskDefinitionKey] : []}
                    />
                </div>
                {currentTask && (
                    <BillDetail
                        assetId={currentTask.assetId}
                        billType={currentTask.billType}
                        reason={currentTask.reason}
                    />
                )}
                <Form form={form} layout="vertical">
                    <Form.Item label="审批意见" name="comment" rules={[{ required: true }]}>
                        <Input.TextArea placeholder="请输入意见" rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" onClick={() => handleAuditSubmit(true)}>同意</Button>
                            <Button danger onClick={() => handleAuditSubmit(false)}>驳回</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default PendingTasks;
