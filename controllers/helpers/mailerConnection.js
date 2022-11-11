
const nodemailer = require("nodemailer");

module.exports = {
  doEmail: (mail,subject, code) => {
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    const options = {
      from: 'IshalTc@outlook.com',
      to: mail,
      subject: subject,
      text: code,
    };

    transporter.sendMail(options, function (err, info) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Sent :" + info.response);
    });
  },
};