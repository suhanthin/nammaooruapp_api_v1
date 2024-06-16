// utils/transactions.js
const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../models/user.model.js");
const FamilyDetails = require("../models/familyDetails.model.js");
const Users = db.user;
const Loghistory = db.loghistory;
const MemberTypeCount = db.memberTypeCount;
const familyDetails = db.familyDetails;
const familyDetailCount = db.familyDetailCount;
const Role = db.role;
var lastInsertId = "";
let changedvalueJson = {};
let existingvalueJson = {};
let loggedinuserId = "";
let lastInsertprofileId = "";
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require("bcryptjs");

let memberId = "";

const createusercount = async ({ reqBody, session }) => {
  await timeout(3000);
  const usercount = await MemberTypeCount.find();
  if (usercount.length > 0) {
    usercount.map(item => {
      if (reqBody.memberType == 'a-class') {
        item.a_class = item.a_class + 1;
      } else if (reqBody.memberType == 'b-class') {
        item.b_class = item.b_class + 1;
      } else if (reqBody.memberType == 'c-class') {
        item.c_class = item.c_class + 1;
      }
      item.save();
    })
    return {
      status: true,
      statusCode: 201,
      message: 'User count added successful',
      data: { usercount }
    }
  }
  if (usercount.length == 0) {
    let a_classValue = 0;
    let b_classValue = 0;
    let c_classValue = 0;
    if (reqBody.memberType == 'a-class') {
      a_classValue = 1;
      b_classValue = 0;
      c_classValue = 0;
    } else if (reqBody.memberType == 'b-class') {
      a_classValue = 0;
      b_classValue = 1;
      c_classValue = 0;
    } else if (reqBody.memberType == 'c-class') {
      a_classValue = 0;
      b_classValue = 0;
      c_classValue = 1;
    }
    const createduser = await MemberTypeCount.create([{
      a_class: a_classValue,
      b_class: b_classValue,
      c_class: c_classValue
    }], { session });
    return {
      status: true,
      statusCode: 201,
      message: 'User count created successful',
      data: { createduser }
    }
  }
}

