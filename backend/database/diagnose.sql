create table diagnose(
    did int AUTO_INCREMENT,
    aid int,

    content mediumtext,

    primary key (did)
);

alter table diagnose add constraint diagnose_aid_fk
    foreign key (aid) references application(aid);

SET FOREIGN_KEY_CHECKS = 0;
truncate diagnose;
alter table diagnose auto_increment = 1;
SET FOREIGN_KEY_CHECKS = 1;

alter table diagnose AUTO_INCREMENT = 0;

drop table diagnose;