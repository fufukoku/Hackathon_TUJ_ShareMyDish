package org.team.foodshare.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.team.foodshare.model.Result;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:47
 */

@RestController()
@RequestMapping(value = "/api/v1")

public class ServerController {
    @RequestMapping("")
    public Result index() {
        return new Result(200, "Server is running", null);
    }
}
