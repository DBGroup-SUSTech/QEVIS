package com.dbgroup.qevis.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dbgroup.qevis.entity.TestObject;
import org.springframework.stereotype.Repository;

@Repository
public interface TestObjectMapper extends BaseMapper<TestObject> {
    TestObject getFirst();
}