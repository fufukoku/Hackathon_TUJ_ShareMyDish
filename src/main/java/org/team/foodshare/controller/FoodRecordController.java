package org.team.foodshare.controller;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Resource;
import org.springframework.data.redis.connection.RedisServer;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
import org.team.foodshare.model.Code;
import org.team.foodshare.model.FoodRecord;
import org.team.foodshare.model.Position;
import org.team.foodshare.model.Result;
import org.team.foodshare.service.impl.CodeService;
import org.team.foodshare.service.impl.FoodRecordService;
import org.team.foodshare.utils.MessageSend;
import org.team.foodshare.utils.RedisUtils;

import java.util.List;
import java.util.Map;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:31
 */

@RestController
@RequestMapping("/api/v1/food")

public class FoodRecordController {
    @Resource
    private FoodRecordService foodRecordService;

    @Resource
    private RedisUtils redisUtils;

    @Resource
    private CodeService codeService;



    @PostMapping("/record")
    public Result addFoodRecord(@RequestBody @Nonnull FoodRecord foodRecord) {
        FoodRecord newRecord = new FoodRecord();
        newRecord.setFoodName(foodRecord.getFoodName());
        newRecord.setDescription(foodRecord.getDescription());

        String imagePath = redisUtils.getCacheObject("file_"+foodRecord.getToken());

        newRecord.setX(foodRecord.getX());
        newRecord.setY(foodRecord.getY());
        newRecord.setExpireTime(foodRecord.getExpireTime());
        newRecord.setStatus(0);
        newRecord.setFoodType(foodRecord.getFoodType());
        newRecord.setFoodImage(imagePath);
        newRecord.setCreateTime(System.currentTimeMillis());
        foodRecordService.save(newRecord);

        String claimCode = MessageSend.generateCode().toLowerCase();
        Code code = new Code();
        code.setFid(newRecord.getId().intValue());
        code.setCode(claimCode);
        code.setStatus(0);
        code.setCreate_time(System.currentTimeMillis());
        codeService.save(code);



        return MessageSend.returnSuccess(Map.of(
                "claimCode", claimCode
        ));
    }


    @PostMapping("/view")
    public Result viewFoodRecord(@RequestParam("x") Double latitude,
                                 @RequestParam("y") Double longitude) {

        List<FoodRecord> foodRecords = foodRecordService.get5KmFoods(latitude, longitude);
        return MessageSend.returnSuccess(foodRecords);
    }


    @PostMapping("/claim")
    public Result claimFood(@RequestParam("code") String codeStr, @RequestParam("fid") int fid){
        Code code = codeService.getByCodeAndFid(codeStr, fid);
        if (code == null){
            return MessageSend.returnError(-1, "Invalid code or food ID");

        }

        if (code.getStatus() == 1){
            return MessageSend.returnError(-1, "Code has already been used");
        }


        FoodRecord foodRecord = foodRecordService.getById(fid);
        if (foodRecord == null){
            return MessageSend.returnError(-1, "Food record not found");
        }

        if (foodRecord.getExpireTime() < System.currentTimeMillis()){
            return MessageSend.returnError(-1, "Food item has expired");
        }

        foodRecord.setStatus(1);
        foodRecordService.updateById(foodRecord);

        code.setStatus(1);
        codeService.updateById(code);


        return MessageSend.returnSuccess("Food item claimed successfully");

    }





}

