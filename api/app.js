const express = require('express')
const app = express()
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { httpLogger } = require('./loggers/httpLogger');
const { logger } = require('./loggers/logger');
const cron = require("node-cron");
const smtpTransport = require('./controllers/functions/sendMail')
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))
app.use(function(req, res, next) {
  var allowedOrigins = ['http://localhost:8080', 'https://www.rightstepsfoundation.org/', 'https://rightstepsfoundation.org/dashboard', 'www.rightstepsfoundation.org/dashboard'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});
// app.use(
//   cors({
//     credentials: true,
//     origin: 'http://localhost:8080',
//   })
// );

app.use(cookieParser());

// app.use(httpLogger);  
const loginRoute = require('./routes/login')
const registerRoute = require('./routes/register')
const refferedUsers = require('./routes/referrals/reffered')
const referralLink = require('./routes/referrals/referral_link')
const adminRoutes = require('./routes/admin/admin')
const userRoutes = require('./routes/user/user')
const requestRoutes = require('./routes/requests/requests')
const awardsRoutes = require('./routes/awards/awards')
const forgotRoute = require('./routes/forgotpassword/forgotPassword')
const logoutRoute = require("./routes/logout")

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/members', refferedUsers);
app.use('/referral', referralLink);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/requests', requestRoutes)
app.use('/awards', awardsRoutes)
app.use('/forgot', forgotRoute)
app.use ('/logout', logoutRoute)
const models = require('./connections/sequelize');

let birthdayMessages = async () => {
  let users = await models.User.findAll()
  let date = new Date()
  if (users.length > 0) {
    users.forEach((user, i) => {
      let date2 = new Date(user.dob)
      if ((date.getMonth() == date2.getMonth()) && (date.getDate() == date2.getDate())) {


        smtpTransport(user.email_address, "Right Steps", "Happy Birthday", `To You on your special day, Happy birthday `);
      }
    })
  }
  // console.log(users.length)
}

cron.schedule("10 11 * * *", function() {
  birthdayMessages()
  console.log("running a task every minute");
});


// call this fn inside the cron-job
// birthdayMessages()
app.listen(process.env.API_PORT, () => {
  logger.info(`Server listening on port ${process.env.API_PORT}`);
})