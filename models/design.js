/*
 * Design Model
 */
var sha1 = require('sha1');

module.exports = function(mongoose){

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
    users: [{
      user_id: 'ObjectId',
      level: {
        /* Is this project public? 1 for yes. */
        type: Number,
        default: 1
      }
    }],
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

  schema.statics.findByUser = function(user_id){
    return this.find({
      users: {$elemMatch: {user_id: user_id}}
    });
  };

  schema.statics.addAttachment = function(fileInfo, callback){
    this.findOne({_id: fileInfo['designId']}).exec(function(err, design){
      var attachement = new attachmentModel({
        url: fileInfo['url']
      });
      design.attachments.push(attachement);
      design.save(function(err, design){
        callback(err, attachement);
      })
    })
  };

  var model = mongoose.model('Design', schema);

  var attachmentModel = mongoose.model('Attachment', Attachment);

  return model;
}