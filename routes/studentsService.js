var express = require("express");
var router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const xlsx = require('xlsx');

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

router.get("/:rollNo", function (req, res, next) {
  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }

    const jsonData = JSON.parse(data);
    var student = jsonData.find((item) => item.rollNo === req.params.rollNo);
    res.send(student);
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
    const newId = uuidv4();

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

    fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error writing data file");
          return;
        }

        res.send(newStudent);
      }
    );
  });
});

// DELETE method for deleting a specific student
router.delete("/:rollno", function (req, res, next) {
  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading data file");
      return;
    }

    const jsonData = JSON.parse(data);

    const studentIndex = jsonData.findIndex(
      (student) => student.rollNo === req.params.rollno
    );

    if (studentIndex !== -1) {
      const deletedStudent = jsonData.splice(studentIndex, 1)[0];

      fs.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error writing data file");
            return;
          }

          res.status(200).json({
            message: "Student deleted successfully",
            student: deletedStudent,
          });
        }
      );
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  });
});

// PUT method for updating a specific student
router.put("/edit/:rollNo", (req, res) => {
  const rollNo = req.params.rollNo;
  const updatedStudent = req.body;

  fs.readFile(DATA_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading data file");
    }

    let jsonData = JSON.parse(data);
    jsonData = jsonData.map((student) => {
      if (student.rollNo === rollNo) {
        return { ...student, ...updatedStudent };
      }
      return student;
    });

    fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing data file");
      }

      return res.send("success");
    });
  });
});

router.put('/uploadfile', upload.single('file'), (req, res) => {
  const filePath = req.file.path;

  fs.readFile(DATA_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading data file');
      return;
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    const existingData = JSON.parse(data);

    jsonData.forEach((newRow) => {
      const duplicate = existingData.find(
        (existingRow) => existingRow.rollNo === newRow.rollNo
      );

      if (!duplicate) {
        existingData.push(newRow);
      }
    });

    existingData.sort((a, b) => parseInt(a.rollNo) - parseInt(b.rollNo));

    fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error writing data file');
        return;
      }

      res.json(existingData);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log('Uploaded file removed');
      });
    });
  });
});

module.exports = router;