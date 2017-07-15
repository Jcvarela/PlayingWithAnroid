// Description:
//      Command to create a github issue in a specific repo.  This will allow for channels to
//      define specific questions that should be asked before create an issue.
//
//  Dependencies:
//      None
//
//  Configuration:
//      None
//
//  Commands:
//      hubot ticket help - help page for the ticket command
//
//  Author:
//      Mike Christensen (mike@us.ibm.com)
//


/* jshint node: true */

"use strict";
//TODO: there's no way to delete a ticket.... should there be a way?
//=========================
let CLOUDANT = require("../lib/cloudant");

const user = process.env.GOBOT_CLOUDANT_USER;
const password = process.env.GOBOT_CLOUDANT_PASSWORD;
const dbName = "tickets";

const db = new CLOUDANT(user,password,user,dbName);

//=========================

let utils = require("../lib/utils");
let Conversation = require("hubot-conversation");
let LOG = require("log");
let Promise = require("bluebird");
let log = new LOG(process.env.GOBOT_LOG_LEVEL || "info");



module.exports = function (robot) {

    let switchBoard = new Conversation(robot);

    /**
     *  Command: gobot ticket help
     *
     *  Returns command help in the form of a Slack attachment created from a markdown doc.
     */
    robot.respond(/ticket\s+help$/i, function (msg) {
        let event = {
            channel_id: msg.message.room,
            file_name: "ticket-cmd.md"
        };

        //TODO: need to be modify, new functions
        robot.emit("help:document:post", event);
    });

    //=======================================================
    //TODO: info
    robot.respond(/ticket\s+config$/i, function(msg){
        ticketConfig(msg,robot,switchBoard);
    });

    //TODO: info
    robot.respond(/revert:/i, function(msg){

        let remove = "revert:";

        let input = msg.message.text;
        let id = input.substr(input.indexOf(remove) + remove.length);
        id = id.trim();

        let channelID = getChannelID(msg,robot);
        myTicketConfig.revert(id,channelID,msg);
    });

    //TODO: info
    robot.respond(/ticket\s+list$/i,function(msg){
        let channelID = getChannelID(msg,robot);
        myTicketConfig.printTicketList(channelID,msg);
    });

    // robot.respond(/test/i, function(msg){
    //    // fillOutTicket(msg,robot,switchBoard);
    // });


    /**
     *  Starts the question and answer process for creating a new ticket.
     */
    robot.respond(/ticket$/i, function (msg) {
        fillOutTicket(msg,robot,switchBoard);
        //dispatch(msg, robot, switchBoard);
    });

};


//TODO: info
let fillOutTicket = (msg,robot,switchBoard) => {

    let key = getChannelID(msg,robot);

    //TODO: should get the ticket from another source not the database
    myTicketConfig.getTicket(key,true)
        .then( function(input) {
            //TODO: is repeated code
            let timeoutMessage = "Timed out!, please start again.";
            let dialog = switchBoard.startDialog(msg, 60000, timeoutMessage);

            let docs = input.docs;

            if(docs.length < 1){
                msg.reply(myTicketConfig.DONT_HAVE_TICKET());
                return;
            }

            let ticket = docs[0];
            ticket.answer = [];

            ticket.robot = robot;

            setTitle(ticket,msg,dialog);

        });
};

let setTitle = (ticket, msg, dialog) =>{
    msg.reply("First, please type a concise summary for this new ticket:");
    getAnswer(dialog,msg)
        .then(function(input){

            ticket.title = input;

            //TODO: fix position
            let pos = {};
            pos.questionPos = 0;
            pos.optionPos = 0;

            answerQuestion(ticket,pos,msg,dialog);
        });
};

//TODO: info
let answerQuestion = (ticket, pos , msg, dialog) => {
    //Base Case
    if(pos.questionPos >= ticket.questions.length){

        //TODO: should save the title better
        let title = ticket.title;
        let body = createIssueBodyFormat(ticket);
        createGithubIssue(msg,ticket.robot,ticket.githubOrg, ticket.githubRepo, title, body);
        return;
    }

    let q = ticket.questions[pos.questionPos];

    let message = "\n" + (pos.questionPos + 1) + ") ";
    message    += getQuestionFormat(q);

    msg.reply(message);

    getAnswer(dialog, msg)
        .then(function(input){
            //TODO: check input and modify it
            //let value = getAnswerFormat(input,q.choices);
            ticket.answer[pos.questionPos] = input;

            pos.questionPos++;
            answerQuestion(ticket,pos,msg,dialog);
        });
};



