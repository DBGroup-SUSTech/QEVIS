import Vue from 'vue'
import axios from 'axios'

Vue.prototype.axios = axios

// You need to replace the placeholder <your_ip>
const dataServerUrl = "http://<your_ip>:12000";

function getAppMetaList(param, callback){
    const url=`${dataServerUrl}/app-meta-list`;
    return axios.post(url, param)
        .then(response => {
            return callback(response.data)
        }, errResponse => {
            console.log(errResponse)
            return errResponse
        })
}

function getApplicationByAid(param, callback){
    const url=`${dataServerUrl}/application-by-aid`;
    return axios.post(url, param)
        .then(response => {
            return callback(response.data)
        }, errResponse => {
            console.log(errResponse)
            return errResponse
        })
}

function getApplicationList(param, callback){
    const url=`${dataServerUrl}/application-list`;
    return axios.post(url, param)
        .then(response => {
            return callback(response.data)
        }, errResponse => {
            console.log(errResponse)
            return errResponse
        })
}

function getVertexListByAid(param, callback){
    const url=`${dataServerUrl}/vertex-list`;
    axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}


function getStaticTDAGData(param, callback){
    const url=`${dataServerUrl}/tdag-data`;
    return axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function getStaticExecutionData(param, callback){
    const url=`${dataServerUrl}/execution-data`;
    return axios.post(url, param)
        .then(response =>{
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function getRecordListByAid(param, callback, errorCallback){
    let startTime = new Date()
    const url=`${dataServerUrl}/record-list`;
    axios.post(url, param)
        .then(response =>{
            console.log("mon transformation time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            errorCallback(errResponse)
            console.log(errResponse)
        })
}

function getTransferListByAid(param, callback){
    let startTime = new Date()
    const url=`${dataServerUrl}/transfer-list`;
    axios.post(url, param)
        .then(response =>{
            console.log("fetches transformation time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function getTransferByTid(param, callback){
    let startTime = new Date()
    const url=`${dataServerUrl}/transfer-by-tid`;
    return axios.post(url, param)
        .then(response =>{
            console.log("fetch hover transformation time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function getEventList(param, callback){
    let startTime = new Date()
    const url=`${dataServerUrl}/event-list`;
    axios.post(url, param)
        .then(response =>{
            console.log("events transformation time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

function queryUpdate(param, callback){
    let startTime = new Date()
    const url=`${dataServerUrl}/query-update`;
    axios.post(url, param)
        .then(response =>{
            console.log("update info transmission time", new Date() - startTime)
            callback(response.data)
        }, errResponse => {
            console.log(errResponse)
        })
}

export default{
    getAppMetaList,
    getApplicationByAid,
    getApplicationList,
    getVertexListByAid,
    getStaticTDAGData,
    getStaticExecutionData,
    getRecordListByAid,
    getTransferListByAid,
    getTransferByTid,
    getEventList,
    queryUpdate,
}
