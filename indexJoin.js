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

app.get("/commentbyrecipe", (req, res) => {
  const { title_recipe } = req.body;
  db.query(
    `SELECT * FROM recipe WHERE title_recipe LIKE $1`,
    [`%${title_recipe}%`],
    (error, resultResep) => {
      if (error) {
        //console.log("here2");
        res.status(400).send("ada yang error");
      } else {
        const ids = resultResep.rows.map((res) => res.id);
        db.query(
          `SELECT comment.comment, userdata.name FROM comment JOIN userdata 
        ON comment.user_id = userdata.id WHERE recipe_id = ANY ($1)`,
          [ids],
          (error, result) => {
            if (error) {
              //console.log("here1", error);
              res.status(400).send("ada yang error");
            } else {
              //console.log("here");
              res.status(200).json({
                resep: resultResep.rows,
                comment: result.rows,
                jumlahData: result?.rowCount,
              });
            }
          }
        );
      }
    }
  );
});

app.get("/recipebyuser", (req, res) => {
  //cari berdasarkan name
  const { name } = req.body;
  db.query(
    `SELECT * FROM userdata WHERE name LIKE $1`,
    [`%${name}%`],
    (error, resultData) => {
      if (error) {
        console.log(error);
        res.status(400).send("ada yang error1");
      } else {
        const id = resultData.rows.map((res) => res.id);
        // const ids = [];
        // for (let i = 0; i < resultData.rows.length; i++) {
        //   ids.push(resultData.rows[i].id);
        // }

        db.query(
          `SELECT * FROM recipe WHERE user_id = ANY ($1)`,
          [id],
          (error, result) => {
            if (error) {
              console.log(error);
              res.status(400).send("ada yang error");
            } else {
              res.status(200).json({
                user: resultData?.rows,
                recepy: result?.rows,
                jumlahData: result?.rowCount,
              });
            }
          }
        );
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Fighting!!`);
});
