// utils/transactions.js
const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const Users = db.user;
const Loghistory = db.loghistory;
const controllerList = db.controllerList;
const chantha = db.chantha;
const ChanthaHistory = db.chanthaHistory;
var lastInsertId = "";
let changedvalueJson = {};
let existingvalueJson = {};
let loggedinuserId = "";
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

const createchantha = async ({ reqBody, session }) => {
  const createdchantha = await chantha.create([{
    amount: reqBody.amount,
    effectiveDate: reqBody.effectiveDate,
    status: reqBody.status,
    remark: reqBody.remark
  }], { session });
  const createdchanthaId = JSON.parse(JSON.stringify(createdchantha));
  lastInsertId = createdchanthaId[0]._id;
  return {
    status: true,
    statusCode: 201,
    message: 'chantha is created successful',
    data: { createdchantha }
  }
}

const chanthaList = async ({ status, session }) => {
  const chanthaData = await chantha.find();
  return {
    status: true,
    statusCode: 201,
    data: chanthaData
  }
}

const editchantha = async ({ _id, reqBody, session }) => {
  const existingvalueData = await chantha.findOne({ _id });
  existingvalueJson.amount = existingvalueData.amount;
  existingvalueJson.effectiveDate = existingvalueData.effectiveDate;
  existingvalueJson.status = existingvalueData.status;
  existingvalueJson.remark = existingvalueData.remark;
  const updatedchantha = await chantha.findOneAndUpdate({ _id }, { $set: reqBody }, { session })
  const updatedchanthaId = JSON.parse(JSON.stringify(updatedchantha));
  lastInsertId = updatedchanthaId._id;

  return {
    status: true,
    statusCode: 201,
    data: { updatedchantha }
  }
}

const deletechantha = async ({ _id, reqBody, session }) => {
  const existingvalueData = await chantha.findOne({ _id });
  existingvalueJson.amount = existingvalueData.amount;
  existingvalueJson.effectiveDate = existingvalueData.effectiveDate;
  existingvalueJson.status = existingvalueData.status;
  existingvalueJson.remark = existingvalueData.remark;
  const updatedchantha = await chantha.findOneAndUpdate({ _id }, { $set: reqBody }, { session })
  const updatedchanthaId = JSON.parse(JSON.stringify(updatedchantha));
  lastInsertId = updatedchanthaId._id;

  return {
    status: true,
    statusCode: 201,
    data: { updatedchantha }
  }
}

const getChanthaDetail = async ({ reqBody, session }) => {
  let _id = reqBody._id;
  var data = await chantha.findOne({ _id });
  data = data.toObject();
  let chanthaHistory = [];
  chanthaHistory = await groupByAddedDate(_id);
  for (let history of chanthaHistory) {
    for (let record of history.records) {
      let userDetails = await getUserDetails(record.user_id); // Assuming user_id is present in the record
      let payeeDetails = await getUserDetails(record.payee_id);
      record.memberId = userDetails.memberId;
      record.firstname = userDetails.firstname;
      record.lastname = userDetails.lastname;
      record.phoneno = userDetails.phoneno;
      record.payeefirstname = payeeDetails.firstname;
      record.payeelastname = payeeDetails.lastname;
      record.payeeposition = payeeDetails.position;
    }
  }
  data.chanthaHistory = chanthaHistory;
  if (!data) {
    return {
      status: false,
      statusCode: 404,
      message: "Chantha not found"
    };
  }
  return {
    status: true,
    statusCode: 201,
    data: { data }
  }
}

const groupByAddedDate = async (chantha_id) => {
  try {
    const result = await ChanthaHistory.aggregate([
      { $match: { chantha_id: chantha_id, status: 'paid' } },
      { $group: { _id: "$paidDate", records: { $push: "$$ROOT" } } },
      { $sort: { _id: 1 } } // Optional: sort by addedDate in ascending order
    ]).exec();

    return result;
  } catch (error) {
    console.error('Error grouping by paidDate:', error);
    throw error;
  }
};

const getUserDetails = async (user_id) => {
  try {
    const user = await Users.findOne({ _id: user_id });
    return user ? user.toObject() : null;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

const loghistory = async ({ req, res, reqBody, action, pageName, session }) => {
  await timeout(3000);
  const differ = filter(existingvalueJson, reqBody);
  checkLogedinuserId(req, res);
  const loghistory = await Loghistory.create([{
    userId: loggedinuserId,
    recordId: lastInsertId,
    existingvalue: JSON.stringify(differ.old[0]),
    changedvalue: action == "create" ? JSON.stringify(reqBody) : JSON.stringify(differ.new[0]),
    action: action,
    pagename: pageName
  }], { session });

  return {
    status: true,
    statusCode: 201,
    data: { loghistory }
  }
}

function filter(obj1, obj2) {
  var result1 = {};
  var result2 = {};

  let result = [];
  result.old = [];
  result.new = [];

  for (key in obj1) {
    if (obj2[key] != obj1[key]) {
      result1[key] = obj1[key];
      result2[key] = obj2[key];
    }
  }
  result.old.push(result1);
  result.new.push(result2);
  return result;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkLogedinuserId(req) {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(400).send({
        error: err,
        message: "Unauthorized!",
      });
    } else {
      loggedinuserId = decoded.id;
      return;
    }
  });
}

module.exports = {
  createchantha, chanthaList, editchantha, deletechantha, loghistory, getChanthaDetail
};
