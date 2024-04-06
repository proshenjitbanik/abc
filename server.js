const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");


const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});



app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) => {
    res.render("about");
});


app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            (data.length > 0) ? res.render("students", {students: data}) : res.render("students", {message: 'no result'});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {
            (data.length > 0) ? res.render("students", {students: data}) : res.render("students", {message: 'no result'});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

app.get("/students/add", (req, res) => {
  data.getCourses()
    .then((courses) => {
      res.render("addStudent", { courses: courses }); 
    })
    .catch((err) => {
      console.error("Error fetching courses:", err);
      res.render("addStudent", { courses: [] });
    });
});

app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(()=>{
      res.redirect("/students");
    });
  });

app.get("/student/:studentNum", (req, res) => {

    let viewData = {};
    data.getStudentByNum(req.params.studentNum).then((data) => {
        if (data) {
            viewData.student = data;
        } else {
            viewData.student =null
        } 
    }).catch((err) => {
        viewData.student = null;
    }).then(data.getCourses) 
    .then((data) => {
        viewData.courses = data;
    
    for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId === viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
      
      }).catch(() => {
        viewData.courses = []; // Set courses to empty if there was an error
      })
      
      .then(() => {
        if (viewData.student === null) {
          res.status(404).send("Student Not Found"); // Use 404 for missing resource
        } else {
            res.render("student", {viewData: viewData});
        }
      });
    });

app.post("/student/update", (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/student/delete/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;
  
    data.deleteStudentByNum(studentNum)
      .then(() => {
        res.redirect("/students") // No response body on success (common practice for DELETE requests)
      })
      .catch((err) => {
        res.status(500).send("Failed to Remove Student/Student Not Found"); 
      });
  });

app.get("/courses", (req,res) => {
    data.getCourses().then((data)=>{
        (data.length > 0) ? res.render("courses", {courses: data}) : res.render("courses", {message: 'no result'});
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});


app.get("/courses/add", (req, res) => {
    res.render("addCourse");
  });
  
 
  app.post("/course/update", (req, res) => {
    data.updateCourse(req.body)
      .then(() => {
        res.redirect("/courses");
      })
  });

  app.post("/courses/add", (req, res) => {
    data.addCourse(req.body).then(()=>{
      res.redirect("/courses");
    });
  });


app.get("/course/:id", (req, res) => { 
    data.getCourseById(req.params.id).then((data) => {
        (data) ? res.render("course", {course: data}) : res.status(404).send("course Not Found"); 
    }).catch((err) => {
        res.render("course",{message:"no results"}); 
    });
});

app.get("/course/delete/:id", (req, res) => {
    data.deleteCourseById(req.params.id)
      .then(() => {
        // No response body on success (common practice for DELETE requests)
        res.redirect("/courses");
      })
      .catch((err) => {
        res.status(500).send("Unable to Remove Course / Course Not Found");
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

