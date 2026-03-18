package com.eam.workflow.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eam.asset.service.IAmsAssetService;
import com.eam.system.service.ISysUserService;
import com.eam.system.service.ISysDeptService;
import com.eam.system.entity.SysUser;
import com.eam.system.entity.SysDept;
import freemarker.template.Configuration;
import freemarker.template.Template;

import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.eam.workflow.entity.AmsRequestBill;
import com.eam.workflow.mapper.AmsRequestBillMapper;
import com.eam.workflow.service.IAmsRequestBillService;
import com.eam.workflow.service.FlowableService;
import org.flowable.engine.history.HistoricActivityInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AmsRequestBillServiceImpl extends ServiceImpl<AmsRequestBillMapper, AmsRequestBill>
        implements IAmsRequestBillService {

    @Autowired
    private FlowableService flowableService;

    @Autowired
    private IAmsAssetService assetService;

    @Autowired
    private ISysUserService userService;

    @Autowired
    private ISysDeptService deptService;

    @Autowired
    private Configuration freemarkerConfig;

    private static final Logger log = LoggerFactory.getLogger(AmsRequestBillServiceImpl.class);

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitRequest(AmsRequestBill requestBill) {
        // 1. 完善并保存申请单
        requestBill.setCreateTime(LocalDateTime.now());
        // 0: 待提交/初始 1: 审批中 2: 审批通过 3: 驳回
        requestBill.setAuditStatus(1);
        this.save(requestBill);

        // 2. 根据单据类型匹配对应的 BPMN process key
        String processKey = resolveProcessKey(requestBill.getBillType());

        // 3. 构建流程变量 (关键：把发起人部门ID传给流程，用于动态查找领导)
        Map<String, Object> variables = new HashMap<>();
        variables.put("initiatorId", requestBill.getInitiatorId());
        variables.put("initiatorDeptId", requestBill.getInitiatorDeptId());
        variables.put("billId", requestBill.getId());
        variables.put("assetId", requestBill.getAssetId());

        // 4. 启动流程，将单据 ID 作为 businessKey
        String procInstId = flowableService.startProcessInstanceByKey(processKey, String.valueOf(requestBill.getId()),
                variables);

        // 5. 特殊处理：如果是报修申请，提交即锁定资产状态为“报修中”
        if ("报修".equals(requestBill.getBillType())) {
            com.eam.asset.entity.AmsAsset asset = assetService.getById(requestBill.getAssetId());
            if (asset != null) {
                asset.setStatus("2"); // 2: 故障/报修中
                assetService.updateById(asset);
            }
        } else if ("报废".equals(requestBill.getBillType())) {
            com.eam.asset.entity.AmsAsset asset = assetService.getById(requestBill.getAssetId());
            if (asset != null) {
                asset.setStatus("2"); // 报废审批期间也暂存为“故障/不可用”
                assetService.updateById(asset);
            }
        }

        // 6. 反写回来
        requestBill.setProcInstId(procInstId);
        this.updateById(requestBill);
    }

    private String resolveProcessKey(String billType) {
        if ("领用".equals(billType)) {
            return "AssetBorrowProcess";
        } else if ("退库".equals(billType)) {
            return "AssetReturnProcess";
        } else if ("报修".equals(billType)) {
            return "AssetRepairProcess";
        } else if ("报废".equals(billType)) {
            return "AssetScrapProcess";
        }
        // TODO: 可补充更多流程
        throw new RuntimeException("Unsupported bill type");
    }

    @Override
    public void exportToWord(Long id, HttpServletResponse response) {
        try {
            // 1. 获取申请单信息
            AmsRequestBill bill = this.getById(id);
            if (bill == null) {
                throw new RuntimeException("申请单不存在");
            }

            // 2. 补全关联信息
            Map<String, Object> data = new HashMap<>();
            data.put("id", bill.getId());
            data.put("billType", bill.getBillType());
            data.put("reason", bill.getReason() != null ? bill.getReason() : "");
            
            // 格式化时间
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            data.put("createTime", bill.getCreateTime() != null ? bill.getCreateTime().format(dtf) : "");

            // 申请人
            SysUser user = userService.getById(bill.getInitiatorId());
            data.put("initiatorName", user != null ? user.getNickname() : "未知用户");

            // 部门
            SysDept dept = deptService.getById(bill.getInitiatorDeptId());
            data.put("deptName", dept != null ? dept.getDeptName() : "未知部门");

            // 资产详情
            com.eam.asset.entity.AmsAsset asset = assetService.getById(bill.getAssetId());
            if (asset != null) {
                data.put("assetName", asset.getAssetName());
                data.put("assetCode", asset.getAssetCode());
                data.put("spec", asset.getSpec() != null ? asset.getSpec() : "无");
                data.put("location", asset.getLocation() != null ? asset.getLocation() : "无");
            } else {
                data.put("assetName", "未知资产");
                data.put("assetCode", "-");
                data.put("spec", "-");
                data.put("location", "-");
            }

            // 3. 获取审批历史
            List<String> approvalHistoryList = new ArrayList<>();
            if (bill.getProcInstId() != null) {
                List<HistoricActivityInstance> activities = flowableService.getHistoricActivitiesByProcInstId(bill.getProcInstId());
                for (HistoricActivityInstance act : activities) {
                    if ("userTask".equals(act.getActivityType()) && act.getEndTime() != null) {
                        String assignee = act.getAssignee();
                        SysUser appUser = userService.getById(assignee);
                        String name = appUser != null ? appUser.getNickname() : assignee;
                        
                        String info = act.getActivityName() + " [" + name + "] 于 " + 
                                act.getEndTime().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime().format(dtf);
                        approvalHistoryList.add(info);
                    }
                }
            } else {
                approvalHistoryList.add("暂无审批记录");
            }
            data.put("approvalHistoryList", approvalHistoryList);

            // 4. 渲染 Freemarker 模板
            Template template = freemarkerConfig.getTemplate("AssetRequestBill.xml");
            
            // 5. 设置响应头
            String fileName = URLEncoder.encode(bill.getBillType() + "申请单_" + bill.getId() + ".doc", StandardCharsets.UTF_8);
            response.setContentType("application/msword;charset=UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName);

            // 6. 写入输出流
            PrintWriter writer = response.getWriter();
            template.process(data, writer);
            writer.flush();

        } catch (Exception e) {
            log.error("导出 Word 失败", e);
            throw new RuntimeException("导出 Word 失败: " + e.getMessage());
        }
    }
}
