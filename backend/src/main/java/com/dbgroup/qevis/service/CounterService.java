package com.dbgroup.qevis.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dbgroup.qevis.entity.Counter;

import java.util.List;
import java.util.Map;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-16
 */
public interface CounterService extends IService<Counter> {

    List<Map<String, Object>> listMapsOfNewTasks(Integer aid, Integer start, Integer end);
}
