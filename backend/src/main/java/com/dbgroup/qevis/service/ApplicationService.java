package com.dbgroup.qevis.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dbgroup.qevis.entity.Application;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-13
 */
public interface ApplicationService extends IService<Application> {
    List<Application> getAll();
}
