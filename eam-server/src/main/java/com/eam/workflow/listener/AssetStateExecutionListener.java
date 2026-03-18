package com.eam.workflow.listener;

import com.eam.asset.entity.AmsAsset;
import com.eam.asset.service.IAmsAssetService;
import com.eam.workflow.entity.AmsRequestBill;
import com.eam.workflow.service.IAmsRequestBillService;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("assetStateExecutionListener")
public class AssetStateExecutionListener implements JavaDelegate {

    @Autowired
    private IAmsRequestBillService requestBillService;

    @Autowired
    private IAmsAssetService assetService;

    @Override
    public void execute(DelegateExecution execution) {
        // 从流程变量中获取单据 ID 和 资产 ID
        Long billId = (Long) execution.getVariable("billId");
        Long assetId = (Long) execution.getVariable("assetId");

        // 也可以通过预设在 BPMN 里的字段得知是要改成什么状态，或者在这里硬编码
        // 例如我们再加一个流程变量 "targetStatus"
        String targetStatus = (String) execution.getVariable("targetStatus");

        AmsRequestBill bill = requestBillService.getById(billId);
        AmsAsset asset = assetService.getById(assetId);

        if (bill != null && asset != null) {
            // 单据审批完了
            bill.setAuditStatus(2);
            requestBillService.updateById(bill);

            // 修改资产的新状态
            if (targetStatus != null) {
                asset.setStatus(targetStatus);
            } else {
                // 如果是从“领用”流程过来，没传 targetStatus 就默认是：1=在用
                if ("领用".equals(bill.getBillType())) {
                    asset.setStatus("1"); // 1为在用
                    asset.setUserId(bill.getInitiatorId());
                    asset.setDeptId(bill.getInitiatorDeptId());
                } else if ("退库".equals(bill.getBillType())) {
                    asset.setStatus("0"); // 0为闲置
                    asset.setUserId(null); // 退回库房
                }
            }
            assetService.updateById(asset);
        }
    }
}
