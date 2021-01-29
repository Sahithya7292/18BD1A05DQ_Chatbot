const express=require('express');
const app=express();

const {WebhookClient}=require('dialogflow-fulfillment')

const MongoClient=require('mongodb').MongoClient;
const url='mongodb://localhost:27017';
const randomstr=require('randomstring');
var username='';
app.get('/',(req,res)=>{
    res.send("ACT Fibernet - Chatbot - Issue Tracker");
    console.log("ACT Fibernet - Chatbot - Issue Tracker");
});
app.post('/ticket',(req,res)=>{
    console.log("In POST /ticket");
    const agent=new DF.WebhookClient({
        request:req,
        response:res
    });

async function findU(agent)
{
    var phn=agent.parameters.phnno;
    const client=new MongoClient(url);
    await client.connect();
    var cb_ph= await client.db("Chatbot").collection('user').find(
       {"phno":phn}
       );
    if(cb_ph==null)
    {
        await agent.add("Invalie Phno-Please Re-enter");
    }
    else
    {
        username=cb_ph.uname;
        await agent.add("Welcome "+username);
    }
}
function issueR(agent)
{
    var issue_name=agent.parameters.issue-nme;
    var tticket=randomstr.generate(7);
    MongoClient.connect(url,(err,db)=>{
        if(err)
            {throw err; }
        var D=db.db("Chatbot");
        let t=new Date.now().toTimeString();
        let s="pending";
        var toBe={phno:phn,
        issue:issue_name,
        ticket:tticket,
        status:s,
        date:new Date.now().toTimeString()};
        D.collection('issue').insertOne(toBe,(req,res)=>{
            if(err)
            {throw err; }
            db.close();
        });
        });
}
var intentMap=new Map();
intentMap.set('First_N',findU);
intentMap.set('First_N-custom',issueR);
agent.handleRequest(intentMap);
});
app.listen(process.env.PORT || 8080);