/**
 *  Creates the body format for the issue
 *
 * @param {Ticket} ticket: Contains the questions and answer to create the body
 * @returns {string} Returns the body for the new issue
 */
let createIssueBodyFormat = (ticket) => {
    let output = "";
    let q = ticket.questions;
    for(let i = 0; i < q.length; i++){
        output += "\n## " + q[i].q;
        output += "\n" + ticket.answer[i];
        output += "\n\n";
    }
    return output;
};


//TODO: info
let getQuestionFormat = (question) => {
    let output = "";

    let choices = question.choices;
    output += question.q;


    for(let i = 0; i < choices.length; i++){
        //TODO: Modify it so it can be more than 'Z'
        let char = String.fromCharCode(97 + i);
        output += "\n\t" + char + ") " + choices[i];
    }

    return output;
};



/**
 * Get the channel ID
 *
 * @param {Object} msg:
 * @param {Object} robot:
 * @return {String} Returns the channel ID
 */
let getChannelID = function(msg,robot) {
    let channelID = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(msg.message.room).id;
    channelID = channelID.toUpperCase();
    return channelID;
};


/**
 * Starts ticket config
 *
 * @param {Object} msg:
 * @param {Object} robot:
 * @param {Object} switchBoard:
 * @return {NaN} Void
 */
let ticketConfig = function(msg,robot,switchBoard) {

    let key = getChannelID(msg,robot);
    let timeoutMessage = "Timed out!, please start again.";
    let dialog = switchBoard.startDialog(msg, 60000, timeoutMessage);
    //check if the channel has ticket
    myTicketConfig.getTicket(key,true)
        .then(function(obj){

            if(isDbEmpty(obj)){
                myTicketConfig.startSurvey(key, msg ,dialog);
            }
            else {
                myTicketConfig.askIfUserWantsNewTicket(key,msg,dialog);
            }
        });
};


let isDbEmpty = function(obj) { return obj.docs.length < 1; };



let  Question = function(q) {
    this.q = q;
    this.choices = [];
};

/**
 *
 * @param {String} key: use to keep track of channelID
 * @constructor
 */
let Ticket = function (key) {
    this.key = key; //channel ID
    this.questions = []; //array of Question
    this.active = false;

    this.githubOrg;
    this.githubRepo;
    this.answer;
};

/**
 * Make a list of questions from ticket
 *
 * @param {Ticket} ticket: Ticket with questions
 * @returns {string} Returns a list of all the questions in ticket
 */
let getTicketQuestion = function(ticket) {
    let message = "";

    let q = ticket.questions;
    for(let i = 0; i < q.length; i++){
        message += "\n" + (i +1) + ") " + q[i].q;
    }

    return message;
};



