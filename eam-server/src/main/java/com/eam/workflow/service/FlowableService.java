package com.eam.workflow.service;

import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.engine.history.HistoricActivityInstance;
import org.flowable.task.api.Task;
import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.flowable.bpmn.model.BpmnModel;
import org.flowable.bpmn.BpmnAutoLayout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlowableService {

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private RepositoryService repositoryService;

    @Autowired
    private HistoryService historyService;

    @Autowired
    private org.flowable.engine.ProcessEngine processEngine;

    /**
     * 发起流程
     *
     * @param processDefinitionKey 流程定义Key
     * @param businessKey          业务单据ID
     * @param variables            流程变量
     * @return 流程实例ID
     */
    public String startProcessInstanceByKey(String processDefinitionKey, String businessKey,
            Map<String, Object> variables) {
        ProcessInstance instance = runtimeService.startProcessInstanceByKey(processDefinitionKey, businessKey,
                variables);
        return instance.getId();
    }

    /**
     * 查询个人的待办任务
     *
     * @param assignee 办理人ID
     * @return 任务列表
     */
    public List<Task> getTasksByAssignee(String assignee) {
        return taskService.createTaskQuery()
                .taskAssignee(assignee)
                .orderByTaskCreateTime().desc()
                .list();
    }

    /**
     * 完成任务
     *
     * @param taskId    任务ID
     * @param variables 变量
     */
    public void completeTask(String taskId, Map<String, Object> variables) {
        taskService.complete(taskId, variables);
    }

    /**
     * 根据流程实例ID获取活跃任务
     *
     * @param processInstanceId 流程实例ID
     * @return 活跃任务
     */
    public Task getActiveTaskByProcessInstanceId(String processInstanceId) {
        return taskService.createTaskQuery()
                .processInstanceId(processInstanceId)
                .active()
                .singleResult();
    }

    /**
     * 获取所有部署的流程定义
     */
    public List<org.flowable.engine.repository.ProcessDefinition> listProcessDefinitions() {
        return repositoryService.createProcessDefinitionQuery()
                .latestVersion()
                .orderByProcessDefinitionKey().asc()
                .list();
    }

    /**
     * 获取流程定义 XML 资源流
     */
    public java.io.InputStream getProcessModelStream(String processDefinitionId) {
        org.flowable.bpmn.model.BpmnModel bpmnModel = repositoryService.getBpmnModel(processDefinitionId);
        return repositoryService.getResourceAsStream(
                repositoryService.getProcessDefinition(processDefinitionId).getDeploymentId(),
                repositoryService.getProcessDefinition(processDefinitionId).getResourceName());
    }

    /**
     * 获取流程定义 XML 字符串（含自动排版）
     */
    public String getProcessXml(String processDefinitionId) {
        BpmnModel bpmnModel = repositoryService.getBpmnModel(processDefinitionId);
        if (bpmnModel == null) {
            return null;
        }

        // 自动排版（防止没有坐标点导致 bpmn-js 无法渲染）
        if (bpmnModel.getLocationMap().isEmpty()) {
            new BpmnAutoLayout(bpmnModel).execute();
        }

        BpmnXMLConverter converter = new BpmnXMLConverter();
        byte[] xmlBytes = converter.convertToXML(bpmnModel);
        return new String(xmlBytes, java.nio.charset.StandardCharsets.UTF_8);
    }

    /**
     * 获取流程实例的历史活动节点（含完成时间、执行人）用于进度展示
     */
    public List<HistoricActivityInstance> getHistoricActivitiesByProcInstId(String processInstanceId) {
        return historyService.createHistoricActivityInstanceQuery()
                .processInstanceId(processInstanceId)
                .orderByHistoricActivityInstanceStartTime().asc()
                .list();
    }

    /**
     * 挂起流程定义（不能再发起新实例）
     */
    public void suspendProcessDefinition(String processDefinitionId) {
        repositoryService.suspendProcessDefinitionById(processDefinitionId, false, null);
    }

    /**
     * 激活流程定义
     */
    public void activateProcessDefinition(String processDefinitionId) {
        repositoryService.activateProcessDefinitionById(processDefinitionId, false, null);
    }

    /**
     * 删除部署（cascadeDelete=true 会同时删除运行中的实例）
     */
    public void deleteDeployment(String deploymentId) {
        repositoryService.deleteDeployment(deploymentId, true);
    }

    /**
     * 判断流程定义是否已挂起
     */
    public boolean isProcessDefinitionSuspended(String processDefinitionId) {
        return repositoryService.getProcessDefinition(processDefinitionId).isSuspended();
    }

    /**
     * 获取流程定义图片资源流
     */
    public java.io.InputStream getProcessDiagramStream(String processDefinitionId) {
        org.flowable.bpmn.model.BpmnModel bpmnModel = repositoryService.getBpmnModel(processDefinitionId);
        if (bpmnModel == null) {
            return null;
        }
        
        // 自动排版（防止没有坐标点）
        if (bpmnModel.getLocationMap().isEmpty()) {
            new org.flowable.bpmn.BpmnAutoLayout(bpmnModel).execute();
        }

        org.flowable.engine.ProcessEngineConfiguration config = processEngine.getProcessEngineConfiguration();
        org.flowable.image.ProcessDiagramGenerator diagramGenerator = config.getProcessDiagramGenerator();

        return diagramGenerator.generateDiagram(
                bpmnModel,
                "png",
                config.getActivityFontName(),
                config.getLabelFontName(),
                config.getAnnotationFontName(),
                config.getClassLoader(),
                1.0,
                true
        );
    }
}
