package org.team.foodshare.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 13:22
 */

@Data
public class Position {
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
    private double x;

    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
    private double y;

}
