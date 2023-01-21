package com.dbgroup.qevis.controller;

import com.dbgroup.qevis.entity.TestObject;
import com.dbgroup.qevis.service.TestService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TestController {

    private final TestService testService;
    private final Logger logger = LogManager.getLogger(this.getClass().getName());

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping("/test/getAll")
    public List<TestObject> getAllTestObject() {
        return testService.getAllTestObject();
    }

    @GetMapping("/test/getFirst")
    public TestObject getFirst() {
        return testService.getFirst();
    }

    @PostMapping("/test/create")
    public int createTestObject(@RequestParam("str") String str) {
        return testService.createTestObject(str);
    }
}