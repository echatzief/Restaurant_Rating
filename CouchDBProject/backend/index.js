/* Start an app */
var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var path = require('path');

/* Connect to the database */
const NodeCouchDb = require('node-couchdb');
const couch = new NodeCouchDb({
    auth: {
        user: 'admin',
        pass: 'fsfbeu1997'
    }
});

//Function that generates token
var generateToken = require('./utils/generateToken.js').generateToken
var jwt = require('jsonwebtoken');

//Retrieve the private key
var privateKey = require('./utils/config.js').key

/* Middlewares */
var middleWare =require('./utils/middleware.js').authMiddle;


/* Parsing the body of post requests */
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

/* For sign Up we dont include the middleware */
app.get('/signUp',(req,res)=>{
    res.sendFile( path.join( __dirname, '../frontend/build', 'index.html' ));
})
app.get('/login',(req,res)=>{
    res.sendFile( path.join( __dirname, '../frontend/build', 'index.html' ));
})

/* Request to create new user */
app.post('/createUser',(req,res)=>{

    /* Get the user from the request */
    var user = req.body.user
    console.log(user)

    const mangoQuery = {
        "selector": {
            "password":user.password, /* The parameters must be unique */
            "username":user.username,
        }
    };
    const parameters = {};

    /* Check if the user exists */
    couch.mango("users",mangoQuery,parameters)
    .then(({data, headers, status})=>{

        /* If the user dont exist create one */
        if(data.docs.length == 0){
            couch.insert("users", {
                email:user.email,
                password:user.password,
                username:user.username,
                Address:user.Address,
            }).then(({data, headers, status}) => {},err => {
                console.log("[ERROR 2] : Failed to create a new user.");
            });
            res.sendStatus(200);
        }
        else{
            /* Inform the frontend that the user exists */
            console.log("[ERROR 1] User already exists");
            res.sendStatus(204);
        }
    });
})

/* We use the middleware to every request except sign up */
app.use(middleWare)

/*Get requests */
app.get('/',(req,res)=>{
    res.sendFile( path.join( __dirname, '../frontend/build', 'index.html' ));
})


/* Post requests */ 



/* Static parts */
app.use(express.static(path.join(__dirname+'/../frontend/build')));

/* Server listens to localhost:8000 */
app.listen(port,()=>{
    console.log("App is running localhost:"+port);
})