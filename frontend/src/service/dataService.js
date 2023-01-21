import Vue from 'vue'
import axios from 'axios'


// Vue.use(axios);
Vue.prototype.axios = axios

const dataServerUrl = "http://localhost:5000";

// const $http = Vue.http;

function getConfiguration(param, callback){
  const url=`${dataServerUrl}/get_configuration`;
  axios.post(url, param)
      .then(response =>{
          callback(response.data)
      }, errResponse => {
          console.log(errResponse)
      })
}

function getAllQueryData(param, callback){
    const url=`${dataServerUrl}/api/get_all_query_data`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function getDatasetNames(param, callback){
  const url=`${dataServerUrl}/api/get_data_names`;
  axios.post(url, param)
      .then(response =>{
          callback(response.data)
      }, errResponse => {
          console.log(errResponse)
      })
}


function startSimulator(param, callback){
  const url=`${dataServerUrl}/api/simulation/local/`;
  axios.post(url, param)
      .then(response =>{
          callback(response.data)
      }, errResponse => {
          console.log(errResponse)
      })
}

function stopSimulator(param, callback){
    const url=`${dataServerUrl}/api/simulation/stop/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryDag(param, callback){
  const url=`${dataServerUrl}/api/dag/`;
  axios.post(url, param)
      .then(response =>{
          callback(response.data)
      }, errResponse => {
          console.log(errResponse)
      })
}

function queryAppInfo(param, callback){
  const url=`${dataServerUrl}/api/info/`;
  axios.post(url, param)
      .then(response =>{
        callback(response.data)
      }, errResponse => {
        console.log(errResponse)
      })
}

function queryFullTasks(param, callback){
    const url=`${dataServerUrl}/api/static/tasks/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryFullMons(param, callback, errorCallback){
    let startTime = new Date()
    const url=`${dataServerUrl}/api/static/mons/`;
    axios.post(url, param)
        .then(response =>{
            console.log("mon transformation time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            errorCallback(errResponse)
            console.log(errResponse)
        })
}

function queryFullOutliers(param, callback){
    const url=`${dataServerUrl}/api/static/outliers/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryFullFetches(param, callback){
    let startTime = new Date()
    const url=`${dataServerUrl}/api/static/fetches/`;
    axios.post(url, param)
        .then(response =>{
            console.log("fetches transformation time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryUpdate(param, callback){
  const url=`${dataServerUrl}/api/incr/`;
  axios.post(url, param)
      .then(response =>{
          callback(response.data)
      }, errResponse => {
          console.log(errResponse)
      })
}

function queryMonUpdate(param, callback){
    const url=`${dataServerUrl}/api/incr/monitor/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryFetchUpdate(param, callback){
    const url=`${dataServerUrl}/api/incr/fetch/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function getSimRate(param, callback){
    const url=`${dataServerUrl}/api/simulation/rate/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function updateSimRate(param, callback){
    const url=`${dataServerUrl}/api/simulation/rate/update/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function querySql(param, callback){
    const url=`${dataServerUrl}/api/sql/`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}


export default{
    getConfiguration,
    getAllQueryData,
    getDatasetNames,
    startSimulator,
    stopSimulator,
    queryDag,
    queryAppInfo,
    queryFullTasks,
    queryFullMons,
    queryFullOutliers,
    queryFullFetches,
    queryUpdate,
    queryMonUpdate,
    queryFetchUpdate,
    getSimRate,
    updateSimRate,
    querySql,
}
