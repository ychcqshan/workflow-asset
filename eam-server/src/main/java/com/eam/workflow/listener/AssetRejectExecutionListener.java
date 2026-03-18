package com.eam.workflow.listener;

import com.eam.workflow.entity.AmsRequestBill;
import com.eam.workflow.service.IAmsRequestBillService;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component("assetRejectExecutionListener")
public class AssetRejectExecutionListener implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(AssetRejectExecutionListener.class);

    @Autowired
    private IAmsRequestBillService requestBillService;

    @Override
    public void execute(DelegateExecution execution) {
        log.info("Process rejected, updating bill status...");
        // 从流程变量中获取单据 ID
        Object billIdObj = execution.getVariable("billId");
        if (billIdObj != null) {
            Long billId = Long.valueOf(billIdObj.toString());
            AmsRequestBill bill = requestBillService.getById(billId);
            if (bill != null) {
                // 3: 已驳回
                bill.setAuditStatus(3);
                requestBillService.updateById(bill);
                log.info("Bill {} status updated to REJECTED (3)", billId);
            }
        }
    }
}
