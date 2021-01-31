const express=require('express');
const app=express();
const {WebhookClient}=require('dialogflow-fulfillment')
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://localhost:27017';
const assert = require('assert');
const randomstr=require('randomstring');
var username='';
var ph=0;
var flag='';
app.get('/',(req,res)=>{
    res.send("ACT Fibernet - Chatbot - Issue Tracker");
    console.log("ACT Fibernet - Chatbot - Issue Tracker - 29|01|2021");
});
app.post('/ticket',express.json(),(req,res)=>{
    console.log("In POST /ticket");
    
    const agent= new WebhookClient({
        request:req,
        response:res
    });
async function welcome(agent)
{await agent.add("Welcome to ACT Fibernet Customer support!");}
async function findU(agent)
{
    ph=agent.parameters.number;
   // var c=db.collection('user').find({"phno":ph},{"uname":1,"_id":0});//for desired output
   const cli = new MongoClient(url,{useUnifiedTopology:true});
   await cli.connect();
   const snap = await cli.db("Chatbot").collection("user").findOne({phno: ph});
   if(snap==null){
       await agent.add("Please Re-enter your mobile number");}
   else
   {
   username=snap.uname;
   await agent.add("Welcome  "+username+"!!  \n How can I help you");}
}
async function addU(agent)
{
    let client;
    username=agent.parameters.person;
    ph=agent.parameters.number;
    var toBe={uname:username,phno:ph};
try {
    client = await MongoClient.connect(url,{useUnifiedTopology:true});
    console.log("Inserted new user");
    // Insert a single document
    let r = await client.db("Chatbot").collection('user').insertOne(toBe);
    assert.equal(1, r.insertedCount);
  } catch (err) {
    console.log(err.stack);
    console.log("in catch");
  }
  console.log("User info added to db");
  agent.add("Please write your issue");
  // Close connection
  client.close();
}
async function issueR(agent)
{
let client;
var issue_name=agent.parameters.issue;
var tticket=randomstr.generate(7);
var dt=new Date().toISOString().slice(0, 10);
var tt=new Date().toLocaleTimeString();
let s="pending";
var toBe={phno:ph,issue:issue_name,ticket:tticket,status:s,date:dt,time:tt};
try {
    client = await MongoClient.connect(url,{useUnifiedTopology:true});
    console.log("Connected correctly to server");
    // Insert a single document
    let r = await client.db("Chatbot").collection('issue').insertOne(toBe);
    assert.equal(1, r.insertedCount);
    // Insert multiple documents
    //r = await db.collection('inserts').insertMany([{a:2}, {a:3}]);
    //assert.equal(2, r.insertedCount);
  } catch (err) {
    console.log(err.stack);
    console.log("in catch");
  }
  console.log("Ticket generated and added to db");
  agent.add("We've received your message and we will be working on it");
  // Close connection
  client.close();
}



var intentMap=new Map();
intentMap.set("Default Welcome Intent",welcome);
intentMap.set('I1 - custom',findU);
//intentMap.set('I3',findU);

intentMap.set('I1 - custom - custom',issueR);
agent.handleRequest(intentMap);
});
app.listen(process.env.PORT || 8080);

