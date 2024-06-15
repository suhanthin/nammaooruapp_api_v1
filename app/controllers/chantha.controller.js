const mongoose = require('mongoose');
const pageName = 'chantha';
const { createchantha, editchantha, deletechantha, chanthaList, loghistory, getChanthaDetail } = require('../utils/chanthaActions');

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reqBody = req.body;
    const action = 'create';
    const createcontrollerResult = await Promise.all([
      createchantha(
        {
          reqBody, session
        }
      ),
      loghistory(
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
      message: 'chantha was created successfully!'
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

exports.update = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = req.params.key;
    const reqBody = req.body;
    const action = 'update';
    req.body.token = req.headers["x-access-token"];
    const createcontrollerResult = await Promise.all([
      editchantha(
        {
          _id, reqBody, session
        }
      ),
      loghistory(
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
      message: 'chantha is Updated successfully!'
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
      deletechantha(
        {
          _id, reqBody, session
        }
      ),
      loghistory(
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
      message: 'chantha is deleted successfully!'
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

exports.chanthaList = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let chanthaDetails = "";
  try {
    const { status } = req.body;
    const userResult = await Promise.all([
      chanthaList(
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
        chanthaDetails = userResult[0].data
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: 'chantha details list!',
      chanthaDetails
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

exports.getChanthaDetailq = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reqBody = req.body;
    const action = 'details';
    req.body.token = req.headers["x-access-token"];
    const createcontrollerResult = await Promise.all([
      getChanthaDetail(
        {
          reqBody, session
        }
      ),
      loghistory(
        {
          req, res, reqBody, action, pageName, session
        }
      )
    ]);

    const failedTxns = createcontrollerResult.filter((result) => result.status !== true);
    console.log(failedTxns);
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
      message: 'chantha is Updated successfully!'
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

exports.getChanthaDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let chanthaDetail = "";
  try {
    const reqBody = req.body;
    const getuserDetailResult = await Promise.all([
      getChanthaDetail(
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
        chanthaDetail = getuserDetailResult[0].data;
      }
    }

    await session.commitTransaction();
    session.endSession();
    let chanthaDetails = chanthaDetail.data;
    return res.status(200).json({
      chanthaDetails
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