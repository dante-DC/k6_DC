import http from 'k6/http';
import { SharedArray } from 'k6/data';
import {group, check,sleep } from 'k6';
//import { scenario } from 'k6/execution';
//import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
const users = new SharedArray('users', function () {
  return JSON.parse(open('./testdata/user.json')).users;
});
export const options = {
  scenarios: {
    my_demo_scenario1: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 20,
      maxDuration: '20s',
    },
    my_demo_scenario2: {
      executor: 'constant-arrival-rate',
      // Our test should last 20 seconds in total
      duration: '20s',
     // It should start 10 iterations per `timeUnit`. Note that iterations starting points
      // will be evenly spread across the `timeUnit` period.
      rate: 5,
      // It should start `rate` iterations per second
      timeUnit: '1s',

      // It should preallocate 10 VUs before starting the test
      preAllocatedVUs: 10,

      // It is allowed to spin up to 50 maximum VUs to sustain the defined
      // constant arrival rate.
      maxVUs: 10,
    },
  }, 
  thresholds: {
    'group_duration{group:::GetFlowID}': ['p(95)<5000'],
    'group_duration{group:::AccessID}': ['p(95)<5000'],
  },
};
export default function () {
 let flowId=0;
 group('GetFlowID', function () {
   //const url='https://benbers.bbldtl.int/Logon/jaxrs/eid/flow';
   const url='https://banking.bendigobank.com.au/Logon/jaxrs/eid/flow';
   const params = {
    headers: {
      'x-brand': 'ben',
      'x-channel': 'web',
    },
    
 };
   const res = http.get(url,params);
   flowId = res.json().flowId;
   check(res, { 'status was 200': (res) => res.json().status == 200 });
   const nextStep = res.json().next[0];
   check(res, { 'Next Step is AccessID': (res) => res.json().next[0] == 'accessId' });
   console.log('Next Step is ' + nextStep+'.');
   //console.log('FlowId is ' + flowId+'.');
   
 });
 sleep(1);
group('AccessID', function () {
  //console.log('FlowId is ' + flowId+'.');
  //const url='https://benbers.bbldtl.int/Logon/jaxrs/eid/flow/'+flowId;
  const url='https://banking.bendigobank.com.au/Logon/jaxrs/eid/flow/'+flowId;
  //console.log('url is ' + url+'.');
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  let accessId=users[Math.floor(Math.random() * users.length)].accessID;//random row
  let body = {  "action": "accessId", "accessId": accessId }; 
  console.log('Access ID:'+accessId);
  const res= http.request('POST', url, JSON.stringify(body),params);
 // console.log(JSON.stringify(res, null, "  "));
  check(res, { 'status was 200': (res) => res.json().status == 200 });
  check(res, { 'Next Step is password': (res) => res.json().next[0] == 'password' });
  const nextStep = res.json().next[0];
  console.log('Next Step is ' + nextStep+'.');
  
});
sleep(1);
};
//export function handleSummary(data) {
  //return {
    //"result.html": htmlReport(data),
   
  //};
//}

