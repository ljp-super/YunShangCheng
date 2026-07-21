package com.macro.mall.filter;

import cn.hutool.json.JSONUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import jakarta.annotation.Resource;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    @Resource
    private ReactiveStringRedisTemplate reactiveStringRedisTemplate;

    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    private static final int MAX_REQUESTS = 100;
    private static final int TIME_WINDOW_SECONDS = 60;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String ip = getClientIp(request);
        String path = request.getPath().value();
        String key = RATE_LIMIT_PREFIX + ip + ":" + path;

        return reactiveStringRedisTemplate.opsForValue().get(key)
                .defaultIfEmpty("0")
                .flatMap(countStr -> {
                    int count = Integer.parseInt(countStr);
                    if (count >= MAX_REQUESTS) {
                        ServerHttpResponse response = exchange.getResponse();
                        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

                        Map<String, Object> body = new HashMap<>();
                        body.put("code", 429);
                        body.put("message", "请求过于频繁，请稍后重试");
                        body.put("data", null);

                        return response.writeWith(Mono.just(response.bufferFactory().wrap(JSONUtil.toJsonStr(body).getBytes(StandardCharsets.UTF_8))));
                    }
                    return reactiveStringRedisTemplate.opsForValue().increment(key)
                            .flatMap(newCount -> reactiveStringRedisTemplate.expire(key, java.time.Duration.ofSeconds(TIME_WINDOW_SECONDS)))
                            .then(chain.filter(exchange));
                });
    }

    private String getClientIp(ServerHttpRequest request) {
        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeaders().getFirst("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeaders().getFirst("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddress() != null ? request.getRemoteAddress().getHostString() : "unknown";
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    @Override
    public int getOrder() {
        return -100;
    }
}