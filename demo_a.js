import http from 'k6/http';
import {group, check,sleep } from 'k6';
//import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
 stages: [
    { duration: '3s', target: 10 },
    { duration: '10s', target: 5 },
    { duration: '5s', target: 0 },
  ],
};
export default function () {
 group('GetFlowID', function () {
   const url='https://banking.bendigobank.com.au/Logon/jaxrs/eid/flow';
   const params = {
    headers: {
      'x-brand': 'ben',
      'x-channel': 'web',
    },
    //tags: { name: 'GetFlowID' },
 };
   const res = http.get(url,params);
   check(res, { 'status was 200': (r) => r.status == 200 });
   //console.log('Response time was ' + String(res.timings.duration) + ' ms');
   sleep(1);
 });
}
//export function handleSummary(data) {
  //return {
    //"result.html": htmlReport(data),
   
  //};
//}

