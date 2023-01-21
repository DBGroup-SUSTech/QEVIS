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
 * @since 2022-02-24
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("transfer")
@ApiModel(value = "Transfer对象", description = "")
public class Transfer implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "tran_id", type = IdType.AUTO)
    private Integer tranId;

    @TableField("aid")
    private Integer aid;

    @TableField("src")
    private Integer src;

    @TableField("src_v")
    private Integer srcV;

    @TableField("dst")
    private Integer dst;

    @TableField("type")
    private String type;

    @TableField("csize")
    private String csize;

    @TableField("start_time")
    private Integer startTime;

    @TableField("end_time")
    private Integer endTime;

    @TableField("rate")
    private Float rate;

    @TableField("delay")
    private Boolean delay;
}
