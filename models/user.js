var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    provider: String,
    provider_id: {type: String, unique: true},
    createdAt: {type: Date, default: Date.now}
});

var User = mongoose.model('user', UserSchema);