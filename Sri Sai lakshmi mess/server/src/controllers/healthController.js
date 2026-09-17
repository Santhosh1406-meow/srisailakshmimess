exports.getHealth = (req, res) => {
  return res.status(200).json({
    status: 'OK',
    message: 'Sri Sai Lakshmi Mess API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
