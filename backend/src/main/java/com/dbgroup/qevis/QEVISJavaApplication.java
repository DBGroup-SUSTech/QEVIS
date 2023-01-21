package com.dbgroup.qevis;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import springfox.documentation.oas.annotations.EnableOpenApi;

@EnableCaching
@EnableOpenApi
@MapperScan("com.dbgroup.qevis.mapper")
@SpringBootApplication
public class QEVISJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(QEVISJavaApplication.class, args);
    }

}
