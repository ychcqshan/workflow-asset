USE eam_db;

-- 1. 资产分类表
CREATE TABLE `ams_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` bigint(20) DEFAULT 0 COMMENT '父分类ID',
  `ancestors` varchar(100) DEFAULT '' COMMENT '祖级列表',
  `category_name` varchar(50) NOT NULL COMMENT '分类名称',
  `category_prefix` varchar(10) DEFAULT NULL COMMENT '编码前缀',
  `order_num` int(4) DEFAULT 0 COMMENT '显示顺序',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产分类表';

-- 2. 资产台账表
CREATE TABLE `ams_asset` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '资产ID',
  `asset_code` varchar(64) NOT NULL COMMENT '资产编号',
  `asset_name` varchar(100) NOT NULL COMMENT '资产名称',
  `category_id` bigint(20) NOT NULL COMMENT '类别ID',
  `dept_id` bigint(20) DEFAULT NULL COMMENT '归属部门ID',
  `user_id` bigint(20) DEFAULT NULL COMMENT '使用人ID',
  `status` char(1) DEFAULT '0' COMMENT '资产状态（0闲置 1在用 2维修 3报废）',
  `location` varchar(255) DEFAULT NULL COMMENT '存放存放地点',
  `purchase_date` date DEFAULT NULL COMMENT '购置日期',
  `price` decimal(10,2) DEFAULT 0.00 COMMENT '价格',
  `spec` varchar(255) DEFAULT NULL COMMENT '规格型号',
  `sn_code` varchar(128) DEFAULT NULL COMMENT '产品序列号(SN)',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_asset_code` (`asset_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产台账表';

-- 3. 资产流转履历表
CREATE TABLE `ams_asset_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '履历ID',
  `asset_id` bigint(20) NOT NULL COMMENT '资产ID',
  `record_type` varchar(20) NOT NULL COMMENT '操作类型（入库/分配/维修/退库/报废）',
  `content` text COMMENT '详细内容',
  `operator_id` bigint(20) DEFAULT NULL COMMENT '操作人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产流转履历表';

-- 初始分类数据
INSERT INTO ams_category (category_name, category_prefix, parent_id) VALUES ('电子设备', 'DZ', 0);
INSERT INTO ams_category (category_name, category_prefix, parent_id) VALUES ('笔记本', 'NB', 1);
INSERT INTO ams_category (category_name, category_prefix, parent_id) VALUES ('台式机', 'PC', 1);
INSERT INTO ams_category (category_name, category_prefix, parent_id) VALUES ('办公家具', 'JJ', 0);
