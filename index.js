/*
* basic setting
// const express = require("express");
// const app = express();

// app.get("/", (req, res) => {
//   res.send("hello node");
// });

// app.listen(8099, () => {
//   console.log("8099에서 서버대기중");
// });
*/

const dotenv = require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();

// mongodb 1.접속 >> 관련 module --------------------------------
const mongoClient = require("mongodb").MongoClient;

let db = null;
mongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("연결");
  if (err) {
    console.log(err);
  }
  db = client.db("crudApp");
});
//---------------------------------------------------------------

app.use(express.urlencoded({ extended: false }));
// post data를 받을 때(req.body값을 받을때) 필수!

app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//   res.send("hello node");
// });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/write", (req, res) => {
  // res.sendFile(path.join(__dirname, "/public/html/write.html"));
  res.render("write");
});

app.post("/add", (req, res) => {
  db.collection("counter").findOne({ name: "total" }, (err, result) => {
    const total = result.totalPost;
    const subject = req.body.subject;
    const contents = req.body.contents;
    console.log(subject);
    console.log(contents);
    // console.log("write에서 post로 보낸 data 받는 곳");
    // form data 받기

    // 2. data push
    // insert delete update select
    const insertData = {
      no: total + 1,
      subject: subject,
      contents: contents,
    };
    db.collection("crud").insertOne(insertData, (err, result) => {
      // 여기서 'db'는 crudApp을 가리킴.
      db.collection("counter").updateOne({ name: "total" }, { $inc: { totalPost: 1 } });
      // updateOne({},{}) >> 첫번째 것 {}을 찾아서 두번째 것{}으로 바꿔주는 것! {},{} 2개가 필요하다!
      if (err) {
        console.log(err);
      }
      // console.log("잘 들어갔음");
      res.send(`
      <script>
        alert("글이 입력되었습니다."); 
        location.href="/list"
      </script>
      `);
    });
  });

  // *db에 저장

  /*
   * db >> oracle, mysql ( >> dbms : database management system)
   * rdbms : 필요한 정보들을 분류하여 여러개의 table을 만들고, table들을 연결해서 필요한 data를 뽑아내는 것
   * rdbms를 사용하는 db들은 sql을 가짐

   * nosql, mongodb
  */

  /*
   * process
   * 1. db접속 (y)
   * 2. data push (y)
   */

  // res.sendFile(path.join(__dirname, "/public/html/result.html"));
  // res.redirect("/list");
  // * res는 한 번 응답을 받으면 그대로 끝이다. 이후 작성된 코드는 작동하지 않는다.
});

// 불명확한 data를 처리할 때 >> nosql(esp. mongodb) 사용
app.get("/list", (req, res) => {
  // crud에서 data 받기
  db.collection("crud")
    .find()
    .toArray((err, result) => {
      console.log(result);
      // res.json(result); // front가 알아서 처리해서 가져다 쓰기
      res.render("list", { list: result, title: "테스트용입니다." });
      // server side rendering, 페이지 내가 만들어서 보내주기
      // render >> ejs 필요
    });
  // res.send("list 페이지입니다.");
});

app.get("/detail/:no", (req, res) => {
  console.log(req.params.no);
  const no = parseInt(req.params.no);

  db.collection("crud").findOne({ no: no }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      console.log(result);
      res.render("detail", { subject: result.subject, contents: result.contents });
    }
  });

  // res.render("detail");
});

app.listen(8099, () => {
  console.log("8099에서 서버대기중");
});
