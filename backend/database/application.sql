create table application(
    aid int AUTO_INCREMENT,
    app_id char(30),
    database_name varchar(50),
    query_name varchar(50),
    query_string MEDIUMTEXT,
    query_plan MEDIUMTEXT,
    query_dag MEDIUMTEXT,
    create_time timestamp default now(),
    status char,     # 'P': pending, 'R': running, 'F': finished

    duration int,
    machine_no int,
    map_no int,
    reducer_no int,
    task_no int,

    reference_time long,
    task_id_prefix varchar(30),

    primary key (aid)
);

SET FOREIGN_KEY_CHECKS = 0;
truncate application;
alter table application auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

drop table application;