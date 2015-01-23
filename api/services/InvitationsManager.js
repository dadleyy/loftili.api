var crypto = require('crypto'),
    jade = require('jade'),
    path = require('path'),
    juice = require('juice2'),
    sass = require('node-sass');

module.exports = (function() {

  var InvitationsManager = {},
      transport = sails.config.mail.transport;

  InvitationsManager.send = function(options, callback) {
    var from = options.from,
        to = options.to,
        created_invite;

    function sentEmail(err, info) {
      sails.log("[InvitationsManager][send] Sent callback | err[" + err + "] info[" + info.response + "]");

      if(err) {
        return callback(err, null);
      } else {
        return callback(null, created_invite);
      }
    }

    function sendMail(err, html) {
      if(err) {
        sails.log('[InvitationsManager][send] failed juicing');
        callback('failed juice', null);
      }

      var params = {
        from: 'no-reply@loftili.com',
        to: process.env['TEST_EMAIL'] ? process.env['TEST_EMAIL'] : to,
        subject: '[loftili] you\'ve been invited!',
        html: html
      };

      transport.sendMail(params, sentEmail);
    }

    function hasStyle(result) {
      var template_path = path.join(__dirname, '..', '..', 'views', 'email', 'invite.jade'),
          template_fn = jade.compileFile(template_path, {}),
          email_html = template_fn({token: created_invite.token});

      sails.log('[InvitationsManager][send] successfully created invite, making html email');
      juice.juiceContent(email_html, {url: 'http://', extraCss: result.css}, sendMail);
    }

    function created(err, invite) {
      if(err) { 
        sails.log('[InvitationsManager][send] unable to create or find the record based on params');
        return callback(err, null);
      }

      created_invite = invite;

      var sheet_path = path.join(__dirname, '..', '..', 'views', 'email', 'style.sass');

      sails.log('[InvitationsManager][send] generating the styles for the html email');

      sass.render({
        file: sheet_path,
        success: hasStyle,
        error: hasStyle
      });
    }

    function generated(err, buffer) {
      var token = buffer.toString('hex').substring(0, 10),
          params = {
            from: from,
            to: to,
            token: token
          };

      function alreadyExists(err, invitation) {
        if(err) { 
          sails.log('[InvitationsManager][send] unable to create or find the record based on params');
          return callback(err, null);
        }

        if(invitation.length > 0) {
          sails.log('[InvitationsManager][send] found existing invitation');
          return callback(null, invitation);
        } else {
          sails.log('[InvitationsManager][send] unable to find existing invitation, creating a new one');
          Invitation.findOrCreate(params, params, created);
        }
      }

      Invitation.find({from: from, to: to}, alreadyExists);
    }

    crypto.randomBytes(30, generated);
  };

  return InvitationsManager;

})();
