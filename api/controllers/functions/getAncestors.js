const models = require('../../connections/sequelize');
const getDownlines = require('./getDownlines')
const notificationCreate = require('../functions/createNotification')
const updateAccount = require('../functions/updateAccount')
const dateValue = require('../functions/dateValue')

let ancestors = async (id) => {
    const members = await models.Members.findOne({
        where: {
            user_id: id
        },
        include: [{
            model: models.Members,
            as: 'ancestors',

        }, {
            model: models.User,
            as: 'attributes',
            attributes: ['firstname', 'lastname', 'username']

        }],
    })

    let newStage = (base) => {
        let multi = Math.pow(2, base);
        let calcNo = (2 * multi)
        let result = calcNo - 1
        return result
    }

    let notificationAndAccount = async (id, message, bonus, date) => {
        let newNotification = await notificationCreate(id, message, date)
        let ancestorAccount = await models.Account.findOne({
            where: {
                user_id: id
            }
        })
        let newBalance = bonus + Number(ancestorAccount.dataValues.balance)

        let updateAncestorAccount = await updateAccount(ancestorAccount, newBalance, date)

    }

    let updateStage = async (ancestor, parent, n, a) => {
        if (a == n) {
            return a
        } else if (parent.children !== undefined && parent.children.length == 2) {
            a++;

            // console.log(`depth is ${a}`)

            let newAncestorStage, bonusAmount;
            // check the depth and assign the appropriate stages
            switch (a) {
                case 2:

                    if (ancestor.current_stage == 1) {
                        newAncestorStage = 2;
                        bonusAmount = 10;
                    }
                    break;
                case 3:
                    if (ancestor.current_stage == 2) {
                        // console.log(ancestor.user_id)
                        newAncestorStage = 3;
                        bonusAmount = 1000;

                    }
                    break;
                case 4:
                    if (ancestor.current_stage == 3) {
                        newAncestorStage = 4;
                        bonusAmount = 3000;

                    }
                    break;
                case 5:
                    if (ancestor.current_stage == 4) {
                        newAncestorStage = 5;
                        bonusAmount = 6000;

                    }
                    break;
                case 6:
                    if (parent.current_stage == 5) {
                        newAncestorStage = 6;
                        bonusAmount = 12000;

                    }
                    break;
                default:
                    newAncestorStage = undefined;
                    break;
            }
            if (newAncestorStage !== undefined) {

                let updateParent = await ancestor.update({
                    current_stage: newAncestorStage
                })

                let parentNotification = await notificationAndAccount(ancestor.user_id, `Congratulations, You have been upgraded to stage ${newAncestorStage} and received a bonus of $${bonusAmount}`, bonusAmount, dateValue)

                let ancestorUpline = await models.Members.findOne({
                    where: {
                        user_id: ancestor.upline_id
                    }
                })
                let ancestorBonus = await models.Bonus.create({
                    user_id: ancestor.user_id,
                    bonus_type_id: 2,
                    amount: bonusAmount,
                    date: dateValue
                })
                if (ancestorUpline !== null) {
                    let uplineBonus = (bonusAmount * 0.1)
                    let ancestorUplineAccount = await models.Account.findOne({
                        where: {
                            user_id: ancestorUpline.user_id
                        }
                    })
                    let newBal = uplineBonus + Number(ancestorUplineAccount.dataValues.balance)
                    let ancestorUplineBonus = await models.Bonus.create({
                        user_id: ancestorUpline.user_id,
                        bonus_type_id: 3,
                        amount: uplineBonus,
                        date: dateValue
                    })
                    let updateAncestorAccount = await updateAccount(ancestorUplineAccount, newBal, dateValue)
                    let parentUplineNotification = await notificationAndAccount(ancestorUpline.user_id, `Congratulations, You have received a bonus of $${uplineBonus} for the upgrade of your downline ${ancestor.attributes.username} to stage ${newAncestorStage}`, uplineBonus, dateValue)

                }
            }
            for (let i = 0; i < parent.children.length; i++) {

                let stage = newStage((Number(parent.children[i].current_stage) + 1))
                updateStage(ancestor, parent.children[i], stage, a)
            }
        } else {
            return a
        }

    }
    // console.log(dn[0])
    let updates = []
    if (members !== null) {
        for (let i = 0; i < members.ancestors.length; i++) {
            let downline = await getDownlines(members.ancestors[i].user_id)
            // console.log(members.ancestors[1].user_id, 'is now being searchrd for')
            let stage = newStage((Number(downline.current_stage) + 1))
            let update = await updateStage(downline, downline, stage, 0)
            updates.push(update)
        }
        // console.log(updates)
    }
    return members


}

module.exports = ancestors