create table record(
    rid int AUTO_INCREMENT,
    aid int,

    timestamp int,
    machine varchar(10),
    content text,
#     cpu varchar(200),
#     mem varchar(60),
#     io varchar(500),
#     net varchar(100),

    primary key (rid)
);

alter table record add constraint record_aid_fk
    foreign key (aid) references application(aid);
alter table record drop constraint record_aid_fk;

explain
select timestamp as t, machine as m, content as c
from record
where aid = 1 and timestamp between 1451 and 18448;

select timestamp as t, machine as m, content as c
from record
where aid = 1;

alter table record add index record_aid_timestamp_idx(aid, timestamp);
drop index record_aid_timestamp_idx on record;

SET FOREIGN_KEY_CHECKS = 0;
truncate record;
alter table record auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

drop table record;