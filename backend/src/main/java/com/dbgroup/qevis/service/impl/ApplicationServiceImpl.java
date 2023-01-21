package com.dbgroup.qevis.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dbgroup.qevis.entity.Application;
import com.dbgroup.qevis.mapper.ApplicationMapper;
import com.dbgroup.qevis.service.ApplicationService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author carl-rabbit
 */
@Service
public class ApplicationServiceImpl extends ServiceImpl<ApplicationMapper, Application> implements ApplicationService {

    @Override
    public List<Application> getAll() {
        return getBaseMapper().selectList(null);
    }
}
