package com.macro.mall.portal.service;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedissonLockService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RedissonLockService.class);

    @Autowired
    private RedissonClient redissonClient;

    private static final String ORDER_LOCK_PREFIX = "order:lock:";
    private static final String STOCK_LOCK_PREFIX = "stock:lock:";

    public boolean tryLock(String lockKey, long waitTime, long leaseTime, TimeUnit unit) {
        RLock lock = redissonClient.getLock(lockKey);
        try {
            boolean locked = lock.tryLock(waitTime, leaseTime, unit);
            if (locked) {
                LOGGER.info("获取分布式锁成功，key: {}", lockKey);
            } else {
                LOGGER.warn("获取分布式锁失败，key: {}", lockKey);
            }
            return locked;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            LOGGER.error("获取分布式锁被中断，key: {}", lockKey, e);
            return false;
        }
    }

    public void unlock(String lockKey) {
        RLock lock = redissonClient.getLock(lockKey);
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
            LOGGER.info("释放分布式锁，key: {}", lockKey);
        }
    }

    public String getOrderLockKey(Long memberId) {
        return ORDER_LOCK_PREFIX + memberId;
    }

    public String getStockLockKey(Long skuId) {
        return STOCK_LOCK_PREFIX + skuId;
    }
}