const router = require('express').Router();
const { User, Invite } = require('../../db/models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.NODEMAILER_EMAIL,
//     pass: process.env.NODEMAILER_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });
function generateRandomPassword(length) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

router.post('/user/invite', async (req, res) => {
  try {
    const { email, userType } = req.query;

    // Check if the email exists for any users in the User table
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Check if the email exists for any invites in the Invite table
    const existingInvite = await Invite.findOne({
      where: {
        email,
      },
    });

    if (existingInvite) {
      if (existingInvite.activated) {
        return res.status(400).json({ error: 'Email is already activated.' });
      }
      if (
        existingInvite.lastEmailSuccess &&
        existingInvite.lastEmailSent &&
        new Date(existingInvite.lastEmailSent) >
          new Date(new Date() - 5 * 60 * 1000)
      ) {
        const timeToWait = Math.ceil(
          (new Date(existingInvite.lastEmailSent).getTime() +
            5 * 60 * 1000 -
            new Date().getTime()) /
            1000
        );
        return res.status(400).json({
          error: `Please wait ${timeToWait} seconds before sending another invite.`,
        });
      }
    }
    const password = generateRandomPassword(12);
    // Generate a token for the invite link
    const now = new Date().getTime();
    const token = jwt.sign(
      { email, createdAt: now }, // Use now.getTime() to get the numeric timestamp
      process.env.SESSION_SECRET,
      { expiresIn: '3d' }
    );
    // Send invite email
    const mailConfigurations = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'OCC Transport Portal Login',
      html: `
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background-color: #2596be;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #2596be;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          }
          .password-box {
            border: 1px solid #2596be;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to OCC Transport!</h2>
          </div>
          <div class="content">
            <p>Here is the link to set up your account:</p>
            <p>
              <a href="${
                process.env.env === 'development'
                  ? 'http://localhost:3000'
                  : 'https://dispatch.occtransport.org'
              }/set-up-account?token=${token}" class="button">
                Set Up Account
              </a>
            </p>
            <p>Your temporary password is:</p>
            <div class="password-box">
              <p>${password}</p>
            </div>
            <p>Please change your password as soon as possible!</p>
            <p><p>
            <p>Thank you,</p>
            <p>The Portal</p>
          </div>
        </div>
      </body>
    </html>
      `,
    };

    transporter.sendMail(mailConfigurations, async (error, info) => {
      if (error) {
        try {
          if (existingInvite) {
            await existingInvite.update({
              lastEmailSent: now,
              lastEmailSuccess: false,
              userType,
            });
          }
        } catch (updateError) {
          console.error(
            'Error updating invite entry after email send error:',
            updateError
          );
        }

        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send invite email.' });
      } else {
        try {
          if (existingInvite) {
            // Update the existingInvite entry after a successful email send

            await existingInvite.update({
              password,
              lastEmailSent: now,
              lastEmailSuccess: true,
              userType,
            });
          } else {
            // Create a new Invite entry after a successful email send

            await Invite.create({
              email,
              password,
              lastEmailSent: now,
              lastEmailSuccess: true,
              createdBy: 0,
              userType,
            });
          }
        } catch (updateError) {
          console.error(
            'Error updating/creating invite entry after successful email send:',
            updateError
          );
          return res
            .status(500)
            .json({ error: 'Failed to update/create invite entry.' });
        }

        return res.status(200).json({ message: 'Invite sent successfully.' });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/user/create', async (req, res) => {
  try {
    const { password, tempPassword, token } = req.body;

    // Check if the token exists in the request headers
    // const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!password) {
      return res
        .status(401)
        .json({ error: 'A passsword of at least 8 characters is required.' });
    }
    if (!tempPassword) {
      return res.status(401).json({ error: 'Temporary password incorrect.' });
    }
    try {
      const { password, tempPassword, token } = req.body;
      // Verify the JWT with expiration check
      const decoded = jwt.verify(token, process.env.SESSION_SECRET);
      const { email, exp } = decoded;

      if (Date.now() >= exp * 1000) {
        return res.status(400).json({ error: 'Token has expired' });
      }

      const invite = await Invite.findOne({ where: { email } });

      if (!invite || invite.activated) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      if (!invite.correctPassword(tempPassword)) {
        return res
          .status(401)
          .json({ error: 'Temporary password is incorrect!!!' });
      }
      const user = await User.create({
        email,
        password,
        userType: invite.userType,
      });

      if (user) {
        await invite.destroy();
      }

      const newToken = jwt.sign(
        { id: user.dataValues.id },
        process.env.SESSION_SECRET,
        { expiresIn: 86400 }
      );
      return res.json({
        ...user.dataValues,
        token: newToken,
      });
    } catch (error) {
      console.error('Error verifying JWT:', error);
      return res.status(401).json({ error: 'Unauthorized 2' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { password, email, userType } = req.body;

    if (!password || !email || !userType) {
      return res
        .status(400)
        .json({ error: 'Email, password and user type required! ' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters!' });
    }

    const user = await User.create(req.body);

    const token = jwt.sign(
      { id: user.dataValues.id },
      process.env.SESSION_SECRET,
      { expiresIn: 86400 }
    );
    res.json({
      ...user.dataValues,
      token,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(401).json({ error: 'User already exists!' });
    } else if (error.name === 'SequelizeValidationError') {
      return res.status(401).json({ error: 'Validation error.' });
    } else next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required!' });

    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      console.log({ error: `No user found for username: ${email}` });
      res.status(401).json({ error: 'Wrong username and/or password.' });
    } else if (!user.correctPassword(password)) {
      console.log({ error: 'Wrong username and/or password.' });
      res.status(401).json({ error: 'Wrong username and/or password.' });
    } else {
      const token = jwt.sign(
        { id: user.dataValues.id },
        process.env.SESSION_SECRET,
        { expiresIn: 86400 }
      );
      res.json({
        ...user.dataValues,
        token,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/delete-account/:userId', async (req, res, next) => {
  try {
    const { userType } = req.user;
    if (userType !== 'admin') {
      return res.status(403).json({ error: 'Permission denied!' });
    }

    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID parameter required.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.destroy();
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.delete('/logout', (req, res, next) => {
  res.sendStatus(204);
});
router.get('/users', async (req, res, next) => {
  try {
    const { userType, id } = req.user;

    if (userType !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      where: {
        id: { [Op.ne]: id },
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});
router.get('/user', (req, res, next) => {
  if (req.user) {
    return res.json(req.user);
  } else {
    return res.json({});
  }
});

router.put('/update-user/:userId', async (req, res, next) => {
  try {
    const { userType } = req.user;
    if (userType !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID parameter required' });
    }

    const { password, email, newType } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (password) {
      user.password = password;
    }
    if (email) {
      user.email = email;
    }
    if (newType) {
      user.userType = newType;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
});
router.post('/password/set/:token', async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    if (!token) {
    }

    const decodedToken = jwt.verify(token, process.env.SESSION_SECRET);
    const userId = decodedToken.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/password/change', async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});
router.post('/password/recover', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const token = jwt.sign(
      { id: user.dataValues.id },
      process.env.SESSION_SECRET,
      { expiresIn: '10m' }
    );

    const mailConfigurations = {
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: 'Reset your password',
      html: `
		  <html>
			<head>
			  <style>
				body {
				  font-family: 'Arial', sans-serif;
				  line-height: 1.6;
				  color: #333;
				}
				.container {
				  max-width: 600px;
				  margin: 0 auto;
				}
				.header {
				  background-color: #2596be;
				  color: #fff;
				  padding: 20px;
				  text-align: center;
				}
				.content {
				  padding: 20px;
				}
				.button {
				  display: inline-block;
				  padding: 10px 20px;
				  background-color: #2596be;
				  color: #fff;
				  text-decoration: none;
				  border-radius: 5px;
				}
			  </style>
			</head>
			<body>
			  <div class="container">
				<div class="header">
				  <h2>Password Reset</h2>
				</div>
				<div class="content">
				  <p>Hi there,</p>
				  <p>Here is the link for you to change your password.</p>
				  <p>Please follow the given link to reset your password:</p>
				  <p>
					<a href="${
            process.env.env === 'development'
              ? 'http://localhost:3000'
              : 'https://occt-dispatch-website-006ef2bb4dfc.herokuapp.com'
          }/change-password?token=${token}" class="button">
					  Reset Password
					</a>
				  </p>
				  <p>Thanks</p>
				</div>
			  </div>
			</body>
		  </html>
		`,
    };

    transporter.sendMail(mailConfigurations, function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send recovery email.' });
      } else {
        res
          .status(200)
          .json({ message: 'Password recovery email sent successfully' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/password/check-auth/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decodedToken = jwt.verify(token, process.env.SESSION_SECRET);
    if (decodedToken.createdAt) {
      const { email, createdAt } = decodedToken;
      const invite = await Invite.findOne({ where: { email } });
      if (!invite || invite.activated) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      if (createdAt !== invite.lastEmailSent.getTime()) {
        return res.status(400).json({ error: 'Invalid token' });
      }
    } else {
      const userId = decodedToken.id;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
