const mongoose = require("mongoose");

const familyDetails = mongoose.model(
  "familyDetails",
  new mongoose.Schema({
    isnewFamily:{
        type: Boolean,
        default: false,
    },
    ismarriedSamePlace:{
        type: Boolean,
        default: false
    },
    marriedpersionId: String,
    familyId: {
        type: String,
        required: [function() { return this.isnewFamily == false || this.ismarriedSamplePace == true || this.isSampleParent == true; }, "family Id required"]
    },
    familyname: String,
    subId: {
        type: String,
        required: [function() { return this.ismarriedSamplePace == true; }, "family sub Id required"]
    },
    LevelNo: String,
    ismember:{
        type: Boolean,
        default: false
    },
    memberId: String,
    member_Id:String,
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    gender: String,
    dob: String,
    phoneno: String,
    relation: String,
    maritalStatus: String,
    husorwife_name: String,
    IdentityProof: String,
    IdentityProofNo: String,
    address: String,
    nationality: String,
    qualification: String,
    jobType: String,
    jobportal: String,
    jobdetails: String,
    status: {
        type: String,
        required: true,
        default:"active"
    },
    remark: {
        type: String,
        maxlength: 250,
        trim: true,
        default:""
    },
    isSameParent:{
        type: Boolean,
        default: false
    },
    sameParentfatherfamilyId: String,
    sameParentmotherfamilyId: String,
    created_at: { type: Date },
    updated_at: { type: Date },
    created_by: String,
    updated_by: String,
  }, { timestamps: true })
);

module.exports = familyDetails;
