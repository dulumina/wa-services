const ipWhitelist = (req, res, next) => {
  const allowedIps = process.env.WHITELISTED_IPS;
  
  if (!allowedIps) {
    return next(); // Default is open if no whitelist specified
  }

  const clientIp = req.ip || req.connection.remoteAddress;
  const whitelist = allowedIps.split(",").map(ip => ip.trim());

  if (whitelist.includes(clientIp)) {
    return next();
  }

  return res.status(403).json({
    status: false,
    message: "Access Denied: IP not whitelisted",
  });
};

module.exports = {
  ipWhitelist
};
