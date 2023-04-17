create table map_transfer(
    m_tran_id int AUTO_INCREMENT,
    aid int,

    tid int,
    content text,

    primary key (m_tran_id)
);

alter table map_transfer add constraint map_transfer_aid_fk
    foreign key (aid) references application(aid);
alter table map_transfer add constraint map_transfer_tid_fk
    foreign key (tid) references task(tid);

alter table map_transfer add index map_transfer_aid_tid_idx(aid, tid);

# alter table map_transfer drop constraint map_transfer_aid_fk;
# alter table map_transfer drop constraint map_transfer_tid_fk;
# drop index map_transfer_aid_fk on map_transfer;
-- drop index transfer_tid_fk on transfer;

-- alter table map_transfer add index transfer_aid_tid_idx(aid, tid);
-- drop index transfer_aid_tid_idx on transfer;

-- delete from transfer
-- where aid >= 39;

drop table map_transfer;