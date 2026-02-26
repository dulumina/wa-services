const { phoneNumberFormatter } = require('../helpers/formatter');
const { getClient } = require('../services/whatsapp');

const sendMessage = async (req, res) => {
  const sender = req.body.sender;
  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const client = getClient(sender);

  if (!client) {
    return res.status(422).json({
      status: false,
      message: `The sender: ${sender} is not found!`,
    });
  }

  const isRegisteredNumber = await client.isRegisteredUser(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: "The number is not registered",
    });
  }

  client
    .sendMessage(number, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        response: response,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        response: err,
      });
    });
};

module.exports = {
  sendMessage
};
