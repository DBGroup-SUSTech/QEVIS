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
 * @since 2022-03-09
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("diagnose")
@ApiModel(value = "Diagnose对象", description = "")
public class Diagnose implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "did", type = IdType.AUTO)
    private Integer did;

    @TableField("aid")
    private Integer aid;

    @TableField("content")
    private String content;


}
