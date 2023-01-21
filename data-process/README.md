### API

|API|Method|Description|Param|Return|
|:---|:---|:---|:---|:---|
|/api/record/|POST|Hive上传数据接口|Record json obj|String|
|/api/dag/|GET|获取DAG数据| |DAG json obj|
|/api/incr/|GET|获取增量数据| |见下|
|/api/simulation/|GET|启动模拟器，模拟系统通过api实时提交数据。暂时不要用这个| |String|
|/api/simulation/local/|GET|启动模拟器，直接本地更新数据。| |String|
|/api/simulation/stop/|GET|停止模拟器| |String|
|/api/simulation/rate/|GET|更改运行模拟器的速率|rate: Speed rate|String|


### Incr 返回逻辑

``` Json
{
    "sim_stop": false,
    "changed": [
        {
            "vec_name": "Map 6",
            "hv_type": "Map",
            "task_id": "attempt_1606268438083_0028_1_01_000005_0",
            "start_time": 1606273099561,
            "end_time": 1606273106988,
            "eov": true,
            "time_len": [
                1.2, 0, 0, 0, 0
            ],
        }
    ]
}
```

1. time的单位均是ms
1. `sim_stop` 为true表示sim已经完成了
1. `changed`是一个List，每一个元素是：上次获取过后，又发生变化的**Task**的数据
1. `changed`中的start和end均是某个vector中的某个task的开始和结束
1. `eov`= end of vector。表示这个change-item是该vector的最后一个。（该vector所有task均完成了）
1. `time_len`是一个包含所有子过程时长的List（非增量）

## Parse流程
sim_parser.py
mon_merge.py
full_task_parser.py
db_data_parser.py
diagnosis_run.py