const createuser = async ({ reqBody, session }) => {
  await timeout(3000);
  const usercount = await MemberTypeCount.find();
  let a_classMembercount = 0;
  let b_classMembercount = 0;
  let c_classMembercount = 0;
  if (usercount.length == 0) {
    let a_classValue = 0;
    let b_classValue = 0;
    let c_classValue = 0;
    if (reqBody.memberType == 'a-class') {
      a_classValue = 1;
      b_classValue = 0;
      c_classValue = 0;
    } else if (reqBody.memberType == 'b-class') {
      a_classValue = 0;
      b_classValue = 1;
      c_classValue = 0;
    } else if (reqBody.memberType == 'c-class') {
      a_classValue = 0;
      b_classValue = 0;
      c_classValue = 1;
    }
    a_classMembercount = padDigits(a_classValue, 4);
    b_classMembercount = padDigits(b_classValue, 4);
    c_classMembercount = padDigits(c_classValue, 4);
  } else {
    a_classMembercount = padDigits(usercount[0].a_class + 1, 4);
    b_classMembercount = padDigits(usercount[0].b_class + 1, 4);
    c_classMembercount = padDigits(usercount[0].c_class + 1, 4);
  }

  let usertypeSavedhalf = "";
  let maritalStatusSavedsingle = "";
  let memberTypeSavedbclass = "";
  let memberTypeSavedcclass = "";
  if (reqBody.userType == 'half') {
    usertypeSavedhalf = 'yes';
  }
  if (reqBody.maritalStatus == 'single') {
    maritalStatusSavedsingle = 'yes';
  }
  if (reqBody.memberType == 'b-class') {
    memberTypeSavedbclass = 'yes';
    memberId = "B" + b_classMembercount;
  } else if (reqBody.memberType == 'c-class') {
    memberTypeSavedcclass = 'yes';
    memberId = "C" + c_classMembercount;
  } else if (reqBody.memberType == 'a-class') {
    memberId = "A" + a_classMembercount;
  }
  let tempUserName = removeStringSpace(reqBody.firstname) + removeStringSpace(reqBody.lastname) + '_' + memberId;
  const createduser = await Users.create([{
    username: tempUserName,
    password: reqBody.password,
    roleName: reqBody.roleName,
    memberId: memberId,
    firstname: reqBody.firstname,
    lastname: reqBody.lastname,
    phoneno: reqBody.phoneno,
    fathername: reqBody.fathername,
    mothername: reqBody.mothername,
    gender: reqBody.gender,
    avatar: reqBody.avatar,
    address: reqBody.address,
    dob: reqBody.dob,
    userType: reqBody.userType,
    userTypefullchangedDate: reqBody.userTypefullchangedDate,
    usertypeSavedhalf: usertypeSavedhalf,
    memberType: reqBody.memberType,
    memberTypeSavedbclass: memberTypeSavedbclass,
    memberTypeSavedcclass: memberTypeSavedcclass,
    memberTypebclasschangedDate: reqBody.memberTypebclasschangedDate,
    memberTypebclassAddedDate: reqBody.memberTypebclassAddedDate,
    maritalStatus: reqBody.maritalStatus,
    maritalStatusSavedsingle: maritalStatusSavedsingle,
    maritalchangedDate: reqBody.maritalchangedDate,
    identityProof: reqBody.identityProof,
    identityProofNo: reqBody.identityProofNo,
    remark: reqBody.remark,
    nationality: reqBody.nationality,
    qualification: reqBody.qualification,
    jobType: reqBody.jobType,
    jobportal: reqBody.jobportal ? reqBody.jobportal : "",
    jobdetails: reqBody.jobdetails,
    familyId: reqBody.familyId,
    isAdministrator: reqBody.isAdministrator,
    position: reqBody.position ? reqBody.position : "",
    isChitCommitteeMember: reqBody.isChitCommitteeMember,
    chitCommitteePosition: reqBody.chitCommitteePosition ? reqBody.chitCommitteePosition : "",
    status: reqBody.status ? reqBody.status : "active",
    isEnrolledAfterRecord: reqBody.isEnrolledAfterRecord ? reqBody.isEnrolledAfterRecord : false,
    enrollDate: reqBody.enrollDate ? reqBody.enrollDate : "",
    enrolledType: reqBody.enrolledType ? reqBody.enrolledType : "",
    reJoiningDate: reqBody.reJoiningDate ? reqBody.reJoiningDate : "",
    isChanthaRequired: reqBody.isChanthaRequired ? reqBody.isChanthaRequired : false,
    statusDismisstoActive: reqBody.status == 'dismiss' ? true : false
  }], { session });
  const createduserId = JSON.parse(JSON.stringify(createduser));
  lastInsertId = createduserId[0]._id;
  return {
    status: true,
    statusCode: 201,
    message: 'User created successful',
    data: { createduser }
  }
}

const administratorList = async ({ session }) => {
  const query = { 'isAdministrator': true };
  let UsersData;
  UsersData = await User.find(query).sort({ memberId: 1 });
  return {
    status: true,
    statusCode: 201,
    message: 'User List Details',
    data: UsersData
  }
}

const userslist = async ({ usersListquery, session }) => {
  const query = { $and: usersListquery };
  let UsersData;
  if (usersListquery[0].memberType && usersListquery[0].gender) {
    UsersData = await User.find(query).sort({ memberId: 1 });
  } else {
    UsersData = await User.find({}).sort({ memberId: 1 });
  }

  return {
    status: true,
    statusCode: 201,
    message: 'User List Details',
    data: UsersData
  }
}

