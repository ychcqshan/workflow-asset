# EAM Project Sync (Gemini)

> **Last Audit**: 2026-03-15 | **Auditor**: Antigravity Architect

## 📌 项目概览
**EAM (Enterprise Asset Management)** — 企业资产全生命周期管理系统，涵盖资产台账、分类管理、多类型工作流审批（领用/退库/报修/报废）、动态审批寻址等核心功能。

## 🏗️ 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| **后端框架** | Spring Boot | 3.2.3 |
| **ORM** | MyBatis-Plus | 3.5.5 |
| **安全** | Spring Security + JWT (jjwt) | 0.12.5 |
| **工作流引擎** | Flowable | 7.0.0 |
| **前端框架** | React + TypeScript | 18.2 |
| **构建工具** | Vite | 5.1 |
| **UI 库** | Ant Design | 5.15 |
| **状态管理** | Zustand | - |
| **HTTP 客户端** | Axios | - |
| **数据库** | MySQL 8.0 | Docker: `terminal-monitor-mysql` |
| **缓存** | Redis | - |
| **文档工具** | EasyExcel | 3.3.3 |
| **二维码** | ZXing | 3.5.3 |
| **Java** | JDK | 17 |

## 🔌 端口与连接

| 服务 | 端口 | 说明 |
|---|---|---|
| **后端 API** | `9000` | `server.port=9000` |
| **前端 Dev** | `3000` | Vite 默认 |
| **MySQL** | `3306` | Docker: `terminal-monitor-mysql` |
| **Redis** | `6379` | 可选，Token 缓存 |

## 📂 项目结构

### 后端 (`eam-server`) — 57 Java 文件

```
com.eam
├── EamApplication.java              # 启动入口
├── common/                          # 公共层
│   ├── Result.java                  # 统一响应封装
│   ├── GlobalExceptionHandler.java  # 全局异常
│   ├── config/
│   │   ├── SecurityConfig.java      # Spring Security 配置
│   │   ├── JwtAuthenticationFilter.java  # JWT 过滤器
│   │   └── RedisConfig.java         # Redis 序列化配置
│   └── utils/
│       ├── JwtUtils.java            # JWT 工具类
│       └── QRCodeUtils.java         # 二维码生成 (ZXing)
├── system/                          # RBAC 权限模块
│   ├── controller/
│   │   ├── SysLoginController.java  # 登录认证
│   │   ├── SysUserController.java   # 用户 CRUD
│   │   └── SysDeptController.java   # 部门管理
│   ├── entity/
│   │   ├── SysUser.java
│   │   ├── SysRole.java
│   │   ├── SysDept.java             # 含 leaderId, directorId 字段
│   │   └── dto/LoginRequest.java    # 登录 DTO
│   ├── mapper/
│   └── service/
├── asset/                           # 资产台账模块
│   ├── controller/
│   │   ├── AmsAssetController.java  # 资产 CRUD + QR码 + Excel导入
│   │   ├── AmsAssetRecordController.java  # 资产变动记录
│   │   └── AmsCategoryController.java     # 分类树管理
│   ├── entity/
│   │   ├── AmsAsset.java            # 含 status, userId, deptId
│   │   ├── AmsAssetRecord.java
│   │   ├── AmsCategory.java         # 含 categoryCode 自动编码
│   │   └── vo/AssetImportVo.java    # Excel 导入模板
│   ├── listener/AssetDataListener.java  # EasyExcel 行级监听器
│   ├── mapper/
│   └── service/
└── workflow/                        # 工作流模块
    ├── controller/
    │   ├── AmsRequestBillController.java    # 申请提交/审批/待办
    │   └── WorkflowDefinitionController.java # 流程定义CRUD+部署
    ├── entity/
    │   ├── AmsRequestBill.java      # 业务单据 (billType, auditStatus, procInstId)
    │   └── vo/
    │       ├── WorkflowTaskVO.java   # 待办任务 VO (含资产穿透)
    │       └── ProcessDefinitionVO.java  # 流程定义 VO
    ├── listener/                    # BPMN ExecutionListener 实现
    │   ├── AssetStateExecutionListener.java    # 审批通过 → 资产状态流转
    │   ├── AssetRejectExecutionListener.java   # 驳回 → 单据标记 3
    │   ├── AssetScrapExecutionListener.java    # 报废 → 资产标记 3
    │   └── AssetRepairExecutionListener.java   # 报修 → 资产标记 2 (维修中)
    ├── mapper/
    └── service/
        ├── FlowableService.java     # Flowable 核心封装
        ├── DeptRoutingService.java   # 动态审批寻址 (部门长/中心主任)
        ├── IAmsRequestBillService.java
        └── impl/AmsRequestBillServiceImpl.java
```

### BPMN 流程定义 (`resources/processes/`)

| 文件 | 说明 | 触发Listener |
|---|---|---|
| `AssetBorrowProcess.bpmn20.xml` | 领用审批 (部门长→中心主任→资产管理员) | `assetStateExecutionListener` |
| `AssetReturnProcess.bpmn20.xml` | 退库/归还审批 | `assetStateExecutionListener` |
| `AssetRepairProcess.bpmn20.xml` | 故障报修审批 | `assetRepairExecutionListener` |
| `AssetScrapProcess.bpmn20.xml` | 报废审批 | `assetScrapExecutionListener` |

### 前端 (`eam-ui`) — 21 文件

