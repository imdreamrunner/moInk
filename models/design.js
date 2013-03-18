/*
 * Design Model
 */
var sha1 = require('sha1');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (mongoose) {

  var Attachment = mongoose.Schema({
    url: String,
    upload_date: {
      type: Date,
      default: Date.now
    },
    server_id: {
      type: Number,
      default: 1
    }
  });

  var schema = mongoose.Schema({
    users: [
      {
        user_id: 'ObjectId',
        level: {
          /* Is this project public? 1 for yes. */
          type: Number,
          default: 1
        }
      }
    ],
    type: {
      /* Is it a postcard */
      type: Number,
      default: 1
    },
    version: {
      /* editor version */
      type: Number,
      default: 1
    },
    title: String,
    tags: String,
    settings: String,
    content: String,
    create_date: {
      type: Date,
      default: Date.now
    },
    attachments: [Attachment]
  });

  schema.statics.findByUser = function (userId) {
    return this.find({
      users: {$elemMatch: {user_id: userId}}
    });
  };

  schema.statics.addAttachment = function (fileInfo, callback) {
    this.findOne({_id: fileInfo['designId']}).exec(function (err, design) {
      var attachement = new attachmentModel({
        url: fileInfo['url']
      });
      design.attachments.push(attachement);
      design.save(function (err, design) {
        callback(err, attachement);
      })
    })
  };

  schema.statics.checkPermission = function (designId, userId, callback) {
    this.find({_id: new ObjectId(designId)}).exec(function (err, designs) {
      if (designs[0]) {
        var design = designs[0];
        var findUser = false;
        if (userId) {
          var users = design.users.toObject();
          for (var i in users) {
            if (users[i].user_id.toString() === userId) {
              findUser = true;
              break;
            }
          }
        }
        if (findUser) {
          callback(0, design);
        } else {
          callback(2, 'Permission denied.')
        }
      } else {
        callback(1, 'Design not found.');
      }
    });

  };

  var model = mongoose.model('Design', schema);

  var attachmentModel = mongoose.model('Attachment', Attachment);

  return model;
}