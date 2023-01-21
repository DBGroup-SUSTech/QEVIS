package com.dbgroup.qevis.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dbgroup.qevis.entity.*;
import com.dbgroup.qevis.service.*;
import com.dbgroup.qevis.vo.AidVO;
import com.dbgroup.qevis.vo.GetApplicationListVO;
import com.dbgroup.qevis.vo.TimeIntervalQueryVO;
import com.dbgroup.qevis.vo.TransferVO;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * @author carl-rabbit
 * @since 2022-02-13
 */
@CrossOrigin
@RestController
public class ApplicationController {

    private static final List<String> EXCLUSIVE_APPS = new LinkedList<>();

    static {
        EXCLUSIVE_APPS.add("application_1616983634837_0023");
        EXCLUSIVE_APPS.add("application_1617019920149_0161");
        EXCLUSIVE_APPS.add("application_1635652147748_0016");
        EXCLUSIVE_APPS.add("application_1636380686626_0018");
        EXCLUSIVE_APPS.add("application_1636304334027_0004");
        EXCLUSIVE_APPS.add("application_1636380686626_0024");
    }

    private final ApplicationService applicationService;
    private final VertexService vertexService;
    private final TaskService taskService;
    private final RecordService recordService;
    private final TransferService transferService;
    private final EventService eventService;
    private final DiagnoseService diagnoseService;
    private final CounterService counterService;

    public ApplicationController(ApplicationService applicationService, VertexService vertexService, TaskService taskService, RecordService recordService, TransferService transferService, EventService eventService, DiagnoseService diagnoseService, CounterService counterService) {
        this.applicationService = applicationService;
        this.vertexService = vertexService;
        this.taskService = taskService;
        this.recordService = recordService;
        this.transferService = transferService;
        this.eventService = eventService;
        this.diagnoseService = diagnoseService;
        this.counterService = counterService;
    }

    @RequestMapping(value = "/app-meta-list", method = RequestMethod.POST)
    public List<Map<String, Object>> getApplicationMetaList() {
        return applicationService.listMaps(new QueryWrapper<Application>()
                .notIn("app_id", EXCLUSIVE_APPS)
                .select("aid", "app_id", "query_name"));
    }

    @RequestMapping(value = "/application-by-aid", method = RequestMethod.POST)
    public Map<String, Object> getApplicationByAid(@RequestBody Map<String, Object> map) {
        QueryWrapper<Application> qw = new QueryWrapper<>();
        qw.eq("aid", map.get("aid"));
        qw.select(Application.class, i -> {
            if ("query_dag".equals(i.getColumn())) {
                return (boolean) map.getOrDefault("query_dag", true);
            } else if ("query_plan".equals(i.getColumn())) {
                return (boolean) map.getOrDefault("query_plan", true);
            } else if ("query_string".equals(i.getColumn())) {
                return (boolean) map.getOrDefault("query_string", true);
            }
            return true;
        });
        return applicationService.getMap(qw);
    }

    @RequestMapping(value = "/application-list", method = RequestMethod.POST)
    public List<Map<String, Object>> getApplicationList(@RequestBody GetApplicationListVO applicationVO) {
        QueryWrapper<Application> qw1 = new QueryWrapper<>();
        qw1.notIn("app_id", EXCLUSIVE_APPS);
        qw1.select(Application.class, i -> {
            if ("query_dag".equals(i.getColumn())) {
                return applicationVO.getQueryDag();
            } else if ("query_plan".equals(i.getColumn())) {
                return applicationVO.getQueryPlan();
            } else if ("query_string".equals(i.getColumn())) {
                return applicationVO.getQueryString();
            }
            return true;
        });
        List<Map<String, Object>> applications = applicationService.listMaps(qw1);

        Map<Integer, Map<String, Object>> aidMap = new HashMap<>(applications.size());
        for (Map<String, Object> app : applications) {
            Integer aid = (Integer) app.get("aid");
            aidMap.put(aid, app);
        }

        QueryWrapper<Vertex> qw2 = new QueryWrapper<Vertex>().in("aid", aidMap.keySet());
        List<Map<String, Object>> vertexes = vertexService.listMaps(qw2);

        for (Map<String, Object> vertex : vertexes) {
            Integer aid = (Integer) vertex.get("aid");
            Map<String, Object> app = aidMap.get(aid);
            List<Map<String, Object>> appVertexes;
            if (!app.containsKey("vertexes")) {
                appVertexes = new LinkedList<>();
                app.put("vertexes", appVertexes);
            } else {
                appVertexes = (List<Map<String, Object>>) app.get("vertexes");
            }
            appVertexes.add(vertex);
        }

        return applications;
    }

