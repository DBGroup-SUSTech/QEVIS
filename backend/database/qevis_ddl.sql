create table application
(
    aid            int auto_increment
        primary key,
    app_id         char(30)                            null,
    database_name  varchar(50)                         null,
    query_name     varchar(50)                         null,
    query_string   mediumtext                          null,
    query_plan     mediumtext                          null,
    query_dag      mediumtext                          null,
    create_time    timestamp default CURRENT_TIMESTAMP not null,
    status         char                                null,
    duration       int                                 null,
    machine_no     int                                 null,
    map_no         int                                 null,
    reducer_no     int                                 null,
    task_no        int                                 null,
    reference_time mediumtext                          null,
    task_id_prefix varchar(30)                         null
);

create table counter
(
    cid                       int auto_increment
        primary key,
    aid                       int        null,
    tid                       int        null,
    file_bytes_read           mediumtext null,
    file_bytes_written        mediumtext null,
    hdfs_bytes_read           mediumtext null,
    input_records_processed   mediumtext null,
    output_records            mediumtext null,
    input_split_length_bytes  mediumtext null,
    output_bytes              mediumtext null,
    shuffle_bytes             mediumtext null,
    shuffle_bytes_to_mem      mediumtext null,
    shuffle_bytes_to_disk     mediumtext null,
    shuffle_bytes_disk_direct mediumtext null,
    full_content              text       null
);

create index counter_aid_tid_idx
    on counter (aid, tid);

create table diagnose
(
    did     int auto_increment
        primary key,
    aid     int        null,
    content mediumtext null,
    constraint diagnose_aid_fk
        foreign key (aid) references application (aid)
);

create table event
(
    eid       int auto_increment
        primary key,
    aid       int     null,
    tid       int     null,
    timestamp int     null,
    type      tinyint null
);

create index event_aid_tid_type_timestamp_idx
    on event (aid, tid, type, timestamp);

create index event_aid_timestamp_idx
    on event (aid, timestamp);

create table record
(
    rid       int auto_increment
        primary key,
    aid       int         null,
    timestamp int         null,
    machine   varchar(10) null,
    content   text        null
);

create index record_aid_timestamp_idx
    on record (aid, timestamp);

create table task
(
    tid            int auto_increment
        primary key,
    aid            int                  null,
    vid            int                  null,
    task_id_suffix char(16)             null,
    machine        varchar(10)          null,
    start_time     int                  null,
    end_time       int                  null,
    fail           tinyint(1) default 0 null
);

create table map_transfer
(
    m_tran_id int auto_increment
        primary key,
    aid       int  null,
    tid       int  null,
    content   text null,
    constraint map_transfer_aid_fk
        foreign key (aid) references application (aid),
    constraint map_transfer_tid_fk
        foreign key (tid) references task (tid)
);

create index map_transfer_aid_tid_idx
    on map_transfer (aid, tid);

create index task_aid_start_time_idx
    on task (aid, start_time);

create table test_table
(
    id  int auto_increment
        primary key,
    str varchar(100) null
);

create table transfer
(
    tran_id    int auto_increment
        primary key,
    aid        int         null,
    src        int         null,
    src_v      int         null,
    dst        int         null,
    type       varchar(30) null,
    csize      mediumtext  null,
    start_time int         null,
    end_time   int         null,
    rate       float       null,
    delay      tinyint(1)  null
);

create index transfer_aid_delay_end_time_idx
    on transfer (aid, delay, end_time);

create table vertex
(
    vid         int auto_increment
        primary key,
    aid         int         null,
    vertex_name varchar(50) null,
    start_time  int         null,
    end_time    int         null,
    type        varchar(15) null,
    constraint vertex_aid_fk
        foreign key (aid) references application (aid)
);

