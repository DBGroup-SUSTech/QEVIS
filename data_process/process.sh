#!/usr/bin/env zsh

echo "====== sim_parser ======"
python3.7 ./simulate/sim_parser.py -d "$1"

echo "====== mon_merge ======"
python3.7 ./mon/mon_merge.py -d "$1"

echo "====== full_task_parser ======"
python3.7 ./my_script/full_task_parser.py -d "$1"

echo "====== db_data_parser ======"
python3.7 ./my_script/db_data_parser.py -d "$1"

echo "====== diagnose_run ======"
python3.7 ./diagnose/diagnosis_run.py -d "$1"

echo "process done"