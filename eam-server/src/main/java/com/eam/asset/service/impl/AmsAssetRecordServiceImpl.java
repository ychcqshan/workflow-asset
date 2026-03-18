package com.eam.asset.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.eam.asset.entity.AmsAssetRecord;
import com.eam.asset.mapper.AmsAssetRecordMapper;
import com.eam.asset.service.IAmsAssetRecordService;
import org.springframework.stereotype.Service;

@Service
public class AmsAssetRecordServiceImpl extends ServiceImpl<AmsAssetRecordMapper, AmsAssetRecord> implements IAmsAssetRecordService {
}
