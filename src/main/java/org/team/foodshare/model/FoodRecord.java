package org.team.foodshare.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:11
 */

@Data
@TableName("food_record")
public class FoodRecord {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @NotBlank(message = "Food name cannot be blank")
    private String foodName;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String foodImage;

    @TableField("food_type")
    private String foodType;

    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
    private double x;

    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
    private double y;

    private long expireTime;

    private int status;

    @TableField("create_time")
    private long createTime;

    private String token;
}
