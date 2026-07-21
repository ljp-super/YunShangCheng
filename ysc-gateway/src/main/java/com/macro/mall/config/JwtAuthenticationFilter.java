package com.macro.mall.config;

import com.macro.mall.common.api.CommonResult;
import com.macro.mall.common.constant.AuthConstant;
import com.macro.mall.common.security.JwtTokenUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GatewayFilter {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IgnoreUrlsConfig ignoreUrlsConfig;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        if (request.getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        if (ignoreUrlsConfig.getUrls().contains(path)) {
            return chain.filter(exchange);
        }

        String token = request.getHeaders().getFirst(AuthConstant.JWT_TOKEN_HEADER);
        if (!StringUtils.hasText(token) || !token.startsWith(AuthConstant.JWT_TOKEN_PREFIX)) {
            return unauthorizedResponse(exchange.getResponse());
        }

        token = token.substring(AuthConstant.JWT_TOKEN_PREFIX.length());

        if (!jwtTokenUtil.validateToken(token)) {
            return unauthorizedResponse(exchange.getResponse());
        }

        Long userId = jwtTokenUtil.getUserIdFromToken(token);
        if (userId == null) {
            return unauthorizedResponse(exchange.getResponse());
        }

        ServerHttpRequest newRequest = request.mutate()
                .header(AuthConstant.USER_TOKEN_HEADER, userId.toString())
                .build();

        return chain.filter(exchange.mutate().request(newRequest).build());
    }

    private Mono<Void> unauthorizedResponse(ServerHttpResponse response) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        CommonResult<Void> result = CommonResult.unauthorized(null);
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(result);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            return response.setComplete();
        }
    }
}