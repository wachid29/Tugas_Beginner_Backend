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
app.get("/comment", (req, res) => {
  db.query(`SELECT * FROM comment ORDER BY id ASC`, (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      res
        .status(200)
        .json({ data: result?.rows, jumlahData: result?.rowCount });
    }
  });
});

app.get("/comment/pages", (req, res) => {
  const { limit, page } = req.body;
  db.query(
    `SELECT * FROM comment LIMIT $1 OFFSET $2`,
    [limit, limit * (page - 1)],
    (error, result) => {
      if (error) {
        //console.log(error);
        res.status(400).send("ada yang error");
      } else {
        res
          .status(200)
          .json({ data: result?.rows, jumlahData: result?.rowCount });
      }
    }
  );
});

app.get("/comment/find", (req, res) => {
  //cari berdasarkan name
  const { id } = req.body;
  db.query(`SELECT * FROM comment WHERE id=$1`, [id], (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).send("ada yang error");
    } else {
      res
        .status(200)
        .json({ data: result?.rows, jumlahData: result?.rowCount });
    }
  });
});

app.post("/comment/add", (req, res) => {
  const { comment, recipe_id, user_id } = req.body;
  // if ((error = password !== confirm_pass)) {
  //   res.status(400).json("pass harus sama");
  // }
  db.query(
    `INSERT INTO comment (comment, recipe_id, user_id) 
    VALUES ($1,$2,$3)`,
    [comment, recipe_id, user_id],
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).send("ada yang error");
      } else {
        res.status(200).send("data berhasil di tambah");
      }
    }
  );
});

app.patch("/comment/edit", (req, res) => {
  const { id, comment, recipe_id, user_id } = req.body;
  db.query(`SELECT * FROM comment WHERE id=$1`, [id], (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      if (result.rowCount > 0) {
        //variable untuk menampung data yg tidak diinput user
        let inputComment = comment || result?.rows[0].comment;
        let inputRecipe_id = recipe_id || result?.rows[0].recipe_id;
        let inputUser_id = user_id || result?.rows[0].user_id;

        let massage = "";
        if (comment) massage += "comment, ";
        if (user_id) massage += "user_id, ";
        if (recipe_id) massage += "recipe_id, ";
        db.query(
          `UPDATE comment SET comment=$1,recipe_id=$2, user_id=$3 WHERE id=$4`,
          [inputComment, inputRecipe_id, inputUser_id, id],
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

app.delete("/comment/delete", (req, res) => {
  const { id } = req.body;

  db.query(`SELECT * FROM comment WHERE id=$1`, [id], (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      if (result.rowCount > 0) {
        db.query(`DELETE FROM comment WHERE id=$1`, [id], (error, result) => {
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
