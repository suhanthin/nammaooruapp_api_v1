const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    memberId: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    roleName: String,
    isAdministrator: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      required: [function () { return this.isAdministrator == true; }, "position required"]
    },
    isChitCommitteeMember: {
      type: Boolean,
      default: false
    },
    chitCommitteePosition: {
      type: String,
      required: [function () { return this.isChitCommitteeMember == true; }, "Committee Position required"]
    },
    token: String,
    refresh_token: String,
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phoneno: {
      type: String,
      required: true,
    },
    fathername: {
      type: String,
      required: true,
    },
    mothername: String,
    gender: String,
    avatar: String,
    address: String,
    dob: String,
    balanceTribute: {
      type: Number,
      required: true,
      default: 0,
      integer: true,
      get: v => Math.round(v),
      set: v => Math.round(v),
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    userType: {
      type: String,
      required: true,
    },
    usertypeSavedhalf: {
      type: String,
      required: [function () { return this.userType == 'half'; }, "user type Saved half required"]
    },
    userTypefullchangedDate: String,
    maritalStatus: String,
    maritalStatusSavedsingle: {
      type: String,
      required: [function () { return this.maritalStatus == 'single'; }, "marital Status Saved single required"]
    },
    maritalchangedDate: String,
    memberType: {
      type: String,
      required: true,
    },
    memberTypeSavedbclass: {
      type: String,
      required: [function () { return this.memberType == 'b-class'; }, "member Type Saved b-class required"]
    },
    memberTypebclasschangedDate: String,
    memberTypebclassAddedDate: String,
    memberTypeSavedcclass: {
      type: String,
      required: [function () { return this.memberType == 'c-class'; }, "member Type Saved c-class required"]
    },
    identityProof: String,
    identityProofNo: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.identityProof) {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: 'Identity Proof Number is required when Identity Proof is provided'
      }
    },
    nationality: {
      type: String,
      default: 'indian'
    },
    qualification: String,
    jobType: String,
    jobportal: {
      type: String,
      required: [function () { return this.jobType == 'Govt' }, "job portal required"]
    },
    jobdetails: String,
    jobProfessional: String,
    familyId: String,
    status: {
      type: String,
      required: true,
      default: 'active'
    },
    remark: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    created_by: String,
    updated_by: String,
    isEnrolledAfterRecord: Boolean,
    enrollDate: String,
    enrolledType: String,
    reJoiningDate: String,
    isChanthaRequired: Boolean,
    statusDismisstoActive: {
      type: Boolean,
      default: false
    },
  }, { timestamps: true })
);

module.exports = User;
