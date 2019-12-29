const express = require('express');
const models = require('../connections/sequelize')
const { logger } = require('./../loggers/logger')
const nodemailer = require("nodemailer");
const sendMail = async (email, username, password) => {
    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    var mailOptions = {
        to: email,
        from: "Right Steps",
        subject: "Right-Steps Registeration Complete",
        text: `Congratulations!! You've been successfully registered to Right-steps
                Kindly signin the website with the following credentials:
                Username: ${username}
                Password: ${password} `
    };
    let info =  smtpTransport.sendMail(mailOptions, (err, res)=>{
        if(err){
            logger.error(`${username} with email: ${email} mail sending failed,
                          Error: ${err.toString()}`)

            return false
        }
        logger.info(`Registeration mail successfully sent to user: ${username} with email: ${email}`)
        return true
    });
    return info;
}
module.exports = {
    post: ('/', async (req, res) => {
        let { firstname, lastname, phone, email, gender, dob, country, state, username, sponsor, upline, role } = req.body;
        var ts = new Date().getTime()
        try {
            // get the sponsor details
            let userSponsor = await models.User.findOne({
                where: {
                    username: sponsor
                }
            })

            // check if sponsor exists
            if (userSponsor !== null && userSponsor !== undefined) {
                // get upline details
                let userUpline = await models.User.findOne({
                    where: {
                        username: upline
                    }
                })
                // check if upline exists
                if (userUpline !== null && userUpline !== undefined) {

                    let newUser = await models.User.build({
                        firstname: firstname,
                        lastname: lastname,
                        username: username,
                        email_address: email,
                        role_id: role,
                        gender: gender,
                        dob: dob,
                        phone_no: phone,
                        country: country,
                        state: state,
                        status: 0,
                        password: ts,
                        date_created: Date.now(),
                        last_login_date: Date.now(),
                    }).save()
                    if(newUser){
                        let newMember = await models.Members.create({
                            user_id: newUser.dataValues.user_id,
                            upline_id: userUpline.dataValues.user_id,
                            sponsor_id: userSponsor.dataValues.user_id,
                            current_stage: 1,
                            referral_id: `${newUser.dataValues.username}${newUser.dataValues.user_id}`
                        })
                    let mail = await sendMail(email, username, ts);
                    let successMsg
                    if(mail){
                        successMsg = `User Created Successfully, An email has been sent to ${email} with login credentials`;
                    } else{
                        successMsg = `A network error occured while sending mail to ${email}.
                         Login with the following credentials
                         Username: ${username}
                         Password: ${ts}`;
                    }
                    res.status(201)
                        .send(successMsg);
                    }
                } else {
                    let errorMsg = `User Creation Failed, ${upline} does not exist`;
                    logger.error(errorMsg);
                    return res.status(400).send(errorMsg);
                }
            } else {
                let errorMsg = `User Creation Failed, ${sponsor} does not exist`;
                logger.error(errorMsg);
                return res.status(400).send(errorMsg);
            }

        } catch (error) {
            logger.error(error.original ? error.original.toString() : error.toString())
            return res.status(400).send(error.original ? error.original.toString() : error.toString())
        }

    })
};
