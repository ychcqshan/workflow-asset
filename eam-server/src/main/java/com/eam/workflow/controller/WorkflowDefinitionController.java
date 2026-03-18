package com.eam.workflow.controller;

import com.eam.common.Result;
import com.eam.workflow.entity.vo.ProcessDefinitionVO;
import com.eam.workflow.service.FlowableService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.ProcessDefinition;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/workflow/definition")
public class WorkflowDefinitionController {

    private static final Logger log = LoggerFactory.getLogger(WorkflowDefinitionController.class);

    @Autowired
    private FlowableService flowableService;

    @Autowired
    private RepositoryService repositoryService;

    @GetMapping("/list")
    public Result<List<ProcessDefinitionVO>> list() {
        List<ProcessDefinition> list = flowableService.listProcessDefinitions();
        List<ProcessDefinitionVO> voList = list.stream().map(pd -> {
            ProcessDefinitionVO vo = new ProcessDefinitionVO();
            vo.setId(pd.getId());
            vo.setName(pd.getName());
            vo.setKey(pd.getKey());
            vo.setVersion(pd.getVersion());
            vo.setDeploymentId(pd.getDeploymentId());
            vo.setResourceName(pd.getResourceName());
            vo.setDescription(pd.getDescription());
            vo.setSuspended(pd.isSuspended());
            return vo;
        }).collect(Collectors.toList());
        return Result.success(voList);
    }

    @GetMapping("/xml/{definitionId}")
    public void getXml(@PathVariable String definitionId, HttpServletResponse response) {
        try {
            response.setContentType("application/xml;charset=UTF-8");
            String xml = flowableService.getProcessXml(definitionId);
            response.getWriter().write(xml);
        } catch (Exception e) {
            log.error("Export BPMN XML error: {}", definitionId, e);
        }
    }

    @GetMapping("/diagram/{definitionId}")
    public void getDiagram(@PathVariable String definitionId, HttpServletResponse response) {
        try (InputStream is = flowableService.getProcessDiagramStream(definitionId)) {
            if (is != null) {
                response.setContentType("image/png");
                StreamUtils.copy(is, response.getOutputStream());
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Export BPMN Diagram error: {}", definitionId, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/deploy")
    public Result<Void> deploy(@RequestParam("file") MultipartFile file) {
        try {
            repositoryService.createDeployment()
                    .addInputStream(file.getOriginalFilename(), file.getInputStream())
                    .deploy();
            return Result.success();
        } catch (Exception e) {
            log.error("Deploy workflow error", e);
            return Result.error("部署失败：" + e.getMessage());
        }
    }

    /** 挂起流程定义 */
    @PostMapping("/suspend/{definitionId}")
    public Result<Void> suspend(@PathVariable String definitionId) {
        try {
            flowableService.suspendProcessDefinition(definitionId);
            return Result.success();
        } catch (Exception e) {
            log.error("Suspend definition error: {}", definitionId, e);
            return Result.error(e.getMessage());
        }
    }

    /** 激活流程定义 */
    @PostMapping("/activate/{definitionId}")
    public Result<Void> activate(@PathVariable String definitionId) {
        try {
            flowableService.activateProcessDefinition(definitionId);
            return Result.success();
        } catch (Exception e) {
            log.error("Activate definition error: {}", definitionId, e);
            return Result.error(e.getMessage());
        }
    }

    /** 删除部署（级联删除实例） */
    @DeleteMapping("/deployment/{deploymentId}")
    public Result<Void> deleteDeployment(@PathVariable String deploymentId) {
        try {
            flowableService.deleteDeployment(deploymentId);
            return Result.success();
        } catch (Exception e) {
            log.error("Delete deployment error: {}", deploymentId, e);
            return Result.error(e.getMessage());
        }
    }
}
