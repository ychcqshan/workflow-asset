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

@Component("assetScrapExecutionListener")
public class AssetScrapExecutionListener implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(AssetScrapExecutionListener.class);

    @Autowired
    private IAmsRequestBillService requestBillService;

    @Autowired
    private IAmsAssetService assetService;

    @Override
    public void execute(DelegateExecution execution) {
        log.info("Asset scrap process completed, finalizing disposal...");
        Long billId = (Long) execution.getVariable("billId");
        Long assetId = (Long) execution.getVariable("assetId");

        AmsRequestBill bill = requestBillService.getById(billId);
        AmsAsset asset = assetService.getById(assetId);

        if (bill != null && asset != null) {
            // 2: 已通过 (报废完成)
            bill.setAuditStatus(2);
            requestBillService.updateById(bill);

            // 彻底标记资产为已报废状态
            asset.setStatus("3"); // 3: 已报废
            assetService.updateById(asset);

            log.info("Asset {} has been officially SCRAPPED (3)", assetId);
        }
    }
}