const edituser = async ({ _id, reqBody, session }) => {
  const existingvalueData = await Users.findOne({ _id });
  existingvalueJson.username = existingvalueData.username;
  existingvalueJson.password = existingvalueData.password;
  existingvalueJson.roles = existingvalueData.roles;
  existingvalueJson.isAdministrator = existingvalueData.isAdministrator;
  existingvalueJson.position = existingvalueData.position;
  existingvalueJson.memberId = existingvalueData.memberId;
  existingvalueJson.firstname = existingvalueData.firstname;
  existingvalueJson.lastname = existingvalueData.lastname;
  existingvalueJson.phoneno = existingvalueData.phoneno;
  existingvalueJson.fathername = existingvalueData.fathername;
  existingvalueJson.mothername = existingvalueData.mothername;
  existingvalueJson.gender = existingvalueData.gender;
  existingvalueJson.avatar = existingvalueData.avatar;
  existingvalueJson.address = existingvalueData.address;
  existingvalueJson.dob = existingvalueData.dob;
  existingvalueJson.balanceTribute = existingvalueData.balanceTribute;
  existingvalueJson.userType = existingvalueData.userType;
  existingvalueJson.userTypechangedDate = existingvalueData.userTypechangedDate;
  existingvalueJson.usertypeSavedhalf = existingvalueData.usertypeSavedhalf;
  existingvalueJson.memberType = existingvalueData.memberType;
  existingvalueJson.memberTypeSavedbclass = existingvalueData.memberTypeSavedbclass;
  existingvalueJson.memberTypechangedDate = existingvalueData.memberTypechangedDate;
  existingvalueJson.maritalStatus = existingvalueData.maritalStatus;
  existingvalueJson.maritalStatusSavedsingle = existingvalueData.maritalStatusSavedsingle;
  existingvalueJson.maritalchangedDate = existingvalueData.maritalchangedDate;
  existingvalueJson.remark = existingvalueData.remark;
  existingvalueJson.identityProof = existingvalueData.identityProof;
  existingvalueJson.identityProofNo = existingvalueData.identityProofNo;
  existingvalueJson.status = existingvalueData.status;
  existingvalueJson.nationality = existingvalueData.nationality;
  existingvalueJson.qualification = existingvalueData.qualification;
  existingvalueJson.jobType = existingvalueData.jobType;
  existingvalueJson.jobportal = existingvalueData.jobportal;
  existingvalueJson.jobdetails = existingvalueData.jobdetails;
  existingvalueJson.familyId = existingvalueData.familyId;
  existingvalueJson.isChitCommitteeMember = existingvalueData.isChitCommitteeMember;
  existingvalueJson.chitCommitteePosition = existingvalueData.chitCommitteePosition ? existingvalueData.chitCommitteePosition : "";

  const usercount = await MemberTypeCount.find();
  let a_classMembercount = "";
  let b_classMembercount = "";
  let c_classMembercount = "";
  if (reqBody.memberTypeSavedbclass == 'yes') {
    if (usercount.length > 0) {
      if (reqBody.memberType == 'a-class') {
        a_classMembercount = padDigits(usercount[0].a_class + 1, 4);
      } else if (reqBody.memberType == 'b-class') {
        b_classMembercount = padDigits(usercount[0].b_class + 1, 4);
      }
    }

    if (reqBody.memberType == 'b-class') {
      reqBody.memberId = "B" + b_classMembercount;
    } else if (reqBody.memberType == 'a-class') {
      reqBody.memberId = "A" + a_classMembercount;
      if (usercount.length > 0) {
        usercount.map(item => {
          if (reqBody.memberType == 'a-class') {
            item.a_class = item.a_class + 1;
          }
          item.save();
        })
      }
    }
  }

  if (reqBody.type == 'full') {
    reqBody.usertypeSavedhalf = 'no';
  }
  if (reqBody.maritalStatus == 'married' || reqBody.maritalStatus == 'widowed') {
    reqBody.maritalStatusSavedsingle = 'no';
  }
  if (reqBody.memberType == 'a-class') {
    reqBody.memberTypeSavedbclass = 'no';
  }

  const updatedcontroller = await Users.findOneAndUpdate({ _id }, { $set: reqBody }, { session })
  const updatedcontrollerId = JSON.parse(JSON.stringify(updatedcontroller));
  lastInsertId = updatedcontrollerId._id;

  return {
    status: true,
    statusCode: 201,
    data: { updatedcontroller }
  }
}

