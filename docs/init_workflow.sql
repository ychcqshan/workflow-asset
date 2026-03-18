USE eam_db;

-- 4. 资产业务申请表 (工作流关联表)
CREATE TABLE IF NOT EXISTS `ams_request_bill` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `bill_type` varchar(50) NOT NULL COMMENT '单据类型（领用/退库/调拨/报修/报废）',
  `asset_id` bigint(20) NOT NULL COMMENT '资产ID',
  `initiator_id` bigint(20) NOT NULL COMMENT '发起人ID',
  `initiator_dept_id` bigint(20) NOT NULL COMMENT '发起部门ID',
  `target_user_id` bigint(20) DEFAULT NULL COMMENT '目标办理人ID',
  `target_dept_id` bigint(20) DEFAULT NULL COMMENT '目标部门ID',
  `reason` varchar(500) DEFAULT NULL COMMENT '申请理由',
  `proc_inst_id` varchar(64) DEFAULT NULL COMMENT '流程实例ID',
  `audit_status` int(1) DEFAULT 0 COMMENT '审批状态 (0: 待提交, 1: 审批中, 2: 已通过, 3: 已驳回)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产业务申请表';
