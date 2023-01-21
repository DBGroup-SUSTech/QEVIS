package com.dbgroup.qevis.service;

import com.dbgroup.qevis.entity.TestObject;

import java.util.List;

public interface TestService {
    List<TestObject> getAllTestObject();
    int createTestObject(String str);
    TestObject getFirst();
}
