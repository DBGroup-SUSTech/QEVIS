# QEVIS: Query Execution VISualization

QEVIS is a visual analytics system, which supports the visual exploration of query execution at multiple levels of granularity in Apache Hive.

This repository contains the source code of a demo system for QEVIS, which includes a frontend, a backend and code for processing log data of Hive.

## Repository Structure

- `backend`: a backend server for visual analysis system using Java
- `data_process`: Python scripts to collect and clean data fetched from Hive
- `frontend`: a web-based interface implemented by Vue.js

## Employment

To run this demo system with provided data, you need:
- Java 1.8 envornment with maven 
- Python 3.7
- Node.js 16
- MySQL 5.7

### Step 1: Prepare data
Due to the size limit, in this repository we only provide 5 representative sample data from the real employment environment.

Data is zipped and locates at `/data`. Unzip these 5 files you will get 5 folders.

Each folder contains:
- A log file collected from Hive application execution
- An input SQL text
- A physical execution plan for input SQL
- A folder that contains all monitoring data for each mechine
- A json file that contains execution infomation

These data can be fetched directly from Hive system or collected via the scripts we provided.

### Step 2: Pre-process
Then you can pre-process these data via Python scripts located in `data_process`.

```shell
cd <project_root>/data-process
# You can use a virtual environment here. Python version is 3.7. 
pip install -r requirements.txt
# Check Python command
python3.7 --version
# Run data process script
chmod 777 ./process.sh
./process.sh
```
You will see `process done` on the screen when it finishes.

### Step 3: Enviornment setup
This demo system has a backend with SpringBoot and a frontend with Vue.js.

To setup the enviornment of backend:
```shell
cd <project_root>/backend
mvn clean package       # this commond will download maven packages from the internet
# then a jar will be created in the target folder
```

To setup the enviornment of frontend:
```shell
cd <project_root>/frontend
npm install         # this commond will download npm packages from the internet
```
Notice that **Node.js 16** is required to run the frontend server.

### Step 4: Load data to database
This demo system uses MySQL 5.7 for data storage. Enter your MySQL and execute these commands:
```sql
-- Create database and user
create database if not exists qevis_db2;
create user 'qevis_user'@'%' identified by 'qevis_pwd';
grant all privileges on qevis_db2.* to 'qevis_user'@'%';
flush privileges;
-- Switch user and database, then create tables use DDL file
soruce <project_root>/backend/database/qevis_ddl.sql;
show tables;
```

Last command should print:
```
+---------------------+
| Tables_in_qevis_db2 |
+---------------------+
| application         |
| counter             |
| diagnose            |
| event               |
| record              |
| task                |
| test_table          |
| transfer            |
| vertex              |
+---------------------+
9 rows in set (0.00 sec)
```

Then modify the settings of Java backend for connecting to MySQL.

```yml
# <project_root>/src/main/resources/application.yml
...
# You need to replace the placeholder `<your_ip>` and `<your_port>` (3306 by default).
url: jdbc:mysql://<your_ip>:<your_port>/qevis_db2?serverTimezone=UTC&rewriteBatchedStatements=true
username: qevis_user
password: qevis_pwd
...
```
```java
// <project_root>/src/test/java/com/dbgroup/qevis/Loader.java
...
// You need to replace the placeholder `<project_root>`.
public static final String DATA_PATH = "<project_root>/data_process/data";
...
```

Now you can load the data into database. Run these commands:

```shell
cd <project_root>/backend
mvn clean package test -Dtest="Loader#mainLoader"
```

### Step 5: Launch application

Frontend server needs to know the IP of backend. Modify the file:
```js
// <project_root>/frontend/src/service/dataService2.js
...
// You need to replace the placeholder <your_ip>
const dataServerUrl = "http://<your_ip>:5000";
...
```

Backend server doesn't need other settings, and a jar has already created in step 3.

Now you can launch QEVIS demo system via following commands in two shells:
```shell
cd <project_root>/backend
java -jar ./target/qevis-java-0.0.1-SNAPSHOT.jar
```
```shell
cd <project_root>/frontend
npm run serve
```
You can also choose to run them as background processes.

Then if both backend and frontend launch successfully, visit `http://<your_ip>:12000` and you will see the interface.
