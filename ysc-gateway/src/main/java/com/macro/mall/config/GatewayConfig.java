package com.macro.mall.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("mall-admin", r -> r.path("/admin/**", "/product/**", "/brand/**", "/productCategory/**",
                                "/productAttribute/**", "/sku/**", "/order/**", "/orderSetting/**",
                                "/returnReason/**", "/returnApply/**", "/companyAddress/**",
                                "/coupon/**", "/couponHistory/**", "/flash/**", "/flashSession/**",
                                "/flashProductRelation/**", "/home/**", "/subject/**", "/prefrenceArea/**",
                                "/menu/**", "/role/**", "/resource/**", "/resourceCategory/**", "/memberLevel/**",
                                "/minio/**", "/aliyun/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter))
                        .uri("http://localhost:8081"))
                .build();
    }
}