package com.dbgroup.qevis.service.impl;

import com.dbgroup.qevis.entity.Task;
import com.dbgroup.qevis.mapper.TaskMapper;
import com.dbgroup.qevis.service.TaskService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-14
 */
@Service
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {

}
