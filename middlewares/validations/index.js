const JOI = require("@hapi/joi");

const signupSchema = JOI.object().keys({
  email: JOI.string().regex(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9!#$%&'*+/=?^_`{|}~-]+\.[a-z0-9]{2,3}/).required(),
  referralCode:JOI.string().allow("").optional(),
});

exports.signup = (req, res, next) => {
  const result = signupSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};
const loginSchema = JOI.object().keys({
  email: JOI.string().regex(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9!#$%&'*+/=?^_`{|}~-]+\.[a-z0-9]{2,3}/).required(),
});

exports.login = (req, res, next) => {
  const result = loginSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};

const setReferralCodeSchema = JOI.object().keys({
  code: JOI.string().required().min(6).max(6),
});

exports.setReferralCode = (req, res, next) => {
  const result = setReferralCodeSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};


const secret_phrase_1_Schema = JOI.object().keys({
  "secret_phrase_1": JOI.string().required(),
});

exports.secret_phrase_1 = (req, res, next) => {
  const result = secret_phrase_1_Schema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};
const secret_phrase_2_Schema = JOI.object().keys({
  "secret_phrase_2": JOI.string().required(),
});

exports.secret_phrase_2 = (req, res, next) => {
  const result = secret_phrase_2_Schema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};
const secret_phrase_3_Schema = JOI.object().keys({
  "secret_phrase_3": JOI.string().required(),
});

exports.secret_phrase_3 = (req, res, next) => {
  const result = secret_phrase_3_Schema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};
const verifyOtpSchema = JOI.object().keys({
  otpCode: JOI.number().required(),
  email: JOI.string().regex(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9!#$%&'*+/=?^_`{|}~-]+\.[a-z0-9]{2,3}/).required()
});

exports.verifyOtp = (req, res, next) => {
  const result = verifyOtpSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};

const resendOTPSchema = JOI.object().keys({
  email: JOI.string().regex(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9!#$%&'*+/=?^_`{|}~-]+\.[a-z0-9]{2,3}/).required()
});

exports.resendOTP = (req, res, next) => {
  const result = resendOTPSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ msg: result.error.message });
  } else {
    next();
  }
};
