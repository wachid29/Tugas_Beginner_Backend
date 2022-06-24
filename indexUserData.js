const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.port;
const bodyParser = require("body-parser");
const helmet = require("helmet");
const db = require("./db");

app.use(helmet());

app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// request = input yg kita kirim
// response = output yang kita terima

app.get("/userdata/pages", (req, res) => {
  const { limit, page } = req.body;

  db.query(
    `SELECT * FROM userdata LIMIT $1 OFFSET $2`,
    [limit, limit * (page - 1)],
    (error, result) => {
      if (error) {
        //console.log(error);
        res.status(400).send("ada yang error");
      } else {
        res
          .status(200)
          .json({ user: result?.rows, jumlahData: result?.rowCount });
      }
    }
  );
});

app.get("/userdata", (req, res) => {
  db.query(`SELECT * FROM userdata ORDER BY id ASC`, (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      res
        .status(200)
        .json({ user: result?.rows, jumlahData: result?.rowCount });
    }
  });
});

app.get("/userdata/find", (req, res) => {
  //cari berdasarkan name
  const { name } = req.body;
  db.query(
    `SELECT * FROM userdata WHERE name LIKE $1`,
    [`%${name}%`],
    (error, result) => {
      if (error) {
        //console.log(error);
        res.status(400).send("ada yang error");
      } else {
        res
          .status(200)
          .json({ user: result?.rows, jumlahData: result?.rowCount });
      }
    }
  );
});

app.post("/userdata/add", (req, res) => {
  const { name, email, phone_number, password, confirm_pass } = req.body;
  // if ((error = password !== confirm_pass)) {
  //   res.status(400).json("pass harus sama");
  // }
  db.query(
    `INSERT INTO userdata (name, email, phone_number, password, confirm_pass) 
    VALUES ($1,$2,$3,$4,$5)`,
    [name, email, phone_number, password, confirm_pass],
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).send("ada yang error");
      } else {
        res.status(200).send("data berhasil di tambah");
      }
    }
  );

  //   res.send(namaTeman);
});

app.patch("/userdata/edit", (req, res) => {
  const { id, name, email, phone_number, password, confirm_pass } = req.body;
  db.query(`SELECT * FROM userdata WHERE id=$1`, [id], (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      if (result.rowCount > 0) {
        //variable untuk menampung data yg tidak diinput user
        let inputName = name || result?.rows[0].name;
        let inputEmail = email || result?.rows[0].email;
        let inputPhone = phone_number || result?.rows[0].phone_number;
        let inputPass = password || result?.rows[0].password;
        let inputC_pass = confirm_pass || result?.rows[0].confirm_pass;
        let massage = "";
        if (name) massage += "name, ";
        if (email) massage += "email, ";
        if (phone_number) massage += "phone_number, ";
        if (password) massage += "password, ";
        if (confirm_pass) massage += " confirm_pass, ";

        db.query(
          `UPDATE userdata SET name= $1, email=$2, phone_number=$3, password=$4, confirm_pass=$5 WHERE id=$6`,
          [inputName, inputEmail, inputPhone, inputPass, inputC_pass, id],
          (error, result) => {
            if (error) {
              console.log(error);
              res.status(400).send("ada yang error");
            } else {
              res.status(200).send(`${massage}berhasil di edit`);
            }
          }
        );
      } else {
        res.status(400).send("data tidak ditemukan");
      }
    }
  });
});

app.delete("/userdata/delete", (req, res) => {
  const { id } = req.body;

  db.query(`SELECT * FROM userdata WHERE id=$1`, [id], (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      if (result.rowCount > 0) {
        db.query(`DELETE FROM userdata WHERE id=$1`, [id], (error, result) => {
          if (error) {
            console.log(error);
            res.status(400).send("ada yang error");
          } else {
            res.send(`data berhasil dihapus`);
          }
        });
      } else {
        res.status(400).send("data tidak ditemukan");
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Fighting!!`);
});
