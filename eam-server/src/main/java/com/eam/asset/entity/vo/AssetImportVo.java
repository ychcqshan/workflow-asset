package com.eam.asset.entity.vo;

import com.alibaba.excel.annotation.ExcelProperty;
import java.math.BigDecimal;

public class AssetImportVo {

    @ExcelProperty("资产名称")
    private String assetName;
    @ExcelProperty("类别ID")
    private Long categoryId;
    @ExcelProperty("归属部门ID")
    private Long deptId;
    @ExcelProperty("存放地点")
    private String location;
    @ExcelProperty("规格型号")
    private String spec;
    @ExcelProperty("SN码")
    private String snCode;
    @ExcelProperty("价格")
    private BigDecimal price;
    @ExcelProperty("备注")
    private String remark;

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getDeptId() {
        return deptId;
    }

    public void setDeptId(Long deptId) {
        this.deptId = deptId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSpec() {
        return spec;
    }

    public void setSpec(String spec) {
        this.spec = spec;
    }

    public String getSnCode() {
        return snCode;
    }

    public void setSnCode(String snCode) {
        this.snCode = snCode;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
