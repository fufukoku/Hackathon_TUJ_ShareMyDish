package org.team.foodshare.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.team.foodshare.Mapper.CodeMapper;
import org.team.foodshare.model.Code;

@Service
public class CodeService extends ServiceImpl<CodeMapper, Code> {

    public Code getByCodeAndFid(String code, int fid) {
        LambdaQueryWrapper<Code> qw = new LambdaQueryWrapper<>();
        qw.eq(Code::getCode, code).eq(Code::getFid, fid);
        return this.getOne(qw);
    }

    public boolean existsByCodeAndFid(String code, int fid) {
        LambdaQueryWrapper<Code> qw = new LambdaQueryWrapper<>();
        qw.eq(Code::getCode, code).eq(Code::getFid, fid);
        return this.count(qw) > 0;
    }

}
