import request from './request';

export interface RequestBill {
    id?: number;
    billType: string;
    assetId: number;
    initiatorId: number;
    initiatorDeptId: number;
    targetUserId?: number;
    targetDeptId?: number;
    reason: string;
    procInstId?: string;
    auditStatus?: number;
    createTime?: string;
    currentTaskName?: string;
}

export const submitRequest = (data: Partial<RequestBill>) => {
    return request.post('/workflow/request/submit', data);
};

export const getMyRequests = (userId: number) => {
    return request.get(`/workflow/request/my-requests/${userId}`);
};

/** 导出资产申请单 Word */
export const exportBillWord = (id: number) => {
    return request.get(`/workflow/request/export/word/${id}`, { responseType: 'blob' });
};

export const getMyTasks = (userId: number) => {
    return request.get(`/workflow/request/my-tasks/${userId}`);
};

export const approveTask = (taskId: string, variables: any) => {
    return request.post(`/workflow/request/approve/${taskId}`, variables);
};

/** 获取流程进度（历史活动节点） */
export const getProcessProgress = (procInstId: string) => {
    return request.get<ProcessProgress[]>(`/workflow/request/progress/${procInstId}`);
};

export interface ProcessProgress {
    activityId: string;
    activityName: string;
    activityType: string;
    assignee: string | null;
    startTime: string | null;
    endTime: string | null;
    durationInMillis: number | null;
    finished: boolean;
}

export interface ProcessDefinition {
    id: string;
    name: string;
    key: string;
    version: number;
    deploymentId: string;
    resourceName: string;
    description: string;
    suspended: boolean;
}

/** 获取流程定义列表 */
export const listDefinitions = () => {
    return request.get<ProcessDefinition[]>('/workflow/definition/list');
};

/** 获取流程定义 XML */
export const getDefinitionXml = (id: string) => {
    return request.get<string>(`/workflow/definition/xml/${id}`, { responseType: 'text' });
};

/** 部署流程 */
export const deployDefinition = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/workflow/definition/deploy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

/** 挂起流程定义 */
export const suspendDefinition = (definitionId: string) => {
    return request.post(`/workflow/definition/suspend/${definitionId}`);
};

/** 激活流程定义 */
export const activateDefinition = (definitionId: string) => {
    return request.post(`/workflow/definition/activate/${definitionId}`);
};

/** 删除部署 */
export const deleteDeployment = (deploymentId: string) => {
    return request.delete(`/workflow/definition/deployment/${deploymentId}`);
};