const deleteuser = async ({ _id, reqBody, session }) => {
  const existingvalueData = await User.findOne({ _id });
  existingvalueJson.status = existingvalueData.status;
  existingvalueJson.remark = existingvalueData.remark;
  const updatedUser = await User.findOneAndUpdate({ _id: _id }, { $set: reqBody }, { session })
  const updatedcontrollerId = JSON.parse(JSON.stringify(updatedUser));
  lastInsertId = updatedcontrollerId._id;

  return {
    status: true,
    statusCode: 201,
    data: { updatedUser }
  }
}

const bulkInsert = async ({ req, bulkInsertData, session }) => {
  const pageName = 'user';
  let a_classMembercount = "";
  let b_classMembercount = "";
  let c_classMembercount = "";
  let a_classValue = 0;
  let b_classValue = 0;
  let c_classValue = 0;
  let a_incrementCount = 0;
  let b_incrementCount = 0;
  let c_incrementCount = 0;
  if (bulkInsertData.length > 0) {
    await Promise.all(bulkInsertData.map(async (rev, index) => {
      let itemObject = rev;
      const { roleName } = itemObject;
      let hashpassword = bcrypt.hashSync(itemObject.password.toString(), 8);
      const action = 'BulkInsert';
      let userRoles = "";
      if (roleName) {
        try {
          const importantData = await Role.find(
            {
              name: roleName,
            }
          );
          userRoles = importantData.map((role) => role.name);
        } catch (exception) {
          console.log(exception)
        }
      } else {
        try {
          const importantData = await Role.findOne(
            { name: "member" }
          );
          userRoles = importantData.name;
        } catch (exception) {
          console.log(exception)
        }
      }
      itemObject.password = hashpassword;
      itemObject.roleName = userRoles;
      const usercount = await MemberTypeCount.find();
      let bulkLastInsertID = "";

      // create user
      if (usercount.length == 0) {
        if (itemObject.memberType == 'a-class') {
          a_classValue = a_incrementCount + 1;
          a_incrementCount++;
        } else if (itemObject.memberType == 'b-class') {
          b_classValue = b_incrementCount + 1;
          b_incrementCount++;
        }
        else if (itemObject.memberType == 'c-class') {
          c_classValue = c_incrementCount + 1;
          c_incrementCount++;
        }
        a_classMembercount = padDigits(a_classValue, 4);
        b_classMembercount = padDigits(b_classValue, 4);
        c_classMembercount = padDigits(c_classValue, 4);
      } else if (usercount.length > 0) {
        if (itemObject.memberType == 'a-class') {
          a_classValue = usercount[0].a_class + a_incrementCount + 1;
          a_incrementCount++;
        } else if (itemObject.memberType == 'b-class') {
          b_classValue = usercount[0].b_class + b_incrementCount + 1;
          b_incrementCount++;
        }
        else if (itemObject.memberType == 'c-class') {
          c_classValue = usercount[0].c_class + c_incrementCount + 1;
          c_incrementCount++;
        }
        a_classMembercount = padDigits(a_classValue, 4);
        b_classMembercount = padDigits(b_classValue, 4);
        c_classMembercount = padDigits(c_classValue, 4);
      }

      let usertypeSavedhalf = "";
      let maritalStatusSavedsingle = "";
      let memberTypeSavedbclass = "";
      let memberTypeSavedcclass = "";
      if (itemObject.userType == 'half') {
        usertypeSavedhalf = 'yes';
      }
      if (itemObject.maritalStatus == 'single') {
        maritalStatusSavedsingle = 'yes';
      }
      if (itemObject.memberType == 'b-class') {
        memberTypeSavedbclass = 'yes';
        memberId = "B" + b_classMembercount;
      } else if (itemObject.memberType == 'c-class') {
        memberTypeSavedcclass = 'yes';
        memberId = "C" + c_classMembercount;
      } else if (itemObject.memberType == 'a-class') {
        memberId = "A" + a_classMembercount;
      }
      let tempUserName = removeStringSpace(itemObject.firstname) + removeStringSpace(itemObject.lastname) + '_' + itemObject.memberId
      const createduser = await Users.create([{
        username: tempUserName,
        password: itemObject.password ? itemObject.password : "",
        roleName: itemObject.roleName ? itemObject.roleName : "",
        memberId: itemObject.memberId ? itemObject.memberId : "",
        firstname: itemObject.firstname ? itemObject.firstname : "",
        lastname: itemObject.lastname ? itemObject.lastname : "",
        phoneno: itemObject.phoneno ? itemObject.phoneno : "",
        fathername: itemObject.fathername ? itemObject.fathername : "",
        mothername: itemObject.mothername ? itemObject.mothername : "",
        gender: itemObject.gender ? itemObject.gender : "",
        avatar: itemObject.avatar ? itemObject.avatar : "",
        address: itemObject.address ? itemObject.address : "",
        dob: itemObject.dob ? itemObject.dob : "",
        userType: itemObject.userType ? itemObject.userType : "",
        userTypefullchangedDate: itemObject.userTypefullchangedDate ? itemObject.userTypefullchangedDate : "",
        usertypeSavedhalf: usertypeSavedhalf,
        memberType: itemObject.memberType ? itemObject.memberType : "",
        memberTypeSavedbclass: memberTypeSavedbclass,
        memberTypeSavedcclass: memberTypeSavedcclass,
        memberTypebclasschangedDate: itemObject.memberTypebclasschangedDate ? itemObject.memberTypebclasschangedDate : "",
        memberTypebclassAddedDate: itemObject.memberTypebclassAddedDate ? itemObject.memberTypebclassAddedDate : "",
        maritalStatus: itemObject.maritalStatus ? itemObject.maritalStatus : "",
        maritalStatusSavedsingle: maritalStatusSavedsingle,
        maritalchangedDate: itemObject.maritalchangedDate ? itemObject.maritalchangedDate : "",
        identityProof: itemObject.identityProof ? itemObject.identityProof : "",
        identityProofNo: itemObject.identityProofNo ? itemObject.identityProofNo : "",
        remark: itemObject.remark ? itemObject.remark : "",
        nationality: itemObject.nationality ? itemObject.nationality : "",
        qualification: itemObject.qualification ? itemObject.qualification : "",
        jobType: itemObject.jobType ? itemObject.jobType : "",
        jobportal: itemObject.jobportal ? itemObject.jobportal : "",
        jobdetails: itemObject.jobdetails ? itemObject.jobdetails : "",
        familyId: itemObject.familyId ? itemObject.familyId : "",
        isAdministrator: itemObject.isAdministrator ? itemObject.isAdministrator : false,
        position: itemObject.position ? itemObject.position : "",
        isChitCommitteeMember: itemObject.isChitCommitteeMember ? itemObject.isChitCommitteeMember : false,
        chitCommitteePosition: itemObject.chitCommitteePosition ? itemObject.chitCommitteePosition : "",
        balanceTribute: itemObject.balanceTribute ? itemObject.balanceTribute : 0,
        status: itemObject.status ? itemObject.status : "",
        enrollDate: itemObject.enrollDate ? itemObject.enrollDate : "",
        enrolledType: itemObject.enrolledType ? itemObject.enrolledType : "",
        reJoiningDate: itemObject.reJoiningDate ? itemObject.reJoiningDate : "",
        isChanthaRequired: itemObject.isChanthaRequired ? itemObject.isChanthaRequired : false,
        isEnrolledAfterRecord: itemObject.isEnrolledAfterRecord ? itemObject.isEnrolledAfterRecord : false,
        statusDismisstoActive: itemObject.status == 'dismiss' ? true : false
      }], { session });
      const createduserId = JSON.parse(JSON.stringify(createduser));
      bulkLastInsertID = createduserId[0]._id;

      //create user log history
      const differ = filter(existingvalueJson, itemObject);
      loggedinuserId = checkLogedinuserId(req);
      const loghistory = await Loghistory.create([{
        userId: loggedinuserId ? loggedinuserId : "",
        recordId: bulkLastInsertID,
        existingvalue: action == "BulkInsert" ? "" : JSON.stringify(differ.old[0]),
        changedvalue: action == "BulkInsert" ? JSON.stringify(itemObject) : JSON.stringify(differ.new[0]),
        action: action,
        pagename: pageName
      }], { session });
    }));
  }
  const usercount = await MemberTypeCount.find();
  if (usercount.length > 0) {
    usercount.map(item => {
      item.a_class = a_classValue;
      item.b_class = b_classValue;
      item.c_class = c_classValue;
      item.save();
    })
  } else if (usercount.length == 0) {
    const createduser = await MemberTypeCount.create([{
      a_class: a_classValue,
      b_class: b_classValue,
      c_class: c_classValue
    }], { session });
  }
  return {
    status: true,
    statusCode: 201,
    data: { bulkInsertData }
  }
}

