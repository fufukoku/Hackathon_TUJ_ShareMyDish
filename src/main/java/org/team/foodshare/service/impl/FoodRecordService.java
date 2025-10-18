package org.team.foodshare.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.team.foodshare.Mapper.FoodRecordMapper;
import org.team.foodshare.model.FoodRecord;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:38
 */
@Service
public class FoodRecordService extends ServiceImpl<FoodRecordMapper, FoodRecord> {

    @Resource
    private FoodRecordMapper foodRecordMapper;

    public List<FoodRecord> get5KmFoods(double userLat, double userLon) {
        List<FoodRecord> foods = foodRecordMapper.findFoodsIn5KmSquare(userLat, userLon);
        return foods;
    }
}
