// server.js
var cons  = require("consolidate");
var bodyParser  = require('body-parser');
var express        = require('express');
var app            = express();
var session = require('express-session');
var httpServer = require("http").createServer(app);
httpServer.listen(3000);

// Login Facebook 
var mongoose = require('mongoose');
var passport = require('passport');
require('./models/user');
require('./routes/passport')(passport);

var routes = require('./routes/rutas');

var io= require('socket.io').listen(httpServer);

io.set('log level',1);


mongoose.connect('mongodb://localhost/trikatuka', 
  function(err, res) {
    if(err) throw err;
    console.log('Conectado con exito a la BD');
});


app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));


//app.use(express.cookieParser());
//app.use(express.methodOverride());
app.use(session({ secret: 'secretkey' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Configuración de Express
app.use(passport.initialize());
app.use(passport.session());



app.use('/', routes);




var usuarios = [];
var Juego = [];
var usuariosConectados = {};
var NumClicks = 0;
var newGame = false;
console.log('Servidor disponible en http://localhost:' + 3000);

//Socket connection handler
var salas = [];

io.sockets.on("connection",function(socket)
{
  console.log(socket.id);
  console.log('Un cliente se ha conectado');

  socket.on('newUser',function(data){
    console.log(data);
    if(usuariosConectados[data.Nombre]){
      socket.emit('error',true);
    }else{
      socket.emit('error',false);
      socket.nickname = data.Nombre;
      usuariosConectados[data.Nombre] = socket.nickname;
      console.log(socket.nickname);
      usuarios.push(data);
      io.sockets.emit('Users',usuarios);

      io.sockets.emit("conectados", {Nombre: socket.nickname, Clicks: NumClicks});
    }
        
  });

  socket.on('IniJuego',function(juego){
     Juego = juego;
     NumClicks = 0;
     io.sockets.emit("conectados", {Nombre: socket.nickname, Clicks: NumClicks});
  });
  
  socket.on('ingresaNewUser',function(){
    socket.emit('inicioJuego',Juego);
  });
 
  socket.on('juega',function(data){
    findUser(socket.nickname,data.Puntaje);
    Juego = data.Juego;
    NumClicks = data.Clicks;
    io.sockets.emit('DibujeJuego',{Juego: data.Juego, Clicks: data.Clicks});
    io.sockets.emit('Actualiza',ordenarArray());
    io.sockets.emit("Puntua",socket.nickname);

  });

  socket.on('reiniciaJuego',function(data){
    if(!newGame){
      Juego = data.Juego;
      reiniciaUsuarios();

      //new line
      io.sockets.emit('SeReiniciaJuego',{usuarios: usuarios, User: socket.nickname});
      io.sockets.emit('Actualiza',usuarios);
      io.sockets.emit('DibujeJuego',{Juego: data.Juego, Clicks: data.Clicks});
      io.sockets.emit('BorraPuntajes');
      setTimeout(function(){newGame=false},10000);
    }
    
  });

  socket.on("ActualizaClicks",function(){
    NumClicks = 0
  });


  socket.on('disconnect', function () 
  {
      console.log(socket.nickname+" Se ha desconectado");
      //Eliminamos al usuario de los conectados
      delete usuariosConectados[socket.nickname];
      if(buscaEliminar(socket.nickname)!=-1){
        usuarios.splice(buscaEliminar(socket.nickname),1);
      }
      //Mandamos la información a las Sockets
      io.sockets.emit("Actualiza",usuarios);
      io.sockets.emit("Desconectado", socket.nickname);
  });

});

function reiniciaUsuarios(){
  for(i in usuarios){
    usuarios[i].Puntaje = 0;
  }
}

function findUser(user,puntaje){
  for(i in usuarios){
    if(usuarios[i].Nombre === user){
      usuarios[i].Puntaje = puntaje;
      break;
    }
  }
}

function buscaEliminar(nombre){
  for(i in usuarios){
      if(usuarios[i].Nombre === nombre){
         return i;
         break;
      };
    }
  return -1;
}

function ordenarArray(){
  var ArrayOrdenado = usuarios;
  var cont = 0;
  ArrayOrdenado.sort(function (a, b) {
  if (a.Puntaje > b.Puntaje) {
    return 1;
  }
  if (a.Puntaje < b.Puntaje) {
    return -1;
  }
  return 0;
});
return ArrayOrdenado;
}

console.log('Waiting for connection');




