const RecoveryLog = require("../models/RecoveryLog");

const getRecoveryLogs = async (req, res) => {
  try {
    const logs = await RecoveryLog.find({
      userId: req.userId,
    })
      .populate("transactionId")
      .populate("recoveryCaseId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get recovery logs error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getRecoveryLogs,
};