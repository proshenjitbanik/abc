/********************************************************************************* 
 *  WEB700 – Assignment 05 
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 * of this assignment has been copied manually or electronically from any other source 
 * (including 3rd party web sites) or distributed to other students. 
 * 
 * Name: Proshenjit Banik Student ID: 167256221 Date: 21st March 2024 
 * 
 * Online (Cyclic) Link: https://kind-ruby-kitten-tam.cyclic.app/ 
 * ********************************************************************************/



const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/officeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
}))


app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));


app.set('view engine', '.hbs');

app.get("/employees/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});


app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
});

app.get("/employees", (req, res) => {
    data.getAllEmployees()
        .then((employees) => {
            res.render("employees", { employees: employees });
        })
        .catch((err) => {
            res.render("employees", { message: "no results" });
        });
});

app.get("/description", (req, res) => {
    res.render("description"); // Specify the view file extension
});

app.get("/", (req, res) => {
    res.render("home"); // Specify the view file extension
});

app.get("/PartTimer", (req,res) => {
    data.getPartTimers().then((data)=>{
        res.json(data);
    });
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

