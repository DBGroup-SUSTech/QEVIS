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
@TableName("vertex")
@ApiModel(value = "Vertex对象", description = "")
public class Vertex implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "vid", type = IdType.AUTO)
    private Integer vid;

    @TableField("aid")
    private Integer aid;

    @TableField("vertex_name")
    private String vertexName;

    @TableField("start_time")
    private Integer startTime;

    @TableField("end_time")
    private Integer endTime;

    @TableField("type")
    private String type;


}
