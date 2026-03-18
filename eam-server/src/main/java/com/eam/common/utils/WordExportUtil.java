package com.eam.common.utils;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class WordExportUtil {

    private static Configuration configuration;

    static {
        configuration = new Configuration(Configuration.VERSION_2_3_32);
        configuration.setDefaultEncoding("UTF-8");
        configuration.setClassForTemplateLoading(WordExportUtil.class, "/templates");
    }

    /**
     * Export Word document using FreeMarker template
     *
     * @param dataMap      Data model
     * @param templateName Template file name (e.g., bill.ftl)
     * @param fileName     Export file name (without extension)
     * @param response     HttpServletResponse
     */
    public static void exportWord(Map<String, Object> dataMap, String templateName, String fileName, HttpServletResponse response) {
        try {
            Template template = configuration.getTemplate(templateName);

            // Set response headers for Word document
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/msword");
            response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(fileName + ".doc", StandardCharsets.UTF_8.name()));

            try (PrintWriter out = response.getWriter()) {
                template.process(dataMap, out);
            }
        } catch (IOException | TemplateException e) {
            throw new RuntimeException("Word export failed: " + e.getMessage(), e);
        }
    }
}
