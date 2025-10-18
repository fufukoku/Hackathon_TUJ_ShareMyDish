package org.team.foodshare.Mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.team.foodshare.model.FoodRecord;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:33
 */
@Mapper
public interface FoodRecordMapper extends BaseMapper<FoodRecord> {
    @Select("SELECT * FROM food_record " +
            "WHERE y BETWEEN #{lat} - 0.045 AND #{lat} + 0.045 " +
            "AND x BETWEEN #{lon} - 0.059 AND #{lon} + 0.059 " +
            "AND status = 0")
    List<FoodRecord> findFoodsIn5KmSquare(@Param("lat") double lat,
                                          @Param("lon") double lon);
}
