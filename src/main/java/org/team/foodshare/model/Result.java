package org.team.foodshare.model;

import lombok.Getter;
import lombok.Setter;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:40
 */
public class Result
{
    @Getter
    @Setter
    private int code;

    @Setter
    @Getter
    private String message;

    @Setter
    @Getter
    private Object data;

    public Result(int code, String message, Object data)
    {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public Result(){
        this.code = -1;
        this.message = "";
        this.data = null;
    }
}
