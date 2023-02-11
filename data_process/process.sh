#!/usr/bin/env zsh

echo sim_parser
python ./simulate/sim_parser.py

echo mon_merge
python ./mon/mon_merge.py

echo full_task_parser
python ./my_script/full_task_parser.py

echo db_data_parser
python ./my_script/db_data_parser.py

echo diagnose_run
python ./diagnose/diagnosis_run.py

echo "process done"