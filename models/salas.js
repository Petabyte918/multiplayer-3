var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SalasSchema = new Schema({
    id: String,
    nombre: String,
    NumClicks: Number,
    juego: Object,
    usuarios: Array
});

var Salas = mongoose.model('salas', SalasSchema);