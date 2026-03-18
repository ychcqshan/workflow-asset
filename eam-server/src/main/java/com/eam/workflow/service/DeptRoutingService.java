package com.eam.workflow.service;

import com.eam.system.entity.SysDept;
import com.eam.system.service.ISysDeptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("deptRoutingService")
public class DeptRoutingService {

    private static final Logger log = LoggerFactory.getLogger(DeptRoutingService.class);

    @Autowired
    private ISysDeptService deptService;

    /**
     * 动态寻找当前部门的部门长 (Leader)
     */
    public String findDeptLeader(Long deptId) {
        log.info("Finding dept leader for deptId: {}", deptId);
        SysDept dept = deptService.getById(deptId);
        if (dept != null && dept.getLeaderId() != null) {
            log.info("Found leaderId: {} for dept: {}", dept.getLeaderId(), dept.getDeptName());
            return String.valueOf(dept.getLeaderId());
        }
        log.warn("No leader found for deptId: {}, fallback to admin", deptId);
        return "1"; // 默认流转给管理员 (ID: 1)
    }

    /**
     * 动态寻找当前部门（或上级部门）的中心主任 (Director)
     */
    public String findCenterDirector(Long deptId) {
        log.info("Finding center director for deptId: {}", deptId);
        SysDept dept = deptService.getById(deptId);
        if (dept != null && dept.getDirectorId() != null) {
            log.info("Found directorId: {} for dept: {}", dept.getDirectorId(), dept.getDeptName());
            return String.valueOf(dept.getDirectorId());
        }
        // 向上递归找
        if (dept != null && dept.getParentId() != null && dept.getParentId() != 0) {
            log.info("Recursively finding director from parentId: {}", dept.getParentId());
            return findCenterDirector(dept.getParentId());
        }
        log.warn("No director found for deptId: {}, fallback to admin", deptId);
        return "admin"; // 默认流转给管理员
    }
}