//TODO: info
let myTicketConfig = new function(){

    //constant variables ========================
    this.INVALID_INPUT =       ()=> "Invalid input";
    this.ASK_QUESTIONS_NUMBER =()=> "Enter # of questions you want answered.";
    this.ASK_FOR_QUESTION =    ()=> "Enter ## question:";
    this.ASK_OPTIONS_NUMBER =  ()=> "Enter # of options, if any.";
    this.ASK_FOR_OPTION =      ()=> "Enter ## option:";


    this.DONT_CREATE_TICKET =  ()=> "modify the questions";
    this.CREATE_NEW_TICKET =   ()=> "start from scratch";
    this.TICKET_IS_CREATED =   ()=> "I see you already have a configuration for ticket in this channel, Would you like to \""+ this.CREATE_NEW_TICKET() +"\" or \""+ this.DONT_CREATE_TICKET() +"\" you have?";

    this.DONE=                 ()=> "Done.";
    this.IF_YOU_WANT_TO_REVERT=()=> "Done. \nHere is your old configuration ID in case you want to revert:";
    this.TICKET_IS_ACTIVE=     ()=> "Ticket is already active";

    this.DONT_HAVE_TICKET=     ()=> "This channel doesn't have a ticket";
    this.SHOW_TICKET_LIST_INFO=()=> "Here is the current configuration for this channel:";
    //=========================================


    /**
     * Helper Object, keeps track of the ticket question and option position when it's been created
     *
     * @constructor
     */
    let QuestionPos = function(){
        this.questionPos = 0;
        this.optionPos = 0;
    };

    //TODO:info
    this.askForGithubInfo= function(ticket, msg, dialog){
        return new Promise( async function (resolve, reject){
            msg.reply("Github Organization:");
            await getAnswer(dialog,msg)
                .then(function(input){
                    ticket.githubOrg = input;
                });

            msg.reply("Github Repo:");
            await getAnswer(dialog,msg)
                .then(function (input) {
                    ticket.githubRepo = input;
                });
            resolve();
        });
    };

    /**
     * Ask how many costume questions the new ticket should have.
     * Recursive function
     *
     * @param {Ticket} ticket: its pass so it can be filled out
     * @param {QuestionPos} pos: keeps track position for which question or option needs to be created
     * @param {Object} msg:
     * @param {Object} dialog:
     * @private
     * @return {NaN} Void
     */
    this._askForQuestionAmount = (ticket, pos, msg, dialog) => { //TODO: could create an object to holds all parameters?
        msg.reply(myTicketConfig.ASK_QUESTIONS_NUMBER());

        getAnswer(dialog,msg)
            .then(function(input){
                let value = parseInt(input);
                //check input
                if(isNaN(value) || value < 1){
                    //if input is not a positive integer call it self again
                    msg.reply(myTicketConfig.INVALID_INPUT());

                    myTicketConfig._askForQuestionAmount(ticket,pos,msg,dialog);
                    return;
                }

                ticket.questions = new Array(value);
                //starts asking for questions
                myTicketConfig._askForSpecificQuestion(ticket,pos,msg,dialog);
            });
    };

    /**
     * Ask for question depending on 'pos' values
     * Recursive function
     *
     * @param {Ticket} ticket: its pass so it can be filled out
     * @param {QuestionPos} pos: keeps track position for which question or option needs to be created
     * @param {Object} msg:
     * @param {Object} dialog:
     * @private
     * @return {NaN} Void
     */
    this._askForSpecificQuestion = (ticket, pos, msg,dialog) => {  //TODO: could create an object to holds all parameters?
        //Base Case
        //Check if is outside boundaries
        if(pos.questionPos >= ticket.questions.length) {
            //Set ticket as active for specific channel
            myTicketConfig._activateTicket(ticket, msg);
            return;
        }

        //Ask for new question.
        let message = myTicketConfig.ASK_FOR_QUESTION().replace("##", "#" + (pos.questionPos + 1));
        msg.reply(message);

        getAnswer(dialog,msg)
            .then(function(input){
                ticket.questions[pos.questionPos] = new Question(input);
                //Ask for options
                myTicketConfig._askForOptionAmount(ticket, pos, msg,dialog);
            });
    };

    /**
     * Ask how many option should be for a specific question.
     * Recursive function
     *
     * @param {Ticket} ticket: its pass so it can be filled out
     * @param {QuestionPos} pos: keeps track position for which question or option needs to be created
     * @param {Object} msg:
     * @param {Object} dialog:
     * @private
     * @return {NaN} Void
     */
    this._askForOptionAmount = (ticket, pos, msg, dialog) =>{ //TODO: could create an object to holds all parameters?

        msg.reply(myTicketConfig.ASK_OPTIONS_NUMBER());

        getAnswer(dialog,msg)
            .then(function(input){
                //Check input
                let value = parseInt(input);
                if(isNaN(value) || value < 0){
                    msg.reply(myTicketConfig.INVALID_INPUT());
                    //calls itself if input is a negative value or not an integers
                    myTicketConfig._askForOptionAmount(ticket,pos,msg,dialog);
                    return;
                }

               //check if there's no option for specific question
                if(value < 1){
                    pos.questionPos++;
                    //go to the next question
                    myTicketConfig._askForSpecificQuestion(ticket,pos,msg,dialog);
                    return;
                }
                //sets the array for options
                let q = ticket.questions[pos.questionPos];
                q.choices = new Array(value);
                //Ask for specific option
                pos.optionPos = 0;
                myTicketConfig._askForSpecificOption(ticket,pos,msg,dialog);
            });
    };

    /**
     * Ask for a specific option depending on 'pos' values
     * Recursive function
     *
     * @param {Ticket} ticket: its pass so it can be filled out
     * @param {QuestionPos} pos: keeps track position for which question or option needs to be created
     * @param {Object} msg:
     * @param {Object} dialog:
     * @private
     * @return {NaN} Void
     */
    this._askForSpecificOption = (ticket,pos,msg,dialog) =>{ //TODO: could create an object to holds all parameters?
        let q = ticket.questions[pos.questionPos];
        //Check if is outside boundaries
        if(pos.optionPos >= q.choices.length){
            pos.optionPos = 0;
            pos.questionPos++;
            //Ask for the next question
            myTicketConfig._askForSpecificQuestion(ticket,pos,msg,dialog);
            return;
        }

        let message = myTicketConfig.ASK_FOR_OPTION().replace("##", "#" + (pos.optionPos + 1));
        msg.reply(message);

        getAnswer(dialog, msg)
            .then(function(input){
                q.choices[pos.optionPos] = input;

                pos.optionPos++;
                //Ask for the next option
                myTicketConfig._askForSpecificOption(ticket, pos,msg,dialog);
            });
    };

    /**
     * Sets the given ticket as active for the specific channel and disable the old ticket if there are any.
     *
     * @param {Ticket} ticket: Ticket to set as active
     * @param {Object} msg: use to send message to the user
     * @private
     * @return {NaN} Void
     */
    this._activateTicket = (ticket , msg) => {

        //Get all the active tickets
        myTicketConfig.getTicket(ticket.key, true)
            .then(function(obj){
                //get the array of tickets
                let docs = obj.docs;
                let message = myTicketConfig.DONE();
                let isActive = false;

                //check if there was an active ticket
                if(docs.length > 0){

                    message = myTicketConfig.IF_YOU_WANT_TO_REVERT() + " " + docs[0]._id;

                    //Check if ticket is already active
                    for(let i =0; i < docs.length; i++){
                        if(docs[i]._id === ticket._id) {
                            message = myTicketConfig.TICKET_IS_ACTIVE();
                            isActive = true;
                            continue;
                        }

                        //disable ticket and put it back to db
                        docs[i].active = false;
                        db.insert(docs[i]);
                    }
                }

                msg.reply(message);

                //Adds the new active ticket to db
                if(!isActive){
                    ticket.active = true;
                    db.insert(ticket);
                }
            });
    };


    //TODO: info
    this.revert = (id,key,msg) => {
        let query = {"selector" : {"_id" : id}};

        db.find(query)
            .then(function(obj){

                let docs = obj.docs;
                if(docs.length < 1){
                    msg.reply(myTicketConfig.INVALID_INPUT());
                }
                else {
                    let dbTicket = docs[0];

                    if(dbTicket.key !== key){
                        //TODO: bad approach, duplicating data
                        let ticket = new Ticket(key);
                        ticket.questions = dbTicket.questions;
                        dbTicket = ticket;

                    }

                    myTicketConfig._activateTicket(dbTicket,msg);
                }
            });
    };

    //TODO: info
    this.getTicket = (key,active) => {

        let query;
        if(isNaN(active)){
            query = { "selector": { "key": key}};
        } else {
            query = { "selector": { "key": key, "active": active}};
        }

        return db.find(query);
    };

    //TODO: info
    this.askIfUserWantsNewTicket = (key, msg, dialog)=> {
        msg.reply(myTicketConfig.TICKET_IS_CREATED());

        getAnswer(dialog,msg)
            .then(function(input){
                if(input.toLowerCase() === myTicketConfig.CREATE_NEW_TICKET()){
                    myTicketConfig.startSurvey(key, msg, dialog);
                }
                else{
                    msg.reply(myTicketConfig.DONE());
                }
            });
    };

     //TODO: info
    this.startSurvey = (key, msg, dialog) => {

        let ticket = new Ticket(key);
        let pos = new QuestionPos();

        myTicketConfig.askForGithubInfo(ticket,msg,dialog)
            .then(function(){

            myTicketConfig._askForQuestionAmount(ticket, pos , msg, dialog);
        });
    };

    /**
     * List out questions for current channel if there are any
     *
     * @param {object} key: holds the channel ID
     * @param {object} msg: use for reply
     * @return {NaN} Void
     */
    this.printTicketList = (key, msg) => {

        myTicketConfig.getTicket(key,true)
            .then(function(obj){
                let docs = obj.docs;

                if(docs.length < 1){
                    msg.reply(myTicketConfig.DONT_HAVE_TICKET());
                }
                else {
                    let message = myTicketConfig.SHOW_TICKET_LIST_INFO();

                    message += getTicketQuestion(docs[0]);

                    msg.reply(message);
                }

            });
    };
};

