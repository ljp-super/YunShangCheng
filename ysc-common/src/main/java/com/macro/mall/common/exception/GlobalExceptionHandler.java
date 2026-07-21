package com.macro.mall.common.exception;

import com.macro.mall.common.api.CommonResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication.Type;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@ConditionalOnWebApplication(type = Type.SERVLET)
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public CommonResult handleApiException(ApiException e) {
        LOGGER.warn("业务异常: {}", e.getMessage());
        return CommonResult.failed(e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public CommonResult handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        LOGGER.warn("参数校验失败: {}", errors);
        return CommonResult.validateFailed(errors);
    }

    @ExceptionHandler(BindException.class)
    public CommonResult handleBindException(BindException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        LOGGER.warn("参数绑定失败: {}", errors);
        return CommonResult.validateFailed(errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public CommonResult handleIllegalArgumentException(IllegalArgumentException e) {
        LOGGER.warn("非法参数异常: {}", e.getMessage());
        return CommonResult.validateFailed(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public CommonResult handleException(Exception e) {
        LOGGER.error("系统异常: ", e);
        return CommonResult.failed("系统内部错误，请稍后重试");
    }
}