const loghistory = async ({ req, res, reqBody, action, pageName, session }) => {
  await timeout(3000);
  const differ = filter(existingvalueJson, reqBody);
  loggedinuserId = checkLogedinuserId(req);
  const loghistory = await Loghistory.create([{
    userId: loggedinuserId ? loggedinuserId : "",
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

const loghistorylist = async ({ pagename, session }) => {
  const UsersData = await Loghistory.find(
    {
      pagename: pagename,
    }
  );
  return {
    status: true,
    statusCode: 201,
    message: 'Log history list!',
    data: UsersData
  }
}

const getuserDetail = async ({ _id, session }) => {
  try {
    var data = await User.findOne({ _id });
    if (!data) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found"
      };
    }
    let familyMembers = [];
    const familyData = await FamilyDetails.findOne({ member_Id: _id }).exec();
    if (familyData) {
      familyMembers = await FamilyDetails.find({ familyId: familyData.familyId }).sort({ subId: 1 }).exec();
    }
    // Convert data to plain JavaScript object
    data = data.toObject();
    data.familyMembers = familyMembers; // Assigning familyMembers to data.familyMembers
    return {
      status: true,
      statusCode: 200,
      data: { data } // returning data directly
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Internal Server Error"
    };
  }
}

const userSearch = async ({ searchkey, searchType, session }) => {
  try {
    let data = [];
    if (searchkey) {
      if (searchType == "member") {
        data = await User.find(
          {
            "$or": [
              { memberId: { $regex: searchkey } },
              { firstname: { $regex: searchkey } },
              { lastname: { $regex: searchkey } },
              { fathername: { $regex: searchkey } },
              { mothername: { $regex: searchkey } },
              { username: { $regex: searchkey } },
              { phoneno: { $regex: searchkey } }
            ]
          }
        )
        if (!data) {
          return {
            status: false,
            statusCode: 404,
            message: "User not found"
          };
        }
        // Loop through each user data
        for (let i = 0; i < data.length; i++) {
          const user = data[i];
          const familyData = await FamilyDetails.find({ memberId: user._id }).exec();
          let familyId = "";
          let familyname = "";
          if (familyData.length > 0) {
            familyData.map(function (item1) {
              familyId = item1.familyId;
              familyname = item1.familyname;
            })
          }
          user['familyId'] = familyId;
          user['familyname'] = familyname;
        }
      } else {
        console.log("sdsd", searchkey, searchType)
        data = await FamilyDetails.find(
          {
            "$or": [
              { familyId: { $regex: searchkey } },
              { familyname: { $regex: searchkey } },
              { firstname: { $regex: searchkey } },
              { lastname: { $regex: searchkey } },
              { husorwife_name: { $regex: searchkey } },
              { relation: { $regex: searchkey } },
              { maritalStatus: { $regex: searchkey } }
            ]
          }
        )
        data = data.reduce((accumulator, current) => {
          const duplicated = accumulator.find(item => item['familyname'] === current['familyname']);
          if (!duplicated) {
            accumulator.push(current);
          }
          return accumulator;
        }, []);

        if (!data) {
          return {
            status: false,
            statusCode: 404,
            message: "User not found"
          };
        }
      }
    }
    return {
      status: true,
      statusCode: 200,
      data: { data } // returning data directly
    };
  } catch (error) {
    console.log(error)
    return {
      status: false,
      statusCode: 500,
      message: "Internal Server Error"
    };
  }
}

const userupdate = async ({ reqBody, session }) => {
  await timeout(3000);
  const parsedData = JSON.parse(reqBody.user);
  console.log(parsedData)
  const _id = parsedData._id;
  const existingvalueData = await Users.findOne({ _id });
  existingvalueJson.username = existingvalueData.username;
  existingvalueJson.password = existingvalueData.password;
  existingvalueJson.roles = existingvalueData.roles;
  existingvalueJson.isAdministrator = existingvalueData.isAdministrator;
  existingvalueJson.position = existingvalueData.position;
  existingvalueJson.memberId = existingvalueData.memberId;
  existingvalueJson.firstname = existingvalueData.firstname;
  existingvalueJson.lastname = existingvalueData.lastname;
  existingvalueJson.phoneno = existingvalueData.phoneno;
  existingvalueJson.fathername = existingvalueData.fathername;
  existingvalueJson.mothername = existingvalueData.mothername;
  existingvalueJson.gender = existingvalueData.gender;
  existingvalueJson.avatar = existingvalueData.avatar;
  existingvalueJson.address = existingvalueData.address;
  existingvalueJson.dob = existingvalueData.dob;
  existingvalueJson.balanceTribute = existingvalueData.balanceTribute;
  existingvalueJson.userType = existingvalueData.userType;
  existingvalueJson.userTypefullchangedDate = existingvalueData.userTypefullchangedDate;
  existingvalueJson.usertypeSavedhalf = existingvalueData.usertypeSavedhalf;
  existingvalueJson.memberType = existingvalueData.memberType;
  existingvalueJson.memberTypeSavedbclass = existingvalueData.memberTypeSavedbclass;
  existingvalueJson.memberTypebclasschangedDate = existingvalueData.memberTypebclasschangedDate;
  existingvalueJson.maritalStatus = existingvalueData.maritalStatus;
  existingvalueJson.maritalStatusSavedsingle = existingvalueData.maritalStatusSavedsingle;
  existingvalueJson.maritalchangedDate = existingvalueData.maritalchangedDate;
  existingvalueJson.remark = existingvalueData.remark;
  existingvalueJson.IdentityProof = existingvalueData.identityProof;
  existingvalueJson.IdentityProofNo = existingvalueData.identityProofNo;
  existingvalueJson.status = existingvalueData.status;
  existingvalueJson.nationality = existingvalueData.nationality;
  existingvalueJson.qualification = existingvalueData.qualification;
  existingvalueJson.jobType = existingvalueData.jobType;
  existingvalueJson.jobportal = existingvalueData.jobportal;
  existingvalueJson.jobdetails = existingvalueData.jobdetails;
  existingvalueJson.familyId = existingvalueData.familyId;
  // console.log(parsedData);

  const usercount = await MemberTypeCount.find();
  let a_classMembercount = "";
  let b_classMembercount = "";
  let c_classMembercount = "";
  if (parsedData.memberTypeSavedbclass == 'yes') {
    if (usercount.length > 0) {
      if (parsedData.memberType == 'a-class') {
        a_classMembercount = padDigits(usercount[0].a_class + 1, 4);
      } else if (parsedData.memberType == 'b-class') {
        b_classMembercount = padDigits(usercount[0].b_class + 1, 4);
      }
    }

    if (parsedData.memberType == 'b-class') {
      parsedData.memberId = "B" + b_classMembercount;
    } else if (parsedData.memberType == 'a-class') {
      parsedData.memberId = "A" + a_classMembercount;
      if (usercount.length > 0) {
        usercount.map(item => {
          if (parsedData.memberType == 'a-class') {
            item.a_class = item.a_class + 1;
          }
          item.save();
        })
      }
    }
  }

  if (parsedData.type == 'full') {
    parsedData.usertypeSavedhalf = 'no';
  }
  if (parsedData.maritalStatus == 'married' || parsedData.maritalStatus == 'widowed') {
    parsedData.maritalStatusSavedsingle = 'no';
  }
  if (parsedData.memberType == 'a-class') {
    parsedData.memberTypeSavedbclass = 'no';
  }

  const updatedcontroller = await Users.findOneAndUpdate({ _id }, { $set: parsedData }, { session })
  const updatedcontrollerId = JSON.parse(JSON.stringify(updatedcontroller));
  lastInsertId = updatedcontrollerId._id;
  return {
    status: true,
    statusCode: 201,
    data: { updatedcontroller }
  }
}

const familymembersupdate = async ({ reqBody, session }) => {
  console.log(reqBody);
  await timeout(3000);
  const parsedData = reqBody.familyMembers;
  const _id = parsedData._id;
  const userparsedData = JSON.parse(reqBody.user);
  if (parsedData.length > 0) {
    try {
      for (const record of parsedData) {
        if (record.id != '') {
          const existingRecord = await familyDetails.findOne({ _id: record.id });
          await familyDetails.updateOne({ _id: existingRecord.id }, record);
        } else {
          delete record.id;
          let familyIdcount = "";
          let familySubId = "";
          let familyLevelno = "";
          let family_Id = "";
          let family_name = "";
          let familyDetail_Count = "";
          if (record.isnewFamily) {
            familyDetail_Count = await familyDetailCount.find();
            if (familyDetail_Count.length > 0) {
              familyDetail_Count.map(item => {
                familyIdcount = item.familyCount + 1;
                item.familyCount = item.familyCount + 1;
                item.save();
              })
            }
            if (familyDetail_Count.length == 0) {
              familyIdcount = 1;
              const createduser = await familyDetailCount.create([{
                familyCount: 1,
              }], { session });
            }
            family_Id = "F" + padDigits(familyIdcount, 5);
            family_name = record.firstname + record.lastname + "_" + family_Id;
            familySubId = "A1";
            familyLevelno = 1;
            if (record.memberId) {
              var newvalues = { $set: { familyId: family_Id } };
              await Users.findOneAndUpdate({ _id: record.membersId }, newvalues)
            }
          } else {
            const familyDetail_subId = await familyDetails.find({
              familyId: record.familyId,
            });
            if (record.ismarriedSamplePace == true) {
              familySubId = record.subId;
              familyLevelno = record.LevelNo;
            } else {
              if (familyDetail_subId.length > 0) {
                let subidcount = familyDetail_subId.length + 1;
                if (record.family_isaddBelowMember) {
                  familySubId = record.familySubId;
                  familyLevelno = 2;
                } else {
                  familySubId = "A" + subidcount;
                  familyLevelno = 1;
                }

              }
            }
            family_Id = record.familyId;
            family_name = record.familyname;
          }
          console.log(familySubId);
          record.familyId = family_Id;
          record.familyname = family_name.replace(/\s/g, '');
          record.subId = familySubId;
          record.LevelNo = familyLevelno;
          record.member_Id = record.member_Id;
          const newRecord = new familyDetails(record);
          await newRecord.save();
          if (record.ismember) {
            const _id = record.member_Id;
            await Users.findOneAndUpdate({ _id }, { $set: { familyId: family_Id } }, { session })
          }
        }
      }
      console.log('Records saved/updated successfully');
      return {
        status: true,
        statusCode: 201,
        data: { parsedData }
      }
    } catch (error) {
      console.log(error)
      //console.error('Error saving/updating records:', error);
      return {
        status: false,
        statusCode: 400,
        data: { error }
      }
    }
  } else {
    return {
      status: true,
      statusCode: 201,
      data: {}
    }
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
    return false;
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    if (decoded) {
      return decoded.id;
    }
  }
  catch (ex) { console.log(ex.message); return false; }
}

function padDigits(number, digits) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function removeStringSpace(str) {
  return str.replace(/\s/g, '');
}

module.exports = {
  createuser, createusercount, userslist, edituser, deleteuser, loghistory, loghistorylist, bulkInsert, getuserDetail, userSearch, userupdate, familymembersupdate, administratorList
};
