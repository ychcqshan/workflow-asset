package com.eam.workflow.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;

@TableName("ams_request_bill")
public class AmsRequestBill implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 单据类型：如 领用、退库、调拨、报修、报废
     */
    private String billType;

    /**
     * 关联的资产ID
     */
    private Long assetId;

    /**
     * 发起人ID
     */
    private Long initiatorId;

    /**
     * 发起人归属部门
     */
    private Long initiatorDeptId;

    /**
     * 目标接受人 (调拨/领用)
     */
    private Long targetUserId;

    /**
     * 目标接收部门 (调拨)
     */
    private Long targetDeptId;

    /**
     * 申请理由/故障说明
     */
    private String reason;

    /**
     * 流程实例ID (由于该条记录和流转挂钩)
     */
    private String procInstId;

    /**
     * 审批状态 (0: 待提交, 1: 审批中, 2: 已通过, 3: 已驳回)
     */
    private Integer auditStatus;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    /**
     * 冗余字段：当前任务名称
     */
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private String currentTaskName;

    public String getCurrentTaskName() {
        return currentTaskName;
    }

    public void setCurrentTaskName(String currentTaskName) {
        this.currentTaskName = currentTaskName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillType() {
        return billType;
    }

    public void setBillType(String billType) {
        this.billType = billType;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public Long getInitiatorId() {
        return initiatorId;
    }

    public void setInitiatorId(Long initiatorId) {
        this.initiatorId = initiatorId;
    }

    public Long getInitiatorDeptId() {
        return initiatorDeptId;
    }

    public void setInitiatorDeptId(Long initiatorDeptId) {
        this.initiatorDeptId = initiatorDeptId;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
    }

    public Long getTargetDeptId() {
        return targetDeptId;
    }

    public void setTargetDeptId(Long targetDeptId) {
        this.targetDeptId = targetDeptId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getProcInstId() {
        return procInstId;
    }

    public void setProcInstId(String procInstId) {
        this.procInstId = procInstId;
    }

    public Integer getAuditStatus() {
        return auditStatus;
    }

    public void setAuditStatus(Integer auditStatus) {
        this.auditStatus = auditStatus;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
