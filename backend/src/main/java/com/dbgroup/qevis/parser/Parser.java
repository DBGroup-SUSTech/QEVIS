package com.dbgroup.qevis.parser;

import com.dbgroup.qevis.constant.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Data
@AllArgsConstructor
public class Parser {
    private static Pattern timePattern = Pattern.compile("time (.*) (.s)");
    private static Pattern stepNamePattern = Pattern.compile("'(.*)'");

    public static ParserResult parse(long timestamp, String content, String taskId, String vertexName) {
        String mrType = getMRType(vertexName);

        if (content.contains("VertexParallelism")
                || content.contains("InputReader")) {
            return null;
        } else if (content.startsWith("[Fetcher_")
                || content.contains("All inputs fetched for input vertex")) {
            // process data transfer
            return null;
        } else if (content.contains("TaskRunner2Result: TaskRunner2Result")) {
            // process task end result
            return null;
        } else if (content.contains("Container task starting")) {
            return ParserResult.builder()
                    .timestamp(timestamp)
                    .taskId(taskId)
                    .eventType(EventType.START)
                    .build();
        } else if (content.contains("Container task ending")) {
            return ParserResult.builder()
                    .timestamp(timestamp)
                    .taskId(taskId)
                    .eventType(EventType.END)
                    .build();
        } else if (content.contains("Final Counters for")) {
            return null;
        } else if ("Map".equals(mrType)) {
            String stepName = getStepName(content);
            EventType et = EventType.getEventType(mrType, stepName);
            if (et == null) {
                return null;
            }
            return ParserResult.builder()
                    .timestamp(timestamp)
                    .taskId(taskId)
                    .eventType(et)
                    .build();
        } else if ("Reducer".equals(mrType)) {
            String stepName = getStepName(content);
            EventType et = EventType.getEventType(mrType, stepName);
            if (et == null) {
                return null;
            }
            return ParserResult.builder()
                    .timestamp(timestamp)
                    .taskId(taskId)
                    .eventType(et)
                    .build();
        } else {
            System.err.println("Invalid event : \n" + content);
            return null;
        }
    }

    private static String getStepName(String content) {
        Matcher m = stepNamePattern.matcher(content);
        if (!m.find()) {
            System.err.println("getStepName error when parsing " + content);
            return null;
        }
       return m.group(1).trim();
    }

    private static String getMRType(String vertexName) {
        if (vertexName.startsWith("Map")) {
            return "Map";
        } else if (vertexName.startsWith("Reducer")) {
            return "Reducer";
        } else {
            return "";
        }
    }

    private static long getTimeMS(String content) {
        Matcher m = timePattern.matcher(content.replace(":", ""));
        if (m.find()) {
            String timeStr = m.group(1);
            String unit = m.group(2);

            if ("ns".equals(unit)) {
                return Long.parseLong(timeStr) / 1000_000;
            } else {
                return Long.parseLong(timeStr);
            }
        } else {
            System.err.println("getTimeMS error when parsing " + content);
            return 1L;
        }
    }
}
