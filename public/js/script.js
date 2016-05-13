$(function()
{
	var websocket = io.connect();
		var Puntaje=0, // variable que guardara el puntaje del usuario  
		tiempo = 1000; //Velocidad del reloj en milisegundos
		segundos = 00;
		minutos = 1;
		horas = 1;
		numExitos = 0,
		NumNumeros=121,
		numClick = 0, // Variable que guarda el numero de clicks realizados por el usuario
		Juego = [], //Guarda toda la matriz del juego
		NomUser = '',
		tabla = '',
		newJuego = 30;


// Inicialización de componentes repetitivos del DOM
	var DomPuntos = $("#Puntos"),
		DomMensajes = $('#Mensajes'),
		DomNum = $("#NumeroaBuscar"),
		DomUser = $("#Usuario"),
		DomId = $("#id");

		
//se crea un json con sonidos...
	var audios = [
					{
						sonido 	: 	"success.mp3", 
						label	: 	"success"
					},
					{
						sonido 	: 	"error.mp3", 
						label	: 	"error"
					},
					{
						sonido 	: 	"tada.mp3", 
						label	: 	"tada"
					}
				 ];
	var sound = true;	

		
		
//Genera una nueva de grilla de numeros Aleatorios
	function iniciaJuego(){
		Juego = lib.generaGrilla();
		if(Juego[0].length === 12){Juego[0].shift(); DibujaJuego(Juego);}else{DibujaJuego(Juego);};
	};

  	function init(){
  		console.log(DomUser);
  		setTimeout(function(){
  		websocket.emit('newUser',{Nombre:DomUser.text(),Puntaje: 0, Color: lib.randomColor()});
  		websocket.on('error',function(data){
    		if(data){
    			alertify.alert('El Usuario ya Existe');
    			//setTimeout(function(){location.reload()},1000);
    			//Emitir una desconeccion y volver a conectar
    		}else{
    			websocket.on('conectados',function(info){
    				alertify.success("Bienvenido "+info.Nombre);
    				NomUser = info.Nombre;
    				numClick = info.Clicks;
    			});
    		}
    	});
  	},1000);
  	}init();


	websocket.on('Users',function(data){
		$("#Users").html("");
		var cont = 0;
		for (var i = data.length - 1; i >= 0; i--) {
			cont++;
			$("#Users").append("<b id='b' style='color:"+data[i].Color+"'>"+cont+". "+data[i].Nombre+" - "+data[i].Puntaje+"</b><br>");
		};
		reloadTable(data,0);
		if(data.length<=1){
			iniciaJuego();
			websocket.emit('IniJuego',Juego);
			numClick = 0;
		}else{
			websocket.emit('ingresaNewUser');
			websocket.on('inicioJuego',function(juego){
				console.log(juego);
				DibujaJuego(juego);
				Juego = juego;
			});
		}
	});

	websocket.on('Actualiza',function(data){
		$("#Users").html("");
		var cont = 0;
		for (var i = data.length - 1; i >= 0; i--) {
			cont++;
			$("#Users").append("<div id='txt'><b id='b' style='color:"+data[i].Color+"'>"+cont+". "+data[i].Nombre+" - "+data[i].Puntaje+"</b></div>");
		};
		reloadTable(data,0);
	});

	websocket.on('DibujeJuego',function(data){
		Juego = data.Juego;
		numClick = data.Clicks;
		DibujaJuego(Juego);
	})

	websocket.on("Desconectado",function(info){
		alertify.error("El usuario: "+info+" se a desconectado");
	});

	websocket.on("Puntua",function(info){
		alertify.error("El usuario: "+info+" ¡Puntua!");
	});

	websocket.on("BorraPuntajes",function(){
		Puntaje = 0;
		DomPuntos.html(Puntaje);
	});

	websocket.on("SeReiniciaJuego",function(data){
		reloadTable(data,1);
		alertify.dialog('alert').set({transition:'slide',title: "<b>El sistema reinicio el juego</b> " ,message: "<h3>Los puntajes quedaron así: </h3>"+tabla}).show(); 
	});

function reloadTable(data,tipo){
		tabla = '';
		if(tipo===1){
			var cont = 0;
			for (var i = data.usuarios.length - 1; i >= 0; i--) {
				cont++;
				tabla += "<p>"+cont+". "+data.usuarios[i].Nombre+" - "+data.usuarios[i].Puntaje+"</p>";
			};
		}else{
			var cont = 0;
			for (var i = data.length - 1; i >= 0; i--) {
				cont++;
				tabla += "<p>"+cont+". "+data[i].Nombre+" - "+data[i].Puntaje+"</p>";
			};
		}
}

// Función que permite dibujar la cuadricula en el id="Juego" segun la mariz optenida por lib.generaGrilla() del Archivo juego.js
function DibujaJuego(Juego){
      DomMensajes.html("");
      DomNum.html(numClick+1);
       var tds = '<table id="MyTable">'+
                    '<tbody>';
    	for (var i = 0; i < Juego.length; i++) {
    		tds += '<tr>';
    		for (var j = 0; j < Juego[i].length; j++) {
    				if(!Juego[i][j].Clickeado){
    					tds += "<td><div id='"+Juego[i][j].Id+"' class='cuadrado "+Juego[i][j].Clase+"' style='background-color:"+Juego[i][j].Color+"'><div id='Numero'>"+Juego[i][j].Numero+"<div></div></td>";
    				}
    		};
    		tds += '</tr>';
    	};
    		tds += '</tbody></table>';
			$("#Juego").html(tds);
// Se asignan los eventos a todos los div de clase .cuadrado			
	$(".cuadrado").click(function() {
		  numClick++;
          var oID = $(this).attr("id");
          console.log(oID);
          validaClick(oID,numClick);
	});
}

//Valida si al div que le dan click posee el numero que debe ser dependendo la cantidad de clicks dados
function validaClick(id,click){
 var idSeparado = id.split("_");
	if(Juego[idSeparado[0]][idSeparado[1]].Numero === click){
		sound === true ? createjs.Sound.play("success") : console.log("nosound");
		numExitos++;
		Juego[idSeparado[0]][idSeparado[1]].Clickeado = true;
		$("#"+id).removeClass("cuadrado ").addClass("Puntaje");
		$("#"+id).html("<div id='Numero'><b>¡10 puntos!<b></div>").fadeOut(800);
		DomPuntos.html(Puntaje+=10);
		if(numClick<NumNumeros){
			DomNum.html(numClick+1);
		}
		websocket.emit('juega',{Juego:Juego,Clicks:click,Nombre:NomUser,Puntaje: Puntaje});	
		return true;
	}else{
		numClick--;
		sound === true ? createjs.Sound.play("error") : console.log("nosound");
		return false;
	}

}

// Genera el tiempo para completar el juego y lo muestra en el DOM
var     segundosString = '00',
		minutosString = '00',
		horasString = '00',
		reloj='',
		fin = false;
function timer(){
	if(numClick<NumNumeros){	
		if(segundos<60){
			segundosString = segundos<10 ? "0"+segundos++ : segundos++;
		}else if(minutos<60){
			minutosString = minutos<10 ? "0"+minutos++ : minutos++;
			segundos=0;
		}else if(horas<24){
			horasString = horas<10 ? "0"+horas++ : horas++;
			minutos=0;
		}
	}else{
		if(!fin){
			//alertify.alert("<b>Felicitaciones a terminado el juego en: "+horas+":"+minutos+":"+segundos+" y su puntaje fue de: "+Puntaje+"</b>");
			alertify.dialog('alert').set({transition:'slide',title: "Fin del juego" ,message: "<h3>Los puntajes quedaron así: </h3>"+tabla}).show(); 
			numClick = 0;
			websocket.emit("ActualizaClicks");
			sound === true ? createjs.Sound.play("tada") : console.log("nosound");
			fin = true;
			newGame();
		}
	}
	reloj = horasString+":"+minutosString+":"+segundosString;
	$("#Cronometro").html(reloj);
	setTimeout(function(){timer()},tiempo);
}timer();


$('#Start').click(function(){
	alertify.confirm("Desea reiniciar el Juego", function(){
		reiniciaTodo();
	});
});

function reiniciaTodo(){
		numClick=0;
		Puntaje=0;
		newJuego=30;
		Juego = [];
		DomPuntos.html(Puntaje);	
		iniciaJuego()
		DomMensajes.html("");
		segundos = 00;
		minutos = 00;
		horas = 00;
		fin = false;
		websocket.emit('reiniciaJuego',{Juego: Juego, Clicks: numClick});		
}


function newGame(){
	if(newJuego>0){
		DomMensajes.html('<p id="Msg"> El juego se reiniciara automáticamente en: '+newJuego+'</p>');
		newJuego--;
		setTimeout(function(){newGame();},1000);
	}else{
		reiniciaTodo();
	}	
}


// Prohíbe el uso de ctrl + f tomado de http://stackoverflow.com/questions/7091538/is-it-possible-to-disable-ctrl-f-of-find-in-page
window.addEventListener("keydown",function (e) {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) { 
        e.preventDefault();
    }
});


//======================Area sonidos==============================================

				 
	//Se cargan los sonidos...	
	function Sonidos(){
		for(var audio = 0; audio < audios.length; audio++)
	{
		createjs.Sound.registerSound("sounds/" + audios[audio].sonido, audios[audio].label);
	}
	$("#sound").click(function(event)
	{
		if(sound)
		{
			sound=false;
			$("#sound").removeClass('sound');
			$("#sound").addClass('nosound');
		}
		else
		{
			sound=true;
			$("#sound").removeClass('nosound');
			$("#sound").addClass('sound');
		}
	});
}Sonidos();			 
	

});
