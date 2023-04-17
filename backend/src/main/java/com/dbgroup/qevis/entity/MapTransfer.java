package com.dbgroup.qevis.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import io.swagger.annotations.ApiModel;
import lombok.*;

/**
 * <p>
 * 
 * </p>
 *
 * @author carl-rabbit
 * @since 2023-03-28
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("map_transfer")
@ApiModel(value = "MapTransfer对象", description = "")
public class MapTransfer implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "m_tran_id", type = IdType.AUTO)
    private Integer mTranId;

    @TableField("aid")
    private Integer aid;

    @TableField("tid")
    private Integer tid;

    @TableField("content")
    private String content;


}