```
src/
├── main.tsx                         # 应用入口
├── App.tsx                          # 路由注册
├── api/
│   ├── request.ts                   # Axios 拦截器 (JWT Bearer)
│   ├── asset.ts                     # 资产 API
│   ├── category.ts                  # 分类 API
│   └── workflow.ts                  # 工作流 API (submit/tasks/approve/definition)
├── store/
│   └── userStore.ts                 # Zustand (Token + UserInfo)
├── layouts/
│   └── BasicLayout.tsx              # Ant Design 侧边栏布局骨架
└── pages/
    ├── login/index.tsx              # 登录页
    ├── asset/
    │   ├── ledger/index.tsx         # 资产台账 (分页+搜索+CRUD+QR+Excel)
    │   └── category/index.tsx       # 资产分类树
    └── workflow/
        ├── request/index.tsx        # 我的申请 (发起 + 列表 + 状态追踪)
        ├── tasks/index.tsx          # 我的待办 (审批 + 同意/驳回 + BPMN图)
        ├── definition/index.tsx     # 流程定义管理 (列表 + 上传部署 + XML预览)
        └── components/
            ├── AssetTableSelect.tsx  # 资产弹窗选择器
            ├── BillDetail.tsx        # 单据详情展示 (含资产规格穿透)
            └── BpmnView.tsx          # BPMN.js 流程图渲染组件
```

### 数据库脚本 (`docs/`)
数据库 eam_db,访问方式：docker exec -i terminal-monitor-mysql mysql -u root -ppassword -D eam_db 
| 文件 | 说明 |
|---|---|
| `init_rbac.sql` | 用户/角色/部门表 + 初始数据 |
| `init_asset.sql` | 资产/分类/标签/变动记录表 |
| `init_workflow.sql` | 业务单据表 `ams_request_bill` |

## 🚀 核心关键设计

### 1. 多级动态审批寻址
`DeptRoutingService` 基于 `initiatorDeptId` 自动匹配：
- **部门长** (`findDeptLeader`): 查 `sys_dept.leader_id`
- **中心主任** (`findCenterDirector`): 查 `sys_dept.director_id`，向上递归

### 2. 资产状态自动机
4 个 `JavaDelegate` Listener 挂载在 BPMN 终端节点：

| 状态码 | 含义 | 触发场景 |
|---|---|---|
| `0` | 闲置 | 退库审批通过 |
| `1` | 在用 | 领用审批通过 |
| `2` | 维修中 | 报修审批通过 |
| `3` | 已报废 | 报废审批通过 |

### 3. 驳回回滚机制
`AssetRejectExecutionListener` 在驳回分支终端将 `auditStatus` 标记为 3（已驳回），资产状态不变。

### 4. 业务单据关联
`WorkflowTaskVO` 实现了 Flowable Task → AmsRequestBill → AmsAsset 的三层穿透查询。

## 📅 开发阶段进度

| 阶段 | 内容 | 状态 |
|---|---|---|
| **Phase 1** | 基建：Spring Boot + Security + JWT + MyBatis-Plus 骨架 | ✅ 完成 |
| **Phase 2** | 资产模块：台账 CRUD、分类树、自动编码、Excel 导入、QR 码 | ✅ 完成 |
| **Phase 3** | 工作流集成：领用流程闭环、动态审批、状态自动流转 | ✅ 完成 |
| **Phase 4** | 流程弹性：驳回/拒绝 + 状态回滚 | ✅ 完成 |
| **Phase 5** | 多业务流：退库、报修、报废分支 | ✅ 完成 |
| **Phase 6** | 引擎管理：流程定义查询、BPMN 图形预览、在线部署 | ✅ 完成 |
| **Phase 7** | 可视化建模：前端集成 BPMN.js 实时预览与修改 | 🔄 进行中 |
| **Phase 8** | 仪表盘 & 统计：资产总览、审批统计、部门资产分布 | ⬜ 待开始 |
| **Phase 9** | 系统管理页面：用户管理、部门管理前端 | ⬜ 待开始 |
| **Phase 10** | 生产加固：权限细化、操作日志、性能优化 | ⬜ 待开始 |

## ⚠️ 踩坑记录
- Lombok 与高版本 JDK (25+) 不兼容，需锁定 JDK 17。
- 不要用 Entity 直接作为登录请求体，会触发 Jackson 反序列化异常，需单独 DTO。
- 停止后端前检查 Java 僵尸进程 (`Get-Process java`)。
- Flowable 序列化变量不要传复杂对象，传基本类型或 `Map<String, Object>`。
- `AmsRequestBill` 没用 Lombok，手写了 getter/setter（可以后续重构加 `@Data`）。
- `application.yml` 敏感信息已用环境变量占位 (`${MYSQL_PWD:password}`)。

## 🚀 启动方式
1. **数据库**: `docker start terminal-monitor-mysql`
   - 连接: `docker exec -i terminal-monitor-mysql mysql -u root -ppassword`
   - 初始化: 依次执行 `docs/init_rbac.sql`, `docs/init_asset.sql`, `docs/init_workflow.sql`
2. **后端**: `cd eam-server && mvn spring-boot:run` (端口 **9000**)
3. **前端**: `cd eam-ui && npm run dev` (端口 **3000**)

## 🔑 API 路径约定
- 系统: `/sys/login`, `/sys/user/**`, `/sys/dept/**`
- 资产: `/asset/ledger/**`, `/asset/category/**`
- 工作流: `/workflow/request/**`, `/workflow/definition/**`

---
*Generated by Antigravity Architect for Project Workflow-Asset.*
