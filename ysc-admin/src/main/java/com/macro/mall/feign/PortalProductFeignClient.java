package com.macro.mall.feign;

import com.macro.mall.common.api.CommonResult;
import com.macro.mall.feign.fallback.PortalProductFeignClientFallback;
import com.macro.mall.model.PmsProduct;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "mall-portal", fallback = PortalProductFeignClientFallback.class)
public interface PortalProductFeignClient {

    @GetMapping("/product/detail/{id}")
    CommonResult<PmsProduct> getProductDetail(@PathVariable("id") Long id);
}