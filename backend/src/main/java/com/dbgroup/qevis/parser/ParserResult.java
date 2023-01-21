package com.dbgroup.qevis.parser;

import com.dbgroup.qevis.constant.EventType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ParserResult {
    private long timestamp;     // ms
    private String taskId;
    private EventType eventType;
    private double value;
}
