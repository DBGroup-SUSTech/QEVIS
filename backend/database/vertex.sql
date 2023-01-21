create table vertex(
    vid int AUTO_INCREMENT,
    aid int,
    vertex_name varchar(50),
    start_time int,
    end_time int,
    type varchar(15),

    primary key (vid)
);

alter table vertex add constraint vertex_aid_fk
    foreign key (aid) references application(aid);

SET FOREIGN_KEY_CHECKS = 0;
truncate vertex;
alter table vertex auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

drop table vertex;