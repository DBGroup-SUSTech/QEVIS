package com.dbgroup.qevis.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dbgroup.qevis.entity.Event;
import com.dbgroup.qevis.mapper.EventMapper;
import com.dbgroup.qevis.service.EventService;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-18
 */
@Service
public class EventServiceImpl extends ServiceImpl<EventMapper, Event> implements EventService {

}
