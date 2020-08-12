const router = require("express").Router();
const crypto = require("crypto");
const async = require("async");
const bcrypt = require("bcrypt");

const User = require("../../models/User");

const {
  auth,
  getUser,
  generateAccessCookie,
} = require("../../middleware/authMiddleware");

const { ALLOWED_UPDATE_FIELDS_USER } = require("../../utils/config.js");
const {
  getRandom,
  tokenExpirationTime,
} = require("../../utils/serverUtils.js");

const STRINGS = require("../../lang/en");

router.post("/register", async (req, res, next) => {
  const user = new User({ ...req.body });

  await user.getAuthToken(next, async (token) => {
    if (!token)
      return res
        .status(400)
        .send(`User with that email: '${req.body.email}'  already exists!`);

    await generateAccessCookie(res, token);
    res.status(201).send(user);
  });
});

router.post("/login", async (req, res, next) => {
  try {
    const { email = null, password = null } = req.body;
    const user = await User.findByCredentials(email, password);
    user.getAuthToken(next, async (token) => {
      await generateAccessCookie(res, token);

      await user.save();
      res.send(user);
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send(STRINGS.auth.noUserProfile);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();
    res.send(STRINGS.auth.logoutSuccess);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/recovery/email", (req, res, next) => {
  const { email } = req.body;

  async.waterfall(
    [
      (done) => {
        User.findOne({ email }).exec((err, user) => {
          if (!user)
            done(`Account associated with email "${email}" was not found.`);
          else done(err, user);
        });
      },
      (user, done) => {
        crypto.randomBytes(20, async (err, buffer) => {
          const token = buffer.toString("hex");
          done(err, user, token);
        });
      },
      (user, token, done) => {
        User.findByIdAndUpdate(
          { _id: user._id },
          {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + tokenExpirationTime,
          },
          { upsert: true, new: true }
        ).exec(async (err, newUser) => {
          const resetCode = getRandom();
          console.log("resetCode", resetCode);

          await user.runEncryption(
            next,
            "resetPasswordCode",
            `${resetCode}`,
            (hash) => {
              newUser.resetPasswordCode = hash;
              newUser.save();
              done(err, { resetCode, user: newUser, token });
            }
          );
        });
      },
      (data) => {
        const emailConfig = {
          resetCode: data.resetCode,
          tokenExpires: data.user.resetPasswordExpires,
          email: data.user.email,
        };

        sendResetPasswordEmail(emailConfig);

        res.json({
          success: true,
          message: `${STRINGS.auth.resetCodeSent} ${data.user.email}, enter that code here.`,
          token: data.token,
        });
      },
    ],
    (err) => res.status(422).json({ message: err })
  );
});

router.post("/recovery/reset-code", (req, res) => {
  const { resetPin, resetToken } = req.body;

  User.findOne(
    {
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    },
    async (err, user) => {
      const isMatch = await bcrypt.compare(
        `${resetPin}`,
        user.resetPasswordCode
      );

      if (!isMatch)
        return res.status(400).send({ error: STRINGS.auth.resetCodeExpired });

      const notification = {
        subject: `${user.email}, your password has been changed.`,
        description: `${user.email}, this is a confirmation that the password for your account ${user.email} has just been changed.`,
      };

      await user.save();

      const mailSent = true;
      if (mailSent) {
        return res.json({
          success: true,
          message: STRINGS.auth.setNewPassword,
        });
      }
    }
  );
});

router.post("/update-password", (req, res) => {
  const { password, resetToken } = req.body;

  User.findOne(
    {
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    },
    async (err, user) => {
      if (!user) {
        return res.status(400).send({ error: STRINGS.auth.resetTokenExpired });
      }
      try {
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordCode = undefined;

        await user.save();

        const mailSent = true;

        if (mailSent) {
          return res.json({
            success: true,
            message: "Password changed!",
          });
        }
        return res.status(400).send({
          error: STRINGS.auth.failedToSendPasswordChangeEmail,
        });
      } catch (error) {
        return res.status(400).send(error);
      }
    }
  );
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/update-user", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  const isValidField = updates.every((update) =>
    ALLOWED_UPDATE_FIELDS_USER.includes(update)
  );

  if (!isValidField)
    return res.status(400).send(STRINGS.auth.invalidUpdateField);

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/delete-account", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send({ message: STRINGS.auth.accountDeleted });
  } catch (error) {
    return res.status(400).send(STRINGS.auth.deleteAccountFail);
  }
});

router.post("/verify-account", auth, async (req, res) => {
  const { verificationCode } = req.body;
  try {
    const isMatch = await bcrypt.compare(
      verificationCode,
      req.user.confirmationCode
    );

    const isValid = await getUser(req.user);

    if (!isMatch || !isValid) {
      return res
        .status(400)
        .send({ error: STRINGS.auth.verificationCodeExpired });
    }

    req.user.confirmed = true;
    req.user.confirmationCode = undefined;
    req.user.confirmationExpires = undefined;

    const notification = {
      subject: `${req.user.email}, your account has been verified.`,
      description: `${req.user.email}, this is a confirmation that your account ${req.user.email} has just been verified.`,
    };

    req.user.save();
    res.send({ message: "Account verified!", user: req.user });
  } catch (error) {
    return res.status(400).send({ error: STRINGS.auth.failedToVerifyAccount });
  }
});

router.get("/verify-account-renew", auth, async (req, res, next) => {
  try {
    req.user.confirmationCode = undefined;
    req.user.confirmationExpires = undefined;

    const verificationCode = getRandom();
    console.log("verificationCode", verificationCode);
    await req.user.runEncryption(
      next,
      "confirmationCode",
      `${verificationCode}`,
      (hash) => {
        req.user.confirmationCode = hash;
        req.user.confirmationExpires = Date.now() + tokenExpirationTime;
        const notification = {
          subject: "New verification code!",
          description: `Your new verification code is [${verificationCode}]`,
        };

        req.user.save();
        res.send({
          message: STRINGS.auth.verificationSentToEmail,
          user: req.user,
        });
      }
    );
  } catch (error) {
    return res
      .status(400)
      .send({ error: STRINGS.auth.renewActivationCodeFailed });
  }
});

module.exports = router;