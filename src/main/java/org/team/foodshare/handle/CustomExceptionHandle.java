package org.team.foodshare.handle;

import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.team.foodshare.exeception.BusinessException;
import org.team.foodshare.model.Result;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 12:41
 */

@RestControllerAdvice
@Slf4j
public class CustomExceptionHandle {
    @ExceptionHandler(BusinessException.class)
    public Result handleBusinessException(BusinessException e) {
        log.error("Business exception occurred: {}", e.getMessage());
        return new Result(e.getCode(), e.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error("Validation exception occurred: {}", e.getMessage());
        String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return new Result(400, errorMessage, null);
    }

}
