create table counter(
    cid int AUTO_INCREMENT,
    aid int,
    tid int,

    file_bytes_read long,
    file_bytes_written long,
    hdfs_bytes_read long,
    input_records_processed long,
    output_records long,
    input_split_length_bytes long,
    output_bytes long,
    shuffle_bytes long,
    shuffle_bytes_to_mem long,
    shuffle_bytes_to_disk long,
    shuffle_bytes_disk_direct long,

    full_content text,

    primary key (cid)
);

/**
  [
            'file_bytes_read', 'file_bytes_written', 'hdfs_bytes_read',
            'input_records_processed', 'output_records',
            'input_split_length_bytes', 'output_bytes',
            'shuffle_bytes', 'shuffle_bytes_to_mem', 'shuffle_bytes_to_disk', 'shuffle_bytes_disk_direct'
        ]
 */

alter table counter add constraint counter_tid_fk
    foreign key (tid) references task(tid);

create index counter_aid_tid_idx on counter (aid, tid);

explain
select c.tid
from counter as c
    join task t on c.tid = t.tid
where c.aid = 1
    and t.aid = 1
    and t.end_time between 1000 and 30000;

SET FOREIGN_KEY_CHECKS = 0;
truncate counter;
alter table counter auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

drop table counter;