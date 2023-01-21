create table test_table(
    id int auto_increment,
    str varchar(100),
    primary key (id)
);

drop table test_table;

select * from test_table;

insert into test_table (str) values ('Test string 0');
insert into test_table (str) values ('Test string 1');
insert into test_table (str) values ('Test string 2');
insert into test_table (str) values ('Test string 3');

truncate test_table;