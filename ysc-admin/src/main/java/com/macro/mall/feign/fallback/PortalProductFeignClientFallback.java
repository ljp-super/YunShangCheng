package com.macro.mall.feign.fallback;

import com.macro.mall.common.api.CommonResult;
import com.macro.mall.feign.PortalProductFeignClient;
import com.macro.mall.model.PmsProduct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PortalProductFeignClientFallback implements PortalProductFeignClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(PortalProductFeignClientFallback.class);

    @Override
    public CommonResult<PmsProduct> getProductDetail(Long id) {
        LOGGER.error("mall-portal服务调用失败，返回降级数据，商品ID: {}", id);
        PmsProduct fallbackProduct = new PmsProduct();
        fallbackProduct.setId(id);
        fallbackProduct.setName("商品服务暂时不可用，请稍后重试");
        fallbackProduct.setPrice(java.math.BigDecimal.ZERO);
        return CommonResult.success(fallbackProduct);
    }
}