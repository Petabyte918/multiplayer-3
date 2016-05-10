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
		Juego = [],
		NomUser = ''; //Guarda toda la matriz del juego

// Inicialización de componentes repetitivos del DOM
	var DomPuntos = $("#Puntos"),
		DomMensajes = $('#Mensajes'),
		DomNum = $("#NumeroaBuscar");
		
//Genera una nueva de grilla de numeros Aleatorios
	function iniciaJuego(){
		Juego = lib.generaGrilla();
		if(Juego[0].length === 12){Juego[0].shift(); DibujaJuego(Juego);}else{DibujaJuego(Juego);};
	};

	alertify.prompt("<center style='font-size:30px'>Nickname</center>", "",
  		function(evt, value ){
  		websocket.emit('newUser',{Nombre:value,Puntaje: 0});
    	websocket.on('error',function(data){
    		if(data){
    			alertify.alert('El Usuario ya Existe');
    			setTimeout(function(){location.reload()},1000);
    		}else{
    			websocket.on('conectados',function(info){
    				alertify.success("Bienvenido "+info);
    				NomUser = info;
    			});
    		}
    	});
  	},function(){
    	alertify.error('Jugara solo');
  	});
  
	websocket.on('Users',function(data){
		console.log(data);
		$("#Users").html("");
		for(i in data){
			$("#Users").append("<p>Nombre: "+data[i].Nombre+" - Puntaje: "+data[i].Puntaje+"</p>");
		}
		if(data.length<=1){
			iniciaJuego();
			websocket.emit('IniJuego',Juego);
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
			$("#Users").append("<p><b>"+cont+". "+data[i].Nombre+" - "+data[i].Puntaje+"</b></p>");
		};
		
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
// Función que permite dibujar la cuadricula en el id="Juego" segun la mariz optenida por lib.generaGrilla() del Archivo juego.js
function DibujaJuego(Juego){
	console.log("entro");
      DomMensajes.html("");
      DomNum.html(numClick+1);
       var tds = `<table id="MyTable">
                    <tbody>`;
    	for (var i = 0; i < Juego.length; i++) {
    		tds += '<tr>';
    		for (var j = 0; j < Juego[i].length; j++) {
    				if(!Juego[i][j].Clickeado){
    					tds += `<td><div id="${Juego[i][j].Id}" class="cuadrado ${Juego[i][j].Clase}" style="background-color:${Juego[i][j].Color}"><div id="Numero">${Juego[i][j].Numero}<div></div></td>`;
    				}
    		};
    		tds += `</tr>`;
    	};
    		tds += `</tbody>
              </table>`;
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
			console.log("entre"+minutosString);
			segundos=0;
		}else if(horas<24){
			horasString = horas<10 ? "0"+horas++ : horas++;
			minutos=0;
		}
	}else{
		if(!fin){
			alertify.alert("<b>Felicitaciones a terminado el juego en: "+horas+":"+minutos+":"+segundos+" y su puntaje fue de: "+Puntaje+"</b>");
			fin = true;
		}
	}
	reloj = horasString+":"+minutosString+":"+segundosString;
	$("#Cronometro").html(reloj);
	setTimeout(function(){timer()},tiempo);
}timer();


$('#Start').click(function(){
	if(numClick===121){
		numClick=0;
		Puntaje=0;
		Juego = [];
		DomPuntos.html(Puntaje);	
		iniciaJuego()
		DomMensajes.html("");
		segundos = 00;
		minutos = 00;
		horas = 00;
		fin = false;
		websocket.emit('reiniciaJuego',{Juego: Juego, Clicks: numClick});
	}else{
		alertify.alert('La partida debe terminar para poderla reiniciar');
	}
});
// Prohíbe el uso de ctrl + f tomado de http://stackoverflow.com/questions/7091538/is-it-possible-to-disable-ctrl-f-of-find-in-page
window.addEventListener("keydown",function (e) {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) { 
        e.preventDefault();
    }
});

});
