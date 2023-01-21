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
 * @since 2022-02-16
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("counter")
@ApiModel(value = "Counter对象", description = "")
public class Counter implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "cid", type = IdType.AUTO)
    private Integer cid;

    @TableField("aid")
    private Integer aid;

    @TableField("tid")
    private Integer tid;

    @TableField("file_bytes_read")
    private String fileBytesRead;

    @TableField("file_bytes_written")
    private String fileBytesWritten;

    @TableField("hdfs_bytes_read")
    private String hdfsBytesRead;

    @TableField("input_records_processed")
    private String inputRecordsProcessed;

    @TableField("output_records")
    private String outputRecords;

    @TableField("input_split_length_bytes")
    private String inputSplitLengthBytes;

    @TableField("output_bytes")
    private String outputBytes;

    @TableField("shuffle_bytes")
    private String shuffleBytes;

    @TableField("shuffle_bytes_to_mem")
    private String shuffleBytesToMem;

    @TableField("shuffle_bytes_to_disk")
    private String shuffleBytesToDisk;

    @TableField("shuffle_bytes_disk_direct")
    private String shuffleBytesDiskDirect;

    @TableField("full_content")
    private String fullContent;


}
