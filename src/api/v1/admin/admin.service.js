const AnalyticsService = require('./analytics.service');
const ModerationService = require('./moderation.service');

module.exports = {
  analyticsService: new AnalyticsService(),
  moderationService: new ModerationService()
};