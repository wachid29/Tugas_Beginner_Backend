const express = require("express");
const multer = require("multer");
const app = express();
require("dotenv").config();
const port = 8001;
const bodyParser = require("body-parser");
const helmet = require("helmet");
const db = require("./db");
const path = require("path");
app.use(helmet());

app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// request = input yg kita kirim
// response = output yang kita terima

const storage = multer.diskStorage({
  destination: "./images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
});

app.use("/profile", express.static("/images"));

app.get("/recipe", (req, res) => {
  db.query(`SELECT * FROM recipe ORDER BY id ASC`, (error, result) => {
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

app.get("/recipe/pages", (req, res) => {
  const { limit, page } = req.body;
  db.query(
    `SELECT * FROM recipe LIMIT $1 OFFSET $2`,
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

app.get("/recipe/get5data", (req, res) => {
  db.query(`SELECT * FROM recipe ORDER BY id DESC LIMIT 5`, (error, result) => {
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

app.get("/recipe/find", (req, res) => {
  //cari berdasarkan name
  const { title_recipe } = req.body;
  db.query(
    `SELECT * FROM recipe WHERE title_recipe LIKE $1`,
    [`%${title_recipe}%`],
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).send("ada yang error");
      } else {
        res
          .status(200)
          .json({ data: result?.rows, jumlahData: result?.rowCount });
      }
    }
  );
});

app.post("/recipe/add", upload.single("image"), (req, res) => {
  const image = `http://localhost:8001/profile/${req.file.filename}`;
  const { title_recipe, ingredients, vidio_step, user_id } = req.body;
  db.query(
    `INSERT INTO recipe (title_recipe,image,ingredients,vidio_step,user_id) 
    VALUES ($1,$2,$3,$4,$5)`,
    [title_recipe, image, ingredients, vidio_step, user_id],
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

app.patch("/recipe/edit", (req, res) => {
  const { id, title_recipe, image, ingredients, vidio_step, user_id } =
    req.body;
  db.query(`SELECT * FROM recipe WHERE id=$1`, [id], (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      if (result.rowCount > 0) {
        //variable untuk menampung data yg tidak diinput user
        let inputTitle_recipe = title_recipe || result?.rows[0].title_recipe;
        let inputImage = image || result?.rows[0].image;
        let inputIngredients = ingredients || result?.rows[0].ingredients;
        let inputVidio_step = vidio_step || result?.rows[0].vidio_step;
        let inputuser_id = user_id || result?.rows[0].user_id;
        let massage = "";
        if (title_recipe) massage += "title_recipe, ";
        if (image) massage += "image, ";
        if (ingredients) massage += "ingredients, ";
        if (vidio_step) massage += "vidio_step, ";
        if (user_id) massage += " user_id, ";

        db.query(
          `UPDATE recipe SET title_recipe= $1, image=$2, ingredients=$3, vidio_step=$4, user_id=$5 WHERE id=$6`,
          [
            inputTitle_recipe,
            inputImage,
            inputIngredients,
            inputVidio_step,
            inputuser_id,
            id,
          ],
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

app.delete("/recipe/delete", (req, res) => {
  const { id } = req.body;

  db.query(`SELECT * FROM recipe WHERE id=$1`, [id], (error, result) => {
    if (error) {
      //console.log(error);
      res.status(400).send("ada yang error");
    } else {
      if (result.rowCount > 0) {
        db.query(`DELETE FROM recipe WHERE id=$1`, [id], (error, result) => {
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
