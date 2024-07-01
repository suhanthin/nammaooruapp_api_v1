const mongoose = require('mongoose');
const pageName = 'committeeMeeting';
const { createCommitteeMeeting,
  committeeMeetingList,
  editCommitteeMeeting,
  deleteCommitteeMeeting,
  deleteCommitteeMeetingHistory,
  logHistory,
  createCommitteeMeetingHistory,
  committeeMeetingPayStatusList,
  getCommitteeMeetingDetail } = require('../utils/committeeMeetingActions');

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let headersSent = false;

  try {
    const reqBody = req.body;
    const action = 'create';
    const createcontrollerResult = await Promise.all([
      createCommitteeMeeting({ reqBody, session }),
      createCommitteeMeetingHistory({ reqBody, session }),
      //logHistory({ req, res, reqBody, action, pageName, session })
    ]);
    console.log(createcontrollerResult)
    const failedTxns = createcontrollerResult.filter((result) => result.status !== true);
    if (failedTxns.length) {
      const errors = failedTxns.map(a => a.message);
      await session.abortTransaction();

      if (!headersSent) {
        headersSent = true;
        return res.status(400).json({
          status: false,
          message: errors
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    if (!headersSent) {
      headersSent = true;
      return res.status(201).json({
        status: true,
        message: 'Committee meeting was created successfully!'
      });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (!headersSent) {
      headersSent = true;
      return res.status(500).json({
        status: false,
        message: `${err}`,
        err
      });
    }
  }
};

exports.update = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = req.params.key;
    const reqBody = req.body;
    const action = 'update';
    req.body.token = req.headers["x-access-token"];
    const createcontrollerResult = await Promise.all([
      editCommitteeMeeting(
        {
          _id, reqBody, session
        }
      ),
      logHistory(
        {
          req, res, reqBody, action, pageName, session
        }
      )
    ]);

    const failedTxns = createcontrollerResult.filter((result) => result.status !== true);
    if (failedTxns.length) {
      const errors = failedTxns.map(a => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors
      })
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'committeeMeeting is Updated successfully!'
    })
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `${err}`,
      err
    })
  }
}

exports.delete = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = req.params.key;
    req.body.status = "deleted";
    const reqBody = req.body;
    const action = 'delete';

    const createcontrollerResult = await Promise.all([
      deleteCommitteeMeeting(
        {
          _id, reqBody, session
        }
      ),
      deleteCommitteeMeetingHistory(
        {
          _id, reqBody, session
        }
      ),
      logHistory(
        {
          req, res, reqBody, action, pageName, session
        }
      )
    ]);

    const failedTxns = createcontrollerResult.filter((result) => result.status !== true);
    if (failedTxns.length) {
      const errors = failedTxns.map(a => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors
      })
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'committeeMeeting is deleted successfully!'
    })
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `${err}`,
      err
    })
  }
}

exports.committeeMeetingList = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let commiteeDetails = "";
  try {
    const { status } = req.body;
    const userResult = await Promise.all([
      committeeMeetingList(
        {
          status, session
        }
      ),
    ]);

    const failedTxns = userResult.filter((result) => result.status !== true);
    if (failedTxns.length) {
      const errors = failedTxns.map(a => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors
      })
    } else {
      if (userResult[0].status == true) {
        commiteeDetails = userResult[0].data
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'committeeMeeting details list!',
      commiteeDetails
    })
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to find perform transfer. Please try again. \n Error: ${err}`
    })
  }
}

exports.committeeMeetingpaystatusList = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let committeeMeetingDetails = "";
  try {
    const { mettingListquery } = req.body;
    const userResult = await Promise.all([
      committeeMeetingPayStatusList(
        {
          mettingListquery, session
        }
      ),
    ]);

    const failedTxns = userResult.filter((result) => result.status !== true);
    if (failedTxns.length) {
      const errors = failedTxns.map(a => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors
      })
    } else {
      if (userResult[0].status == true) {
        committeeMeetingDetails = userResult[0].data
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'committeeMeeting details list!',
      committeeMeetingDetails
    })
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to find perform transfer. Please try again. \n Error: ${err}`
    })
  }
}

exports.getCommitteeMeetingDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let commiteeDetail = "";
  try {
    const reqBody = req.body;
    const getuserDetailResult = await Promise.all([
      getCommitteeMeetingDetail(
        {
          reqBody, session
        }
      ),
    ]);
    const failedTxns = getuserDetailResult.filter((result) => result.status !== true);
    if (failedTxns.length) {
      const errors = failedTxns.map(a => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors
      })
    } else {
      if (getuserDetailResult[0].status == true) {
        commiteeDetail = getuserDetailResult[0].data;
      }
    }

    await session.commitTransaction();
    session.endSession();
    let committeeMeetingDetail = commiteeDetail.resultData;
    return res.status(200).json({
      committeeMeetingDetail
    })
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `${err}`,
      err
    })
  }
}