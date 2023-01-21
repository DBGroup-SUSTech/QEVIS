package com.dbgroup.qevis.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dbgroup.qevis.entity.Counter;
import com.dbgroup.qevis.mapper.CounterMapper;
import com.dbgroup.qevis.service.CounterService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-16
 */
@Service
public class CounterServiceImpl extends ServiceImpl<CounterMapper, Counter> implements CounterService {

    @Override
    public List<Map<String, Object>> listMapsOfNewTasks(Integer aid, Integer start, Integer end) {
        return this.getBaseMapper().selectAllByTaskTime(aid, start, end);
    }
}
