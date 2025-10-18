package org.team.foodshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@MapperScan("org.team.foodshare.Mapper")
@SpringBootApplication
public class FoodshareApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodshareApplication.class, args);
    }

}
