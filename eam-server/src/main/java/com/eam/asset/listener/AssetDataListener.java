package com.eam.asset.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import com.eam.asset.entity.AmsAsset;
import com.eam.asset.entity.vo.AssetImportVo;
import com.eam.asset.service.IAmsAssetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;

import java.util.List;

public class AssetDataListener implements ReadListener<AssetImportVo> {

    private static final Logger log = LoggerFactory.getLogger(AssetDataListener.class);
    private static final int BATCH_COUNT = 100;
    private List<AssetImportVo> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);

    private IAmsAssetService assetService;

    public AssetDataListener(IAmsAssetService assetService) {
        this.assetService = assetService;
    }

    @Override
    public void invoke(AssetImportVo data, AnalysisContext context) {
        cachedDataList.add(data);
        if (cachedDataList.size() >= BATCH_COUNT) {
            saveData();
            cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_COUNT);
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        saveData();
        log.info("所有数据解析完成！");
    }

    private void saveData() {
        if (cachedDataList.isEmpty()) {
            return;
        }
        log.info("{}条数据，开始存储数据库！", cachedDataList.size());

        for (AssetImportVo vo : cachedDataList) {
            AmsAsset asset = new AmsAsset();
            BeanUtils.copyProperties(vo, asset);
            asset.setAssetCode(assetService.generateAssetCode(asset.getCategoryId()));
            asset.setStatus("0");
            assetService.save(asset);
        }

        log.info("存储数据库成功！");
    }
}