//======================================================================================



/**
 * Depending on the channel this will direct the request to a handler function to ask custom questions.
 *
 * @param {Object} msg
 * @param {Object} robot
 * @param {Object} switchBoard
 */
function dispatch(msg, robot, switchBoard) {
    var channelName = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(msg.message.room).name;

    // if (channelName.toUpperCase() == "CDSNI" || channelName.toUpperCase() == "CDSNI-OPS") {
    //     handlerForNetworkInfraTeam(msg, robot, switchBoard);
    // } else {
    //     msg.send("This channel is not setup to use the ticket command.  Use the `megabot feedback <text>` command to get help.");
    // }
}


function questionForNetworkInfraTeam() {
    var questions = [
        {
            q: "First, please type a concise summary for this new ticket:"
        },
        {
            q: "What type of customer is this ticket for?",
            choices: [
                "Internal",
                "External"
            ]
        },
        {
            q: "Is the service available?",
            choices: [
                "Yes",
                "No",
                "Degraded"
            ]
        },
        {
            q: "Who can CDSNI work with (on your side) for technical details?"
        },
        {
            q: "What type of request is this?",
            choices: [
                "New Request",
                "Firewall",
                "Subnet",
                "Vlan",
                "VPN Tunnel",
                "Other"
            ]
        }
    ];

    return questions;
}


