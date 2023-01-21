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

/**
 * <p>
 * 
 * </p>
 *
 * @author carl-rabbit
 * @since 2022-02-14
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("task")
@ApiModel(value = "Task对象", description = "")
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "tid", type = IdType.AUTO)
    private Integer tid;

    @TableField("aid")
    private Integer aid;

    @TableField("vid")
    private Integer vid;

    @TableField("task_id_suffix")
    private String taskIdSuffix;

    @TableField("machine")
    private String machine;

    @TableField("start_time")
    private Integer startTime;

    @TableField("end_time")
    private Integer endTime;

    @TableField("fail")
    private Boolean fail;


}
