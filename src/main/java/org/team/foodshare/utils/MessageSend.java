package org.team.foodshare.utils;

import org.team.foodshare.model.Result;

import java.util.Map;
import java.security.SecureRandom;

public class MessageSend {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateCode() {
        String chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder sb = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public static Result returnSuccess(int code, Object o) {
        return returnJsonObject(code, o, null);
    }

    public static Result returnSuccess(Object o) {
        return returnJsonObject(null, o, null);
    }

    public static Result returnSuccess(int code) {
        return returnJsonObject(code, null, null);
    }

    public static Result returnSuccess(int code, Object o, String message) {
        return returnJsonObject(code, o, message);
    }

    public static Result returnSuccess(int code, String message) {
        return returnJsonObject(code, null, message);
    }

    public static Result returnSuccess(String message) {
        return returnJsonObject(null, null, message);
    }

    public static Result returnError(int code, String message) {
        return returnJsonObject(code, null, message);
    }

    public static Result returnError(int code) {
        return returnJsonObject(code, null, null);
    }

    public static Result returnJsonObject(Object code, Object o, String message) {
        Result json = new Result();
        if (o == null) {
            o = new Object[]{};
        }
        if (code == null) {
            code = 200;
        }
        if (message != null) {
            json.setMessage(message);
        }

        json.setCode((Integer) code);
        json.setData(o);
        return json;
    }
}