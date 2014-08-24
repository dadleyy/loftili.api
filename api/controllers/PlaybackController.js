module.exports = (function() {

  function action(fn, req, res) {
    var device_id = req.body.device,
        track_id = req.body.track;

    if(!req.session.user)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('missing device id');

    if(fn === 'start' && !track_id)
      return res.status(400).send('missing track id');


    sails.log('[PlaybackController.' + fn + '] ' + fn + ' playback on ' + device_id);

    function finish(error, d_response, d_body) {
      if(error)
        return res.status(400).send(error);

      sails.log('[PlaybackController.finish] Successfully executed ' + fn + ' on  ' + device_id + ' STATUS[' + d_response.statusCode + ']');
      return res.status(202).json({
        body: d_body
      });
    }

    function foundDevice(err, permission) {
      if(err || !permission.user || !permission.device)
        return res.status(404).send('unable to find device');

      if(fn === 'start')
        sails.log('[PlaybackController.start] Found device, playing ' + permission.device.name);
      else
        sails.log('[PlaybackController.stop] Found device, stopping ' + permission.device.name);

      DeviceControlService[fn](permission.user, permission.device, track_id, finish);
    }

    Devicepermission.findOne({
        device: device_id, 
        user: req.session.user
      }).populate('device')
      .populate('user')
      .exec(foundDevice);
  }

  return {

    start: function (req, res) {
      action('start', req, res);
    },

    stop: function (req, res) {
      action('stop', req, res);
    }

  }

})();
