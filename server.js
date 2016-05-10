// server.js
var cons  = require("consolidate");
var express        = require('express');
var app            = express();
var httpServer = require("http").createServer(app);
//var Raspi = require("raspi-io");
httpServer.listen(3000);
var io= require('socket.io').listen(httpServer);

io.set('log level',1);
//var routes = require('./routes/rutas');
app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));



app.get('/', function(req, res, next) {
  res.render('index');
});

app.get("*", function(req, res){
  
  res.status(404).send("Página no encontrada :( en el momento");

});

var usuarios = [];
var Juego = [];
var usuariosConectados = {};
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
      io.sockets.emit("conectados", socket.nickname);
    }
        
  });

  socket.on('IniJuego',function(juego){
    Juego = juego;
  });
  
  socket.on('ingresaNewUser',function(){
    socket.emit('inicioJuego',Juego);
  });
 
  socket.on('juega',function(data){
    buscaUser(data);
    Juego = data.Juego;
    io.sockets.emit('DibujeJuego',{Juego: data.Juego, Clicks: data.Clicks});
    io.sockets.emit('Actualiza',usuarios);
    io.sockets.emit("Puntua",socket.nickname);
  });

  socket.on('reiniciaJuego',function(data){
    Juego = data.Juego;
    reiniciaUsuarios();
    io.sockets.emit('Actualiza',usuarios);
    io.sockets.emit('DibujeJuego',{Juego: data.Juego, Clicks: data.Clicks});
  });

  socket.on('disconnect', function () 
  {
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

function buscaUser(data){
  for(i in usuarios){
      if(usuarios[i].Nombre === data.Nombre){
         usuarios[i].Puntaje = data.Puntaje;
         break;
      };
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

console.log('Waiting for connection');




