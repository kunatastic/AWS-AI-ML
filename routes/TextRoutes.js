const express = require("express");
const Router = express.Router();
const fetch = require("node-fetch");
const s3 = require("../middlewares/S3");
const { checkAuthenticated } = require("../middlewares/AuthMiddleWare");
const { Text, validateText } = require("../models/TextDataModel");

Router.get("/", checkAuthenticated, (req, res) => {
  res.render("text.ejs", { name: req.user.name });
});

const random = (length = 8) => {
  return Math.random().toString(16).substr(2, length);
};

Router.post("/", checkAuthenticated, async (req, res) => {
  randString = random(14);

  const newTextData = {
    user_id: req.user._id,
    text: req.body.text,
    filename: `senti-${randString}.txt`,
    sent: process.env.AWS_SEND,
  };

  params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `senti-${randString}.txt`,
    Body: req.body.text,
  };

  // console.log(process.env.AWS_BUCKET_NAME);

  try {
    validateText(newTextData);
  } catch (err) {
    console.log(err);
  }

  // console.log(params);
  try {
    if (process.env.AWS_SEND === "true") {
      s3.putObject(params, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(`File uploaded successfully. ${data.Location}`);
        }
      });

      const payload = {
        Records: [
          {
            s3: {
              configurationId: process.env.AWS_CONFIRURATION_ID,
              bucket: {
                name: process.env.AWS_BUCKET_NAME,
                ownerIdentity: {
                  principalId: process.env.AWS_PRINCIPAL_ID,
                },
                arn: process.env.AWS_ARN,
              },
              object: {
                key: `senti-${randString}.txt`,
              },
            },
          },
        ],
      };
      const sendData = await fetch(process.env.AWS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const theData = await sendData.json();
      console.log(theData);
    }
    const newText = await new Text(newTextData).save();
    console.log(randString);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }
  res.redirect("/");
});

// Router.get("/raw", async (req, res) => {
//   try {
//     const data = await fetch(process.env.AMAZON_URI);
//     const values = await data.json();
//     res.json(values);
//   } catch (e) {
//     console.log(e);
//   }
// });

module.exports = Router;
