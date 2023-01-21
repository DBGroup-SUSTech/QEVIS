package com.dbgroup.qevis;

import com.dbgroup.qevis.service.ApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class QEVISJavaApplicationTests {

    @Autowired
    ApplicationService applicationService;

    @Test
    void testApplication() {
        System.out.println(applicationService.getAll());
    }

}
