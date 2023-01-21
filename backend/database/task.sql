create table task(
    tid int AUTO_INCREMENT,
    aid int,
    vid int,
    task_id_suffix char(16),

    machine varchar(10),
    start_time int,
    end_time int,

    fail bool,
#     status enum('ready', 'running', 'finished'),

    primary key (tid)
);

alter table task add constraint task_aid_fk
    foreign key (aid) references application(aid);

alter table task add constraint task_vid_fk
    foreign key (vid) references vertex(vid);

alter table task drop constraint task_aid_fk;
drop index task_aid_fk on task;
alter table task drop constraint task_vid_fk;
drop index task_vid_fk on task;

explain
select tid, task_id_suffix as tis
from task
where aid = 1 and start_time between 1451 and 18448;

alter table task add index task_aid_start_time_idx(aid, start_time);
drop index task_aid_start_time_idx on task;

SET FOREIGN_KEY_CHECKS = 0;
truncate task;
alter table task auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

drop table task;