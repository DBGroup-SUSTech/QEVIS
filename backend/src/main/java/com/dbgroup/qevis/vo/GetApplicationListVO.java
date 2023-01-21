package com.dbgroup.qevis.vo;

import lombok.Data;

@Data
public class GetApplicationListVO {
    private Boolean queryDag = true;
    private Boolean queryString = true;
    private Boolean queryPlan = false;
}

