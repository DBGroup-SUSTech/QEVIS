create table event(
    eid int AUTO_INCREMENT,
    aid int,
    tid int,

    timestamp int,
    type tinyint,

    primary key (eid)
);

alter table event add constraint event_aid_fk
    foreign key (aid) references application(aid);

alter table event add constraint event_tid_fk
    foreign key (tid) references task(tid);

alter table event drop index event_timestamp_idx;
alter table event drop constraint event_aid_fk;
alter table event drop constraint event_tid_fk;

alter table event add index event_aid_timestamp_idx(aid, timestamp);
drop index event_aid_timestamp_idx on event;

alter table event add index event_aid_tid_type_timestamp_idx(aid, tid, type, timestamp);
drop index event_aid_tid_type_timestamp_idx on event;

explain
select tid, max(timestamp) as t, type
from event
where aid = 1 and timestamp between 7451 and 8448
group by tid, type;

explain
select tid, min(timestamp) as t1, max(timestamp) as t2, type
from event
where aid = 1
group by tid, type;

SET FOREIGN_KEY_CHECKS = 0;
truncate event;
alter table event auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

alter table event AUTO_INCREMENT = 0;

drop table event;