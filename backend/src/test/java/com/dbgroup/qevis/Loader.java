package com.dbgroup.qevis;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dbgroup.qevis.entity.*;
import com.dbgroup.qevis.parser.Parser;
import com.dbgroup.qevis.parser.ParserResult;
import com.dbgroup.qevis.service.*;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.io.FileUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class Loader {

    // You need to replace the placeholder `<project root>`.
    public static final String DATA_PATH = "<project root>/data_process/data";

    private static final List<String> EXCLUSIVE_APPS = new LinkedList<>();
    static {
//        EXCLUSIVE_APPS.add("application_1616983634837_0023");
//        EXCLUSIVE_APPS.add("application_1617019920149_0161");
//        EXCLUSIVE_APPS.add("application_1635652147748_0016");
//        EXCLUSIVE_APPS.add("application_1636380686626_0018");
//        EXCLUSIVE_APPS.add("application_1636304334027_0004");
//        EXCLUSIVE_APPS.add("application_1636380686626_0024");
    }

    @Autowired
    ApplicationService applicationService;
    @Autowired
    VertexService vertexService;
    @Autowired
    TaskService taskService;
    @Autowired
    CounterService counterService;
    @Autowired
    TransferService transferService;
    @Autowired
    RecordService recordService;
    @Autowired
    EventService eventService;
    @Autowired
    DiagnoseService diagnoseService;

    @Test
    public void mainLoader() {
//        final File dataDir = new File(DATA_PATH);
//        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
//        if (files == null) {
//            return;
//        }
//        for (File f : files) {
//            System.out.print("Load application " + f.getName());
//            loadApplication(f.getName());
//            System.out.print("Load vertex " + f.getName());
//            loadVertex(f.getName());
//            System.out.print("Load task " + f.getName());
//            loadTask(f.getName());
//            System.out.print("Load counter " + f.getName());
//            loadCounter(f.getName());
//            System.out.print("Load transfer " + f.getName());
//            loadTransfer(f.getName());
//            System.out.print("Load record " + f.getName());
//            loadRecord(f.getName());
//            System.out.print("Load event " + f.getName());
//            loadEvent(f.getName());
//            System.out.println();
//        }

        loadAllApplication();
        loadAllVertex();
        loadAllTask();
        loadAllCounter();
        loadAllTransfer();
        loadAllRecord();
        loadAllEvent();
        loadAllDiagnose();
    }

    @Test
    public void loadAllApplication() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
        for (File f : files) {
            System.out.print("Load application " + f.getName());
            boolean success = loadApplication(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllVertex() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
        for (File f : files) {
            System.out.print("Load vertex " + f.getName());
            boolean success = loadVertex(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllTask() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
        for (File f : files) {
            System.out.print("Load task " + f.getName());
            boolean success = loadTask(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllCounter() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
        for (File f : files) {
            System.out.print("Load counter " + f.getName());
            boolean success = loadCounter(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllTransfer() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
        for (File f : files) {
            System.out.print("Load transfer " + f.getName());
            boolean success = loadTransfer(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllRecord() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
        for (File f : files) {
            System.out.print("Load record " + f.getName());
            boolean success = loadRecord(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllEvent() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
//        boolean success = loadEvent(files[0].getName());
        for (File f : files) {
            System.out.print("Load event " + f.getName());
            boolean success = loadEvent(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    @Test
    public void loadAllDiagnose() {
        final File dataDir = new File(DATA_PATH);
        File[] files = dataDir.listFiles((dir, name) -> new File(dir, name).isDirectory());
        if (files == null) {
            return;
        }
        Arrays.sort(files, Comparator.comparing(File::getName));
//        boolean success = loadDiagnose(files[0].getName());
        for (File f : files) {
            System.out.print("Load diagnose " + f.getName());
            boolean success = loadDiagnose(f.getName());
            System.out.println(success ? " OK" : " failed");
            System.gc();
        }
    }

    private boolean loadApplication(String name) {

        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        Application.ApplicationBuilder applicationBuilder = Application.builder();

        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            String appId = node.path("appId").asText();
            String database = node.path("database").asText();

            applicationBuilder
                    .appId(appId)
                    .databaseName(database);

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        final File baseDir = new File(Paths.get(DATA_PATH, name).toString());

        List<File> sqlFileList = (List<File>) FileUtils.listFiles(baseDir, new String[]{"sql"}, false);
        if (!sqlFileList.isEmpty()) {
            File sqlFile = sqlFileList.get(0);
            String queryName = sqlFile.getName().replace(".sql", "");
            applicationBuilder.queryName(queryName);

            try {
                String queryString = FileUtils.readFileToString(sqlFile, "utf-8");
                applicationBuilder.queryString(queryString);
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }

        List<File> planFileList = (List<File>) FileUtils.listFiles(baseDir, new String[]{"plan"}, false);
        if (!planFileList.isEmpty()) {
            File planFile = planFileList.get(0);
            try {
                String planString = FileUtils.readFileToString(planFile, "utf-8");
                applicationBuilder.queryPlan(planString);
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }

        File dagFile = new File(Paths.get(DATA_PATH, name, "output", "Dag.json").toString());
        try {
            String dagString = FileUtils.readFileToString(dagFile, "utf-8");
            applicationBuilder.queryDag(dagString);
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        // load FullTask
        File fullTaskFile = new File(Paths.get(DATA_PATH, name, "output", "FullTask.json").toString());
        try {
            JsonNode node = new ObjectMapper().readTree(fullTaskFile);
            JsonNode tasks = node.get("changed");

            Set<String> machineSet = new HashSet<>();
            for (JsonNode task : tasks) {
                machineSet.add(task.get("machine_id").asText());
            }
            applicationBuilder.machineNo(machineSet.size());

            Set<String> vertexSet = new HashSet<>();
            for (JsonNode task : tasks) {
                vertexSet.add(task.get("vec_name").asText());
            }
            applicationBuilder
                    .mapNo((int) vertexSet.stream().filter(v -> v.startsWith("Map")).count())
                    .reducerNo((int) vertexSet.stream().filter(v -> v.startsWith("Reducer")).count());

            long minTime = Long.MAX_VALUE, maxTime = Long.MIN_VALUE;
            for (JsonNode task : tasks) {
                minTime = Math.min(task.get("start_time").asLong(), minTime);
                maxTime = Math.max(task.get("end_time").asLong(), maxTime);
            }
            applicationBuilder
                    .referenceTime(String.valueOf(minTime))
                    .duration((int) (maxTime - minTime));

            applicationBuilder.taskNo(tasks.size());

            String firstTaskId = tasks.isEmpty() ? "" : tasks.get(0).get("task_id").asText();
            applicationBuilder.taskIdPrefix(firstTaskId.substring(0, 26));

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        applicationBuilder.status("F");

        applicationService.save(applicationBuilder.build());
        return true;
    }

    private boolean loadVertex(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }
        long referTime = Long.parseLong(app.getReferenceTime());

        List<Vertex> vertexes = new LinkedList<>();

        // load FullTask
        File fullTaskFile = new File(Paths.get(DATA_PATH, name, "output", "FullTask.json").toString());
        try {
            JsonNode node = new ObjectMapper().readTree(fullTaskFile);
            JsonNode tasks = node.get("changed");

            Map<String, List<JsonNode>> vertexMap = new HashMap<>();
            for (JsonNode task : tasks) {
                vertexMap.computeIfAbsent(task.get("vec_name").asText(), k -> new ArrayList<>()).add(task);
            }

            for (Map.Entry<String, List<JsonNode>> e : vertexMap.entrySet()) {
                Vertex.VertexBuilder vb = Vertex.builder();

                long minTime = Long.MAX_VALUE, maxTime = Long.MIN_VALUE;
                for (JsonNode task : e.getValue()) {
                    minTime = Math.min(task.get("start_time").asLong(), minTime);
                    maxTime = Math.max(task.get("end_time").asLong(), maxTime);
                }

                vb.aid(app.getAid())
                        .vertexName(e.getKey())
                        .startTime((int) (minTime - referTime))
                        .endTime((int) (maxTime - referTime))
                        .type(e.getKey().replaceAll("\\d", "").trim());

                vertexes.add(vb.build());
            }
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        vertexService.saveBatch(vertexes);
        return true;
    }

    private boolean loadTask(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }
        long referTime = Long.parseLong(app.getReferenceTime());

        List<Vertex> vertexes = vertexService.list(new QueryWrapper<Vertex>().eq("aid", app.getAid()));
        Map<String, Integer> vidMap = new HashMap<>();
        vertexes.forEach(v -> vidMap.put(v.getVertexName(), v.getVid()));

        List<Task> taskList = new LinkedList<>();

        // load FullTask
        File fullTaskFile = new File(Paths.get(DATA_PATH, name, "output", "FullTask.json").toString());
        try {
            JsonNode node = new ObjectMapper().readTree(fullTaskFile);
            JsonNode tasks = node.get("changed");

            for (JsonNode task : tasks) {
                Task.TaskBuilder tb = Task.builder();

                tb.aid(app.getAid())
                        .vid(vidMap.get(task.get("vec_name").asText()))
                        .taskIdSuffix(task.get("task_id").asText().substring(26))
                        .machine(task.get("machine_id").asText())
                        .startTime((int) (task.get("start_time").asLong() - referTime))
                        .endTime((int) (task.get("end_time").asLong() - referTime))
                        .fail(task.has("fail"));

                taskList.add(tb.build());
            }

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        taskService.saveBatch(taskList);
        return true;
    }

    private boolean loadCounter(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }

        List<Counter> counterList = new LinkedList<>();

        // load FullTask
        File fullTaskFile = new File(Paths.get(DATA_PATH, name, "output", "FullTask.json").toString());
        try {
            JsonNode node = new ObjectMapper().readTree(fullTaskFile);
            JsonNode tasks = node.get("changed");

            for (JsonNode task : tasks) {
                JsonNode counter = task.get("counter");
                if (counter == null) {
                    System.out.println(task.get("task_id").asText() + " : No counter");
                    continue;
                }
                String taskIdSuffix = task.get("task_id").asText()
                        .replace(app.getTaskIdPrefix(), "");
                Task taskRecord = taskService.getOne(new QueryWrapper<Task>()
                        .allEq(new HashMap<String, Object>(){{
                            this.put("aid", app.getAid());
                            this.put("task_id_suffix", taskIdSuffix);
                        }}));
                Integer tid = taskRecord.getTid();

                Map<String, String> counterMap = new HashMap<>();
                for (Iterator<String> it = counter.fieldNames(); it.hasNext(); ) {
                    String field = it.next();
                    String value = counter.get(field).asText();
                    counterMap.put(field, value);
                }

                counterList.add(Counter.builder()
                        .aid(app.getAid())
                        .tid(tid)
                        .fileBytesRead(counterMap.get("FILE_BYTES_READ"))
                        .fileBytesWritten(counterMap.get("FILE_BYTES_WRITTEN"))
                        .hdfsBytesRead(counterMap.get("HDFS_BYTES_READ"))
                        .inputRecordsProcessed(counterMap.get("INPUT_RECORDS_PROCESSED"))
                        .outputRecords(counterMap.get("OUTPUT_RECORDS"))
                        .inputSplitLengthBytes(counterMap.get("INPUT_SPLIT_LENGTH_BYTES"))
                        .outputBytes(counterMap.get("OUTPUT_BYTES"))
                        .shuffleBytes(counterMap.get("SHUFFLE_BYTES"))
                        .shuffleBytesToMem(counterMap.get("SHUFFLE_BYTES_TO_MEM"))
                        .shuffleBytesToDisk(counterMap.get("SHUFFLE_BYTES_TO_DISK"))
                        .shuffleBytesDiskDirect(counterMap.get("SHUFFLE_BYTES_DISK_DIRECT"))
                        .fullContent(new ObjectMapper().writeValueAsString(counterMap))
                        .build());
            }

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        counterService.saveBatch(counterList);
        return true;
    }

    private boolean loadTransfer(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }
        if (EXCLUSIVE_APPS.contains(app.getAppId())) {
            System.out.print(" Skip " + name + ". ");
            return false;
        }
        long referTime = Long.parseLong(app.getReferenceTime());
        String taskIdPrefix = app.getTaskIdPrefix();

        List<Vertex> vertexes = vertexService.list(new QueryWrapper<Vertex>().eq("aid", app.getAid())
                .select("vertex_name", "vid", "end_time"));
        Map<String, Vertex> vMap = new HashMap<>();
        vertexes.forEach(v -> vMap.put(v.getVertexName(), v));
        vertexes.clear();

        List<Task> tasks = taskService.list(new QueryWrapper<Task>().eq("aid", app.getAid())
                .select("task_id_suffix", "tid", "start_time", "end_time"));
        Map<String, Task> tMap = new HashMap<>();
        tasks.forEach(t -> tMap.put(t.getTaskIdSuffix(), t));
        tasks.clear();

        List<Transfer> transferList = new LinkedList<>();

        // load FullFetch
        File fullFetchFile = new File(Paths.get(DATA_PATH, name, "output", "FullFetch.json").toString());
        try {
            JsonParser parser = (new JsonFactory()).createParser(fullFetchFile);
            JsonToken token;

            int counter = 0;
            int checkCount = 50000;

            while(!parser.isClosed() && parser.nextToken() != JsonToken.START_ARRAY);

            while(!parser.isClosed() && parser.nextToken() != JsonToken.END_ARRAY) {
                Transfer.TransferBuilder transferBuilder = Transfer.builder();

                String label = null;
                String src = null;
                String dst = null;
                String srcVtxName = null;
                String type = null;
                Long csize = null;
                Long endTime = null;
                Long startTime = null;
                Float rate = null;

                while(!parser.isClosed()) {
                    token = parser.nextToken();
                    if (JsonToken.END_OBJECT.equals(token)) {
                        break;
                    }
                    if (JsonToken.FIELD_NAME.equals(token)) {
                        String fieldName = parser.getCurrentName();
                        parser.nextToken();
                        switch (fieldName) {
                            case "label": label = parser.getValueAsString(); break;
                            case "src": src = parser.getValueAsString(); break;
                            case "dst": dst = parser.getValueAsString(); break;
                            case "srcVtxName": srcVtxName = parser.getValueAsString(); break;
                            case "type": type = parser.getValueAsString(); break;
                            case "csize": csize = parser.getLongValue(); break;
                            case "startTime": startTime = parser.getLongValue(); break;
                            case "endTime": endTime = parser.getLongValue(); break;
                            case "rate": rate = parser.getFloatValue(); break;
                        }
                    }
                }

                Integer srcId = null;
                Integer srcV = null;
                Integer startTimeInt = null;
                boolean delay;

                assert dst != null;
                String dstTaskIdSuffix = dst.replace(taskIdPrefix, "");
                Task dstTask = tMap.get(dstTaskIdSuffix);

                assert label != null;
                if (label.equals("NORMAL")) {
                    assert src != null;
                    String srcTaskIdSuffix = src.replace(taskIdPrefix, "");
                    Task srcTask = tMap.get(srcTaskIdSuffix);
                    srcId =  srcTask.getTid();
                    assert startTime != null;
                    startTimeInt = (int) (startTime - referTime);
                    delay = srcTask.getEndTime() > dstTask.getStartTime();
                } else {
                    Vertex v = vMap.get(srcVtxName);
                    srcV = v.getVid();
                    delay = v.getEndTime() > dstTask.getStartTime();
                }

                transferBuilder.aid(app.getAid())
                        .src(srcId)
                        .srcV(srcV)
                        .dst(dstTask.getTid())
                        .type(type)
                        .csize(csize == null ? null : String.valueOf(csize))
                        .startTime(startTimeInt)
                        .endTime((int) (endTime - referTime))
                        .rate(rate)
                        .delay(delay);
                transferList.add(transferBuilder.build());

                if (counter >= checkCount) {
                    counter = 0;
                    transferService.saveBatch(transferList);
                    transferList = new LinkedList<>();
                } else {
                    counter++;
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        transferService.saveBatch(transferList);
        return true;
    }

    private boolean loadRecord(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }
        long referTime = Long.parseLong(app.getReferenceTime());

        List<Record> recordList = new LinkedList<>();

        // load FullMon
        File fullMonFile = new File(Paths.get(DATA_PATH, name, "output", "FullMon.json").toString());
        try {
            JsonNode machineDir = new ObjectMapper().readTree(fullMonFile);
            for (Iterator<String> it = machineDir.fieldNames(); it.hasNext(); ) {
                String machine = it.next();

                JsonNode records = machineDir.get(machine);

                for (JsonNode record : records) {
                    long timestamp = Math.round(record.get("timestamp").asDouble());
                    ObjectNode objectNode = (ObjectNode) record;
                    objectNode.remove("timestamp");
                    String content = objectNode.toString();

                    recordList.add(Record.builder()
                            .aid(app.getAid())
                            .timestamp((int) (timestamp - referTime))
                            .machine(machine)
                            .content(content)
                            .build());
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        recordService.saveBatch(recordList);
        return true;
    }

    private boolean loadEvent(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }
        long referTime = Long.parseLong(app.getReferenceTime());
        String taskIdPrefix = app.getTaskIdPrefix();

        List<Task> tasks = taskService.list(new QueryWrapper<Task>().eq("aid", app.getAid()).select("task_id_suffix", "tid"));
        Map<String, Integer> tidMap = new HashMap<>();
        tasks.forEach(t -> tidMap.put(t.getTaskIdSuffix(), t.getTid()));
        tasks.clear();

        List<Event> eventList = new LinkedList<>();

        // load simulation file
        File simFile = new File(Paths.get(DATA_PATH, name, "output", "SimulationFile.json").toString());
        try {
            JsonParser parser = (new JsonFactory()).createParser(simFile);
            JsonToken token;

            String content = "", vertexName = "", taskId = "";
            long timestamp;

            int counter = 0;
            int checkCount = 10000;

            while(!parser.isClosed()) {
                token = parser.nextToken();
                if(JsonToken.FIELD_NAME.equals(token)){
                    String fieldName = parser.getCurrentName();
                    parser.nextToken();
                    switch (fieldName) {
                        case "content":
                            content = parser.getValueAsString();
                            break;
                        case "vec_name":
                            vertexName = parser.getValueAsString();
                            break;
                        case "task_id":
                            taskId = parser.getValueAsString();
                            break;
                        case "timestamp":
                            timestamp = parser.getValueAsLong();
                            ParserResult pr = Parser.parse(timestamp, content, taskId, vertexName);
                            if (pr == null) {
                                break;
                            }
                            Integer tid = tidMap.get(pr.getTaskId().replace(taskIdPrefix, ""));

                            // fix timestamp
                            // because some data use UTC and some use +8
                            // so check them here
                            int tempTimestamp = (int) (pr.getTimestamp() - referTime);
                            if (tempTimestamp < 0) {
                                tempTimestamp += 8 * 3600 * 1000;
                            }

                            eventList.add(Event.builder()
                                    .aid(app.getAid())
                                    .tid(tid)
                                    .timestamp(tempTimestamp)
                                    .type(pr.getEventType().ordinal())
                                    .build());

                            if (counter >= checkCount) {
                                counter = 0;
                                eventService.saveBatch(eventList);
                                eventList = new LinkedList<>();
                            } else {
                                counter++;
                            }
                            break;
                    }
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        eventService.saveBatch(eventList);
        return true;
    }

    private boolean loadDiagnose(String name) {
        final File infoFile = new File(Paths.get(DATA_PATH, name, "info.json").toString());
        String appId;
        try {
            JsonNode node = new ObjectMapper().readTree(infoFile);
            appId = node.path("appId").asText();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        Application app = applicationService.getOne(new QueryWrapper<Application>().eq("app_id", appId));
        if (app == null) {
            return false;
        }
        List<Diagnose> diagnoseList = new LinkedList<>();

        // load diagnose file
        File diagnoseFile = new File(Paths.get(DATA_PATH, name, "output", "Diagnose.json").toString());
        try {
            String diagnoseString = FileUtils.readFileToString(diagnoseFile, "utf-8");
            diagnoseList.add(Diagnose.builder()
                    .aid(app.getAid())
                    .content(diagnoseString)
                    .build());
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }

        diagnoseService.saveBatch(diagnoseList);
        return true;
    }
}
