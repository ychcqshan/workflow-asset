package com.eam.workflow.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.eam.workflow.entity.AmsRequestBill;

public interface IAmsRequestBillService extends IService<AmsRequestBill> {
    /**
     * 提交流程申请（并触发工作流流转）
     */
    void submitRequest(AmsRequestBill requestBill);

    /**
     * 导出申请单到 Word
     */
    void exportToWord(Long id, jakarta.servlet.http.HttpServletResponse response);
}
