package org.team.foodshare.model;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("codes")
public class Code {
    private Integer id;
    private String code;
    private int fid;
    private int status;
    private long create_time;

}
