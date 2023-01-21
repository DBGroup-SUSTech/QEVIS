delete from counter where aid >= 57;
delete from diagnose where aid >= 57;
delete from event where aid >= 57;
delete from record where aid >= 57;
delete from task where aid >= 57;
delete from transfer where aid >= 57;
delete from vertex where aid >= 57;
delete from application where aid >= 57;

alter table application AUTO_INCREMENT = 57;