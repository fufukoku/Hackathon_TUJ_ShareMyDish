package org.team.foodshare.exeception;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = -1;
    }

    public BusinessException(String message, int code) {
        super(message);
        this.code = code;
    }
}