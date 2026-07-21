package com.macro.mall.common.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtTokenUtil.class);

    @Value("${jwt.secret:mall-admin-secret}")
    private String secret;

    @Value("${jwt.expiration:604800}")
    private Long expiration;

    @Value("${jwt.tokenHeader:Authorization}")
    private String tokenHeader;

    @Value("${jwt.tokenHead:Bearer }")
    private String tokenHead;

    public String generateToken(Long userId) {
        Date nowDate = new Date();
        Date expireDate = new Date(nowDate.getTime() + expiration * 1000);
        return JWT.create()
                .withClaim("userId", userId)
                .withIssuedAt(nowDate)
                .withExpiresAt(expireDate)
                .sign(Algorithm.HMAC256(secret));
    }

    public Long getUserIdFromToken(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            return jwt.getClaim("userId").asLong();
        } catch (JWTDecodeException e) {
            LOGGER.error("JWT decode error: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secret)).build();
            verifier.verify(token);
            return true;
        } catch (Exception e) {
            LOGGER.error("JWT token invalid: {}", e.getMessage());
            return false;
        }
    }

    public String getTokenHeader() {
        return tokenHeader;
    }

    public String getTokenHead() {
        return tokenHead.endsWith(" ") ? tokenHead : tokenHead + " ";
    }

    public Long getExpiration() {
        return expiration;
    }
}