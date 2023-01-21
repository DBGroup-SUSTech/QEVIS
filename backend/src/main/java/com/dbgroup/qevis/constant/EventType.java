package com.dbgroup.qevis.constant;

public enum EventType {
    INPUT,
    PROCESS,
    OUTPUT,

    START,
    END;

    public static EventType getEventType(String mrType, String stepName) {
        if ("Map".equals(mrType)) {
            switch (stepName) {
                case "Initialization":
                case "Input":
                    return INPUT;
                case "Processor": return PROCESS;
                case "Sink":
                case "Spill":
                    return OUTPUT;
            }
        } else if ("Reducer".equals(mrType)) {
            switch (stepName) {
                case "Initialization":
                case "Shuffle":
                    return INPUT;
                case "Processor": return PROCESS;
                case "Sink":
                case "Output":
                    return OUTPUT;
            }
        }
        return null;
    }
}
