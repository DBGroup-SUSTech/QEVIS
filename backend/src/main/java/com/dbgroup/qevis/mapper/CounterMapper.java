package com.dbgroup.qevis.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dbgroup.qevis.entity.Counter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-16
 */
@Mapper
public interface CounterMapper extends BaseMapper<Counter> {

    List<Map<String, Object>> selectAllByTaskTime(@Param("aid") Integer aid, @Param("start") Integer start, @Param("end") Integer end);
}
