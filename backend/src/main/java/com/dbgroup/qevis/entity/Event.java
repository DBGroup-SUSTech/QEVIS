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
 * @since 2022-02-18
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("event")
@ApiModel(value = "Event对象", description = "")
public class Event implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "eid", type = IdType.AUTO)
    private Integer eid;

    @TableField("aid")
    private Integer aid;

    @TableField("tid")
    private Integer tid;

    @TableField("timestamp")
    private Integer timestamp;

    @TableField("type")
    private Integer type;


}
