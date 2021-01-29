const express=require('express');
const app=express();

const {WebhookClient}=require('dialogflow-fulfillment')

const MongoClient=require('mongodb').MongoClient;
const url='mongodb://localhost:27017';

MongoClient.connect(url,{useUnifiedTopology:true},
    (err,client)=>{
        if(err)
        {
            return console.log(err);
        }
        db=client.db("Chatbot");
        console.log(`Connected Database: ${url}`);
        console.log(`Database : ${"Chatbot"}`);
        console.log("Connection Successfull");
    });

const randomstr=require('randomstring');
var username='';
var ph=0;
app.get('/',(req,res)=>{
    res.send("ACT Fibernet - Chatbot - Issue Tracker");
    console.log("ACT Fibernet - Chatbot - Issue Tracker");
});
app.post('/ticket',express.json(),(req,res)=>{
    console.log("In POST /ticket");
    const agent= new WebhookClient({
        request:req,
        response:res
    });

function findU(agent)
{
    ph=agent.parameters.number;
    var cb_ph= db.collection('user').find({"phno":ph});
    console.log(cb_ph);
    if(cb_ph==null)
    {
         agent.add("Invalie Phno-Please Re-enter");
    }
    else
    {
        username=cb_ph.uname;
        agent.add("Welcome "+username);
    }
}
function issueR(agent)
{
    var issue_name=agent.parameters.issue;
    var tticket=randomstr.generate(7);
    var dt=new Date().toISOString().slice(0, 10);
    var tt=new Date().toLocaleTimeString();
    let s="pending";var toBe={phno:ph,issue:issue_name,ticket:tticket,status:s,date:dt,time:tt};
    db.collection('issue').insertOne(toBe, (err,res)=>{
    if (err){ throw err;}
                          });
    agent.add("Updated");
    console.log("Ticket generated and added to db");
}
var intentMap=new Map();
intentMap.set('I1 - custom',findU);
intentMap.set('I1 - custom - custom',issueR);
agent.handleRequest(intentMap);
});
app.listen(process.env.PORT || 8080);
