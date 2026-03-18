package com.eam.workflow.controller;

import com.eam.asset.service.IAmsAssetService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eam.common.Result;
import com.eam.workflow.entity.AmsRequestBill;
import com.eam.workflow.entity.vo.WorkflowTaskVO;
import com.eam.workflow.service.FlowableService;
import com.eam.workflow.service.IAmsRequestBillService;
import org.flowable.engine.history.HistoricActivityInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.flowable.task.api.Task;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/workflow/request")
public class AmsRequestBillController {

    private static final Logger log = LoggerFactory.getLogger(AmsRequestBillController.class);

    @Autowired
    private IAmsRequestBillService requestBillService;

    @Autowired
    private IAmsAssetService assetService;

    @PostMapping("/submit")
    public Result<Void> submitRequest(@RequestBody AmsRequestBill requestBill) {
        log.info("Submitting request: initiator={}, dept={}, asset={}",
                requestBill.getInitiatorId(), requestBill.getInitiatorDeptId(), requestBill.getAssetId());
        requestBillService.submitRequest(requestBill);
        return Result.success();
    }

    @GetMapping("/my-requests/{userId}")
    public Result<List<AmsRequestBill>> getMyRequests(@PathVariable Long userId) {
        LambdaQueryWrapper<AmsRequestBill> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AmsRequestBill::getInitiatorId, userId);
        queryWrapper.orderByDesc(AmsRequestBill::getCreateTime);
        List<AmsRequestBill> list = requestBillService.list(queryWrapper);

        // 关联查询当前流程节点
        for (AmsRequestBill bill : list) {
            if (bill.getAuditStatus() == 1 && bill.getProcInstId() != null) {
                // 如果是审批中，去查找当前活跃任务
                Task activeTask = flowableService.getActiveTaskByProcessInstanceId(bill.getProcInstId());
                if (activeTask != null) {
                    bill.setCurrentTaskName(activeTask.getName());
                }
            }
        }
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<AmsRequestBill> getById(@PathVariable Long id) {
        return Result.success(requestBillService.getById(id));
    }

    @Autowired
    private FlowableService flowableService;

    @GetMapping("/my-tasks/{userId}")
    public Result<List<WorkflowTaskVO>> getMyTasks(@PathVariable String userId) {
        List<Task> tasks = flowableService.getTasksByAssignee(userId);
        List<WorkflowTaskVO> result = new ArrayList<>();
        for (Task task : tasks) {
            WorkflowTaskVO vo = new WorkflowTaskVO();
            vo.setTaskId(task.getId());
            vo.setTaskName(task.getName());
            vo.setProcessInstanceId(task.getProcessInstanceId());
            vo.setAssignee(task.getAssignee());
            vo.setCreateTime(task.getCreateTime());

            // 关联业务单据信息
            AmsRequestBill bill = requestBillService.getOne(new LambdaQueryWrapper<AmsRequestBill>()
                    .eq(AmsRequestBill::getProcInstId, task.getProcessInstanceId()));
            if (bill != null) {
                vo.setBillId(bill.getId().toString());
                vo.setBillType(bill.getBillType());
                vo.setReason(bill.getReason());
                vo.setAssetId(bill.getAssetId());
                // 填充资产名称
                com.eam.asset.entity.AmsAsset asset = assetService.getById(bill.getAssetId());
                if (asset != null) {
                    vo.setAssetName(asset.getAssetName());
                }
            }
            vo.setProcessDefinitionId(task.getProcessDefinitionId());
            vo.setTaskDefinitionKey(task.getTaskDefinitionKey());
            result.add(vo);
        }
        return Result.success(result);
    }

    @PostMapping("/approve/{taskId}")
    public Result<Void> approveTask(@PathVariable String taskId, @RequestBody Map<String, Object> variables) {
        // variables 里面可以存放 { "approved": true } 之类的走向控制变量
        flowableService.completeTask(taskId, variables);
        return Result.success();
    }

    /**
     * 获取流程进度（历史活动节点）
     * 返回各节点名称、开始结束时间、执行人、是否完成
     */
    @GetMapping("/progress/{procInstId}")
    public Result<List<Map<String, Object>>> getProgress(@PathVariable String procInstId) {
        List<HistoricActivityInstance> activities = flowableService.getHistoricActivitiesByProcInstId(procInstId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (HistoricActivityInstance act : activities) {
            // 跳过网关连线和系统内部事件
            if ("sequenceFlow".equals(act.getActivityType()) ||
                "boundaryEvent".equals(act.getActivityType())) {
                continue;
            }
            Map<String, Object> node = new HashMap<>();
            node.put("activityId", act.getActivityId());
            node.put("activityName", act.getActivityName());
            node.put("activityType", act.getActivityType());
            node.put("assignee", act.getAssignee());
            node.put("startTime", act.getStartTime());
            node.put("endTime", act.getEndTime());
            node.put("durationInMillis", act.getDurationInMillis());
            node.put("finished", act.getEndTime() != null);
            result.add(node);
        }
        return Result.success(result);
    }

    @GetMapping("/export/{id}")
    public void exportToWord(@PathVariable Long id, HttpServletResponse response) {
        log.info("Exporting request bill to Word: id={}", id);
        requestBillService.exportToWord(id, response);
    }
}
