// utils/transactions.js
const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const Users = db.user;
const Loghistory = db.loghistory;
const CommitteeMeeting = db.committeeMeeting;
const CommitteeMeetingHistory = db.committeeMeetingHistory;
const ObjectId = require('mongodb').ObjectId;
const util = require('util');
const verifyJwt = util.promisify(jwt.verify);
const { getUserDetails } = require('./chanthaActions.js');

let lastInsertId = "";
let changedvalueJson = {};
let existingvalueJson = {};
let loggedinuserId = "";

const createCommitteeMeeting = async ({ reqBody, session }) => {
  const createdCommitteeMeeting = await CommitteeMeeting.create([{
    isAddAttendance: reqBody.isAddAttendance,
    title: reqBody.title,
    fineAmount: reqBody.fineAmount,
    meetingDate: reqBody.meetingDate,
    description: reqBody.description,
    remark: reqBody.remark
  }], { session });
  lastInsertId = createdCommitteeMeeting[0]._id;
  return {
    status: true,
    statusCode: 201,
    message: 'Committee meeting created successfully',
    data: { createdCommitteeMeeting }
  };
}

const createCommitteeMeetingHistory = async ({ reqBody, session }) => {
  await timeout(3000);
  const userDetails = reqBody.userDetails;
  let committeeMeetingHistoryData = [];

  userDetails.forEach(object => {
    let sample = {
      committeeMeeting_id: new ObjectId(lastInsertId),
      user_id: new ObjectId(object._id),
      attendance: reqBody.isAddAttendance ? object.attendance : false,
      paystatus: paystatus,
      payee_id: "",
      paidDate: "",
      description: object.description,
    };
    committeeMeetingHistoryData.push(sample);
  });

  const result = await CommitteeMeetingHistory.insertMany(committeeMeetingHistoryData, { session });
  return {
    status: true,
    statusCode: 201,
    message: 'Committee meeting history created successfully',
    data: { result }
  };
}

const committeeMeetingList = async ({ status }) => {
  const committeeMeetingData = await CommitteeMeeting.find({ status }).sort({ meetingDate: -1 });
  return {
    status: true,
    statusCode: 200,
    data: committeeMeetingData
  };
}

const committeeMeetingPayStatusList = async ({ meetingListQuery }) => {
  const query = { $and: meetingListQuery };
  const usersData = await CommitteeMeetingHistory.find(query);
  return {
    status: true,
    statusCode: 200,
    message: 'Committee Meeting History List Details',
    data: usersData
  };
}

const editCommitteeMeeting = async ({ _id, reqBody, session }) => {
  const existingValueData = await CommitteeMeeting.findById(_id);
  Object.assign(existingvalueJson, existingValueData.toObject());

  const updatedCommitteeMeeting = await CommitteeMeeting.findByIdAndUpdate(_id, { $set: reqBody }, { new: true, session });
  lastInsertId = updatedCommitteeMeeting._id;

  return {
    status: true,
    statusCode: 200,
    data: { updatedCommitteeMeeting }
  };
}

const deleteCommitteeMeeting = async ({ _id, reqBody, session }) => {
  const existingValueData = await CommitteeMeeting.findById(_id);
  Object.assign(existingvalueJson, existingValueData.toObject());

  const deletedCommitteeMeeting = await CommitteeMeeting.findByIdAndUpdate(_id, { $set: reqBody }, { new: true, session });
  lastInsertId = deletedCommitteeMeeting._id;

  return {
    status: true,
    statusCode: 200,
    data: { deletedCommitteeMeeting }
  };
}

const deleteCommitteeMeetingHistory = async ({ _id, reqBody }) => {
  const query = { committeeMeeting_id: _id };
  const committeeMeetingHistoryData = await CommitteeMeetingHistory.find(query);

  if (committeeMeetingHistoryData.length > 0) {
    committeeMeetingHistoryData.forEach(async (item) => {
      item.status = "deleted";
      item.description = reqBody.description;
      await item.save();
    });
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Committee Meeting History Details deleted successfully',
  };
}

const logHistory = async ({ req, res, reqBody, action, pageName, session }) => {
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

const getCommitteeMeetingDetail = async ({ reqBody, session }) => {
  try {
    let _id = reqBody._id;
    const data = await CommitteeMeeting.findOne({ _id });

    if (!data) {
      return {
        status: false,
        statusCode: 404,
        message: "Committee not found"
      };
    }

    let committeeMeetingHistory = await CommitteeMeetingHistory.find({ committeeMeeting_id: _id })
      .sort({ _id: 1 })  // Sort by user_id in ascending order
      .exec();

    // Fetch all user details concurrently
    const userDetailPromises = committeeMeetingHistory.map(async history => {
      const userDetails = await Users.findOne({ _id: history.user_id }).lean();
      const payeeDetails = history.payee_id ? await Users.findOne({ _id: history.payee_id }).lean() : null;

      const historyObj = history.toObject();
      if (userDetails) {
        historyObj.memberId = userDetails.memberId;
        historyObj.firstname = userDetails.firstname;
        historyObj.lastname = userDetails.lastname;
        historyObj.phoneno = userDetails.phoneno;
      }
      if (payeeDetails) {
        historyObj.payeefirstname = payeeDetails.firstname;
        historyObj.payeelastname = payeeDetails.lastname;
        historyObj.payeeposition = payeeDetails.position;
      }
      return historyObj;
    });

    committeeMeetingHistory = await Promise.all(userDetailPromises);
    const resultData = data.toObject();
    resultData.committeeMeetingHistory = committeeMeetingHistory;
    return {
      status: true,
      statusCode: 201,
      data: { resultData }
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: error.message
    };
  }
};

function filter(obj1, obj2) {
  let result1 = {};
  let result2 = {};

  let result = { old: [], new: [] };

  for (let key in obj1) {
    if (obj2[key] !== obj1[key]) {
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
  createCommitteeMeeting,
  committeeMeetingList,
  editCommitteeMeeting,
  deleteCommitteeMeeting,
  deleteCommitteeMeetingHistory,
  logHistory,
  createCommitteeMeetingHistory,
  committeeMeetingPayStatusList,
  getCommitteeMeetingDetail
};