    @RequestMapping(value = "/vertex-list", method = RequestMethod.POST)
    public List<Map<String, Object>> getVertexListByAid(@RequestBody AidVO aidVO) {
        return vertexService.listMaps(new QueryWrapper<Vertex>()
                .eq("aid", aidVO.getAid())
                .select(Vertex.class, i -> !"aid".equals(i.getColumn())));
    }

    @RequestMapping(value = "/tdag-data", method = RequestMethod.POST)
    public Map<String, Object> getTDAGDataByAid(@RequestBody AidVO aidVO) {
        Integer aid = aidVO.getAid();

        Map<String, Object> resultMap = new HashMap<>();

        QueryWrapper<Task> qw0 = new QueryWrapper<Task>()
                .eq("aid", aid)
                .select("tid", "vid", "task_id_suffix as suffix", "machine",
                        "start_time as start", "end_time as end", "fail");
        List<Map<String, Object>> taskList = taskService.listMaps(qw0);
        resultMap.put("tasks", taskList);

        QueryWrapper<Diagnose> qw1 = new QueryWrapper<Diagnose>()
                .eq("aid", aid)
                .select("content");
        Diagnose diagnose = diagnoseService.getOne(qw1);
        resultMap.put("diagnose", diagnose.getContent());

        QueryWrapper<Event> qw2 = new QueryWrapper<Event>()
                .eq("aid", aid)
                .groupBy("tid", "type")
                .select("tid", "min(timestamp) as t1", "max(timestamp) as t2", "type");
        List<Map<String, Object>> stepInfo = eventService.listMaps(qw2);
        resultMap.put("stepInfo", stepInfo);

        QueryWrapper<Counter> qw3 = new QueryWrapper<Counter>()
                .eq("aid", aid)
                .select("tid", "full_content as content");
        List<Map<String, Object>> counters = counterService.listMaps(qw3);
        resultMap.put("counters", counters);

        return resultMap;
    }


    @RequestMapping(value = "/record-list", method = RequestMethod.POST)
    public List<Map<String, Object>> getRecordListByAid(@RequestBody AidVO aidVO) {
        return recordService.listMaps(new QueryWrapper<Record>()
                .eq("aid", aidVO.getAid())
                .select(Record.class, i -> !"aid".equals(i.getColumn())));
    }

    @RequestMapping(value = "/transfer-list", method = RequestMethod.POST)
    public List<Map<String, Object>> getTransferListByAid(@RequestBody AidVO aidVO) {
        return transferService.listMaps(new QueryWrapper<Transfer>()
                .eq("aid", aidVO.getAid())
                .select(Transfer.class, i -> !"aid".equals(i.getColumn())));
    }

    @RequestMapping(value = "/transfer-by-tid", method = RequestMethod.POST)
    public List<Map<String, Object>> getTransferByTid(@RequestBody TransferVO transferVO) {
        Integer aid = transferVO.getAid();
        Integer tid = transferVO.getTid();
        Integer vid = transferVO.getVid();
        String dirColSel = String.format("IF(dst = %d, 'in', 'out') as dir", tid);
        return transferService.listMaps(new QueryWrapper<Transfer>()
                .eq("aid", aid)
                .and(qw -> qw.eq("src", tid)
                        .or().eq("dst", tid)
                        .or().eq("src_v", vid))
                .select("src", "src_v as srcV", "dst", "type", "csize",
                        "start_time as start", "end_time as end", "rate", "delay",
                        dirColSel));
    }

