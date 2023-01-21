create table transfer(
    tran_id int AUTO_INCREMENT,
    aid int,

    src int,
    src_v int,
    dst int,

    type varchar(30),
    csize long,
    start_time int,
    end_time int,
    rate float,

    delay bool,

    primary key (tran_id)
);

alter table transfer add constraint transfer_aid_fk
    foreign key (aid) references application(aid);
alter table transfer add constraint transfer_src_fk
    foreign key (src) references task(tid);
alter table transfer add constraint transfer_dst_fk
    foreign key (dst) references task(tid);

alter table transfer drop constraint transfer_aid_fk;
alter table transfer drop constraint transfer_src_fk;
alter table transfer drop constraint transfer_dst_fk;
drop index tranfer_aid_fk on transfer;
drop index transfer_src_fk on transfer;
drop index transfer_dst_fk on transfer;

alter table transfer add index transfer_aid_delay_end_time_idx(aid, delay, end_time);
drop index transfer_aid_delay_end_time_idx on transfer;

explain
select *
from transfer as tran
join task t on tran.src = t.tid
where tran.aid = 6 and tran.start_time <= t.end_time;

explain
select *
from transfer
where aid = 1 and delay = true;

select aid, count(*)
from transfer
group by aid;

SET FOREIGN_KEY_CHECKS = 0;
truncate transfer;
alter table transfer auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

select count(*) from transfer;

-- select upstream & downstream transfer
explain
select *, IF(dst = 10, 'in', 'out') as dir
from transfer
where aid = 1
    and (dst = 10       -- upstream
        or src_v = 8 or src = 10);      -- downstream

explain
select *, IF(dst = 10, 'in', 'out') as dir
from transfer
where aid = 1
  and delay = 1
  and end_time between 1000 and 5000;

delete from transfer
where aid >= 39;

drop table transfer;