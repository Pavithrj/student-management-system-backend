const { deepEqual } = require("assert");
// const deepEqual = require('deep-equal');
var express = require("express");
var router = express.Router();
const fs = require("fs");

const DATA_FILE_PATH = "./data.json";

router.get("/", function (req, res, next) {
  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }

    const jsonData = JSON.parse(data);
    res.send(jsonData);
  });
});

router.post("/", function (req, res, next) {
  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }

    const jsonData = JSON.parse(data);

    // Generate a new student ID
    const newId = jsonData.length + 1;


    // Create a new student object
    const newStudent = {
      id: newId,
      name: req.body.name,
      age: req.body.age,
      rollNo: req.body.rollNo,
    };

    if (jsonData.find((item) => item.rollNo === newStudent.rollNo)) {
      res.status(400).send({ error: "Duplicate student entry" });
      return;
    }

    jsonData.push(newStudent);

    fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error writing data file");
        return;
      }

      res.send(newStudent);
    });
  });
});


// router.put("/:id", function (req, res, next) {
//   const studentId = parseInt(req.params.id);

//   fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send("Error reading data file");
//       return;
//     }

//     const jsonData = JSON.parse(data);

//     const student = jsonData.find((s) => s.id === studentId);

//     if (!student) {
//       res.status(404).send("Student not found");
//       return;
//     }

//     student.name = req.body.name;
//     student.age = req.body.age;
//     student.rollNo = req.body.rollNo;

//     fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send("Error writing data file");
//         return;
//       }

//       res.send(student);
//     });
//   });
// });

// router.delete("/:id", function (req, res, next) {
//   const studentId = parseInt(req.params.id);

//   fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send("Error reading data file");
//       return;
//     }

//     const jsonData = JSON.parse(data);

//     const studentIndex = jsonData.findIndex((s) => s.id === studentId);

//     if (studentIndex === -1) {
//       res.status(404).send("Student not found");
//       return;
//     }

//     const deletedStudent = jsonData.splice(studentIndex, 1)[0];

//     fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send("Error writing data file");
//         return;
//       }

//       res.send(deletedStudent);
//     });
//   });
// });

module.exports = router;