    @RequestMapping(value = "/event-list", method = RequestMethod.POST)
    public List<Map<String, Object>> getEventList(@RequestBody TimeIntervalQueryVO tiqVO) {
        Integer aid = tiqVO.getAid();
        Integer start = tiqVO.getStart();
        Integer end = tiqVO.getEnd();

        QueryWrapper<Event> qw = new QueryWrapper<Event>().eq("aid", aid);
        if (start != null) {
            qw.gt("timestamp", start);
        }
        if (end != null) {
            qw.le("timestamp", end);
        }
        qw.select(Event.class, i -> !"aid".equals(i.getColumn()));
        return eventService.listMaps(qw);
    }

    @RequestMapping(value = "/execution-data", method = RequestMethod.POST)
    public Map<String, Object> getStaticExecutionData(@RequestBody AidVO aidVO) {
        Integer aid = aidVO.getAid();
        Map<String, Object> resultMap = new HashMap<>();

        QueryWrapper<Record> qw0 = new QueryWrapper<Record>()
                .eq("aid", aid)
                .select("timestamp as t", "machine as m", "content as c");
        List<Map<String, Object>> recordList = recordService.listMaps(qw0);
        resultMap.put("records", recordList);

        QueryWrapper<Transfer> qw1 = new QueryWrapper<Transfer>()
                .eq("aid", aid)
                .eq("delay", 1)     // true
                .select("src", "dst", "src_v", "csize",
                        "start_time as start", "end_time as end");
        List<Map<String, Object>> transferList = transferService.listMaps(qw1);
        resultMap.put("abnormal_transfer", transferList);

//        QueryWrapper<Transfer> qw2 = new QueryWrapper<Transfer>()
//                .eq("aid", aid)
//                .select("src", "dst", "src_v", "csize",
//                        "start_time as start", "end_time as end");
//        List<Map<String, Object>> transferList = transferService.listMaps(qw2);
//        resultMap.put("transfer", transferList);

        return resultMap;
    }

    @RequestMapping(value = "/query-update", method = RequestMethod.POST)
    public Map<String, Object> queryUpdate(@RequestBody TimeIntervalQueryVO tiqVO) {
        Integer aid = tiqVO.getAid();
        Integer start = tiqVO.getStart();
        Integer end = tiqVO.getEnd();

        Map<String, Object> resultMap = new HashMap<>();

        // check application status
        QueryWrapper<Application> qw0 = new QueryWrapper<Application>()
                .eq("aid", aid)
                .select("duration");
        Map<String, Object> app = applicationService.getMap(qw0);
        Integer duration = (Integer) app.get("duration");
        resultMap.put("app_status", start > duration ? "F" : "R");

        if (start <= duration) {
            QueryWrapper<Task> qw1 = new QueryWrapper<Task>()
                    .eq("aid", aid)
                    .between("start_time", start, end)
                    .select("tid", "vid", "machine as m", "task_id_suffix as tis");
            List<Map<String, Object>> newTaskList = taskService.listMaps(qw1);
            resultMap.put("new_tasks", newTaskList);

            QueryWrapper<Event> qw2 = new QueryWrapper<Event>()
                    .eq("aid", aid)
                    .between("timestamp", start, end)
                    .groupBy("tid", "type")
                    .select("tid", "min(timestamp) as st", "max(timestamp) as et", "type");
            List<Map<String, Object>> eventList = eventService.listMaps(qw2);
            resultMap.put("events", eventList);

            QueryWrapper<Record> qw3 = new QueryWrapper<Record>()
                    .eq("aid", aid)
                    .between("timestamp", start, end)
                    .select("timestamp as t", "machine as m", "content as c");
            List<Map<String, Object>> recordList = recordService.listMaps(qw3);
            resultMap.put("records", recordList);

            QueryWrapper<Transfer> qw4 = new QueryWrapper<Transfer>()
                    .eq("aid", aid)
                    .eq("delay", 1)     // true
                    .between("end_time", start, end)
                    .select("src", "dst", "src_v", "csize",
                            "start_time as start", "end_time as end");
            List<Map<String, Object>> transferList = transferService.listMaps(qw4);
            resultMap.put("abnormal_transfer", transferList);

            List<Map<String, Object>> counters = counterService.listMapsOfNewTasks(aid, start, end);
            resultMap.put("counters", counters);
        }

        return resultMap;
    }
}
