module.exports = {

  attributes: {

    from: {
      model: 'user',
      required: true
    },

    token: {
      type: 'string',
      required: true,
      size: 10
    },

    to: {
      type: 'email',
      required: true
    },

    accepted: {
      model: 'user'
    }

  }

};
