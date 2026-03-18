package com.eam.workflow.listener;

import com.eam.asset.entity.AmsAsset;
import com.eam.asset.service.IAmsAssetService;
import com.eam.workflow.entity.AmsRequestBill;
import com.eam.workflow.service.IAmsRequestBillService;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component("assetRepairExecutionListener")
public class AssetRepairExecutionListener implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(AssetRepairExecutionListener.class);

    @Autowired
    private IAmsRequestBillService requestBillService;

    @Autowired
    private IAmsAssetService assetService;

    @Override
    public void execute(DelegateExecution execution) {
        log.info("Asset repair process completed, restoring state...");
        Long billId = (Long) execution.getVariable("billId");
        Long assetId = (Long) execution.getVariable("assetId");

        AmsRequestBill bill = requestBillService.getById(billId);
        AmsAsset asset = assetService.getById(assetId);

        if (bill != null && asset != null) {
            // 2: 已通过 (维修完成)
            bill.setAuditStatus(2);
            requestBillService.updateById(bill);

            // 维修完成后，资产状态恢复为“在用”（如果之前就在用）或由IT决定
            // 这里简单处理：修复后标记为“闲置”，等待重新领用，或维持“在用”
            // 业务设定：报修不改变所属权，仅暂时标记状态
            asset.setStatus("1"); // 1: 在用
            assetService.updateById(asset);

            log.info("Asset {} repaired and set back to IN_USE (1)", assetId);
        }
    }
}
