const User = require('./user');
const Route = require('./route');
const ServiceUpdate = require('./serviceUpdate');
const Invite = require('./invite');
const FullRun = require('./fullRun');
const DispatchReport = require('./dispatchReport');

Route.hasMany(ServiceUpdate, { onDelete: 'CASCADE' });
ServiceUpdate.belongsTo(Route);

User.hasMany(Invite, { foreignKey: 'userId' });
Invite.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(DispatchReport, { onDelete: 'CASCADE' });
DispatchReport.belongsTo(User);

User.hasMany(FullRun, { onDelete: 'CASCADE' });
FullRun.belongsTo(User);

module.exports = {
  User,
  Route,
  ServiceUpdate,
  Invite,
  FullRun,
  DispatchReport,
};
