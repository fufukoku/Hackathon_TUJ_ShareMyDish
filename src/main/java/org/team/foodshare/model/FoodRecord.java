package org.team.foodshare.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * @description TODO
 * @author: ksm
 * date: 2025/10/18 10:11
 */

@Data
@TableName("food_record")
public class FoodRecord {

    @TableId(type= IdType.AUTO)
    private int id;

    private String foodName;

    private String description;

    private String foodImage;

    private double x;

    private double y;

    private long expireTime;

    private int userId;

    private int status;
}