/**
 * Ask the custom questions for the specified team.
 *
 * @param {Object} msg
 * @param {Object} robot
 * @param {Object} switchBoard
 */
function handlerForNetworkInfraTeam(msg, robot, switchBoard) {
    var githubOrg = "Jcvarela";
    var githubRepo = "ChatRoom";

    // var githubOrg = "wdp-infra";
    //var githubRepo = "networking-tracker";
    var channelName = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(msg.message.room).name;
    //var switchBoard = new Conversation(robot);
    var timeoutMessage = "Timed out!, please start again, or go to https://github.ibm.com/" + githubOrg + "/" + githubRepo + "/issues to open a ticket.";
    var dialog = switchBoard.startDialog(msg, 60000, timeoutMessage); // 60 second timeout
    var questions = questionForNetworkInfraTeam();

    /**
     * With the questions and choices defined above, use the array.map to call a function which
     * will add a new property 'display_question' to each item in the array where the choices are
     * appended to the question for displaying to the user.
     */
    var q = questions.map(appendChoicesToQuestion);

    var answers = {};
    var issueTitle;
    var issueBody;
    var todos = "";

    //msg.reply(questions[0].q); // start with the first question
    var prefix = "Please answer the following questions.  If you're given a list of choices, select the number for your response.";
    msg.reply(prefix + "\n\n" + q[0].display_question); // start with the first question
    getAnswer(dialog, msg)
        .then(function (a0) {
            answers.a0 = a0;
            issueBody = "## " + q[0].q + "\n" + a0 + "\n\n";
            msg.reply(q[1].display_question);
            return getAnswer(dialog, msg);
        })
        .then(function (a1) {
            answers.a1 = a1;
            issueBody += "## " + q[1].q + "\n" + q[1].choices[--a1] + "\n\n";
            // if (a1 == "0") { issueBody += "- [ ] Need more information about the internal customer (e.g. AWS/SL Account #, Customer Name)\n\n"; }
            // if (a1 == "1") { issueBody += "- [ ] Need more information about the external customer (e.g. AWS/SL Account #, Customer Name, Customer Environment ID)\n\n"; }
            if (a1 == "0") { todos += "- [ ] Need more information about the internal customer (e.g. AWS/SL Account #, Customer Name)\n"; }
            if (a1 == "1") { todos += "- [ ] Need more information about the external customer (e.g. AWS/SL Account #, Customer Name, Customer Environment ID)\n"; }

            msg.reply(q[2].display_question);
            return getAnswer(dialog, msg);
        })
        .then(function (a2) {
            answers.a2 = a2;
            issueBody += "## " + q[2].q + "\n" + q[2].choices[--a2] + "\n\n";
            msg.reply(q[3].display_question);
            return getAnswer(dialog, msg);
        })
        .then(function (a3) {
            answers.a3 = a3;
            issueBody += "## " + q[3].q + "\n" + a3 + "\n\n";
            msg.reply(q[4].display_question);
            return getAnswer(dialog, msg);
        })
        .then(function (a4) {
            answers.a4 = a4;
            issueBody += "## " + q[4].q + "\n" + q[4].choices[--a4] + "\n\n";
            //msg.send("answers:\n" + JSON.stringify(answers, "", 4));
            issueBody += "## TODOs\n" + todos;
            issueTitle = answers.a0;
            createGithubIssue(msg, robot, githubOrg, githubRepo, issueTitle, issueBody);
        })
        .catch(function (err) {
            log.error("command = " + msg.message.text + " error = " + JSON.stringify(err));
        });
}


