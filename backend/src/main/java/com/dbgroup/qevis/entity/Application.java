package com.dbgroup.qevis.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 *
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-13
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("application")
@ApiModel(value = "Application对象", description = "")
public class Application implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "aid", type = IdType.AUTO)
    private Integer aid;

    @TableField("app_id")
    private String appId;

    @TableField("database_name")
    private String databaseName;

    @TableField("query_name")
    private String queryName;

    @TableField("query_string")
    private String queryString;

    @TableField("query_plan")
    private String queryPlan;

    @TableField("query_dag")
    private String queryDag;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("status")
    private String status;

    @TableField("duration")
    private Integer duration;

    @TableField("machine_no")
    private Integer machineNo;

    @TableField("map_no")
    private Integer mapNo;

    @TableField("reducer_no")
    private Integer reducerNo;

    @TableField("task_no")
    private Integer taskNo;

    @TableField("reference_time")
    private String referenceTime;

    @TableField("task_id_prefix")
    private String taskIdPrefix;


}

