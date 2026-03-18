<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: SimSun, "Times New Roman", sans-serif; }
    .title { text-align: center; font-size: 22px; font-weight: bold; margin-top: 10px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #000; padding: 10px; font-size: 14px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; width: 120px; }
    .label { font-weight: bold; background-color: #fafafa; width: 15%; }
    .content { width: 35%; }
</style>
</head>
<body>
<div class="title">企业资产管理系统 - 业务申请单</div>
<table>
    <tr>
        <td class="label">单据编号</td>
        <td class="content">${bill.id!""}</td>
        <td class="label">申请类型</td>
        <td class="content">${bill.billType!""}</td>
    </tr>
    <tr>
        <td class="label">申请人</td>
        <td class="content">${initiatorName!"(ID: " + bill.initiatorId + ")"}</td>
        <td class="label">申请部门</td>
        <td class="content">${deptName!"(ID: " + bill.initiatorDeptId + ")"}</td>
    </tr>
    <tr>
        <td class="label">关联资产</td>
        <td class="content">${asset.assetName!""}</td>
        <td class="label">资产编码</td>
        <td class="content">${asset.assetCode!""}</td>
    </tr>
    <tr>
        <td class="label">审批状态</td>
        <td class="content">
            <#if bill.auditStatus??>
                <#if bill.auditStatus == 0>待提交
                <#elseif bill.auditStatus == 1>审批中
                <#elseif bill.auditStatus == 2>已通过
                <#elseif bill.auditStatus == 3>已驳回
                <#else>未知
                </#if>
            <#else>未知状态
            </#if>
        </td>
        <td class="label">申请时间</td>
        <td class="content">${bill.createTime!""}</td>
    </tr>
    <tr>
        <td class="label">申请原因</td>
        <td colspan="3" style="vertical-align: top; height: 80px;">${bill.reason!""}</td>
    </tr>
</table>

<div style="margin-top: 30px; font-size: 12px; color: #666; text-align: right;">
    导自 EAM 企业资产全生命周期管理系统
</div>
</body>
</html>