/**
 * Create a new property in the array called display_question where the choices are appended to
 * the question for the user to answer.  See the example for what the display_question look like.
 *
 * Example:
 * [
 *   {
 *     q: "first question?",
 *     choices: [a, b, c],
 *     display_question: "first question?\n1)a\n2)b\n3)c"
 *   }
 * ]
 *
 * @param {*} item
 * @param {*} index
 */
function appendChoicesToQuestion(item, index) {
    if (item.choices) {
        item.display_question = item.q + "\n";
        for (var i=0; i < item.choices.length; i++) {
            item.display_question += i+1 + ") " + item.choices[i];
            if (i != item.choices.length - 1) {
                item.display_question += "\n";
            }
        }
    } else {
        item.display_question = item.q;  // there's no choices to select from so just post the question
    }

    return item;
}


/**
 * Use a promise to get the answer for a better control the flow.
 *
 * @param {Object} dialog
 * @param {Object} msg
 */
function getAnswer(dialog, msg) {
    return new Promise (function (resolve, reject) {
        dialog.addChoice(/^(?!\s*$).+/i, function (msg) {
            resolve(msg.message.text);
        });
    });
}


/**
 * Emit a new event for the github-service to create a new issue.
 *
 * @param {Object} msg:
 * @param {Object} robot:
 * @return {NaN} Void
 */
function createGithubIssue(msg, robot, org, repo, title, body) {
    let channelName = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(msg.message.room).name;
    let event = {
        user_id: msg.message.user.id,
        user_name: msg.message.user.name,
        //user_email: msg.message.user.profile.email,
        //TODO: remove email and uncomment the line before
        user_email:"Jorge.Carlos.Varela.de.la.Barrera@ibm.com",
        github_org: org,
        github_repo: repo,
        github_issue_title: title,
        github_issue_body: body,
        channel_id: msg.message.room,
        channel_name: channelName,
        timestamp_utc: new Date().toISOString(),
        command: msg.message.text,
        slack_url: utils.getSlackArchiveUrl(process.env.HUBOT_SLACK_TEAM, channelName, msg.message.id)
    };

    robot.emit("github:issue:create", event);
}
