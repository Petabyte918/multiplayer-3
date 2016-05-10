var lib = function() {
   
        Numeros = [], //Guardara un array de numeros de 1 a 121 de forma aleatoria
        NumNumeros = 121, //Cantidad de numeros a generar
        NumGrilla = 11, // Cantidad de numeros por columna
        Grilla = [], // Guardara cada gilla de 11
        usados = [], // Almacena los numeros que ya se han asignado para no repetir numeros
        Matriz = []; // Guarda toda las grillas generadas de a 11 en una sola Matriz

    var clasesAnimate = ["bounce","flash","pulse","rubberBand","shake","swing","tada","wobble","jello"];
 //la funcion GeneraNumeros crea el array con los numeros del 1 al 121 de forma aleatoria   
    function GeneraNumeros(){
        var cont = 0;
        do{
            if(cont<NumNumeros){
                var random = generAaleatorio(1,NumNumeros);
                Numeros.push(random);
                cont++; 
            }else{
                break;
            }
        }while(1);
    };
//La funcion generaGrilla recorre el array de numeros y lo va separando en 11 partes
    function generaGrilla(){
        usados = [];
        Matriz = [];
        Numeros = [];
        GeneraNumeros();
        var cont = 0;
        for (var i = 0; i <= NumNumeros; i++) {
            cont++;
            if(cont>=NumGrilla){
                cont=0;
                Grilla.push({   Numero: Numeros[i],
                                Clase: "animated "+generaClases(),
                                Clickeado: false,
                                Color: randomColor()
                            });
                Matriz.push(Grilla);
                Grilla = [];
            }else{
                Grilla.push({   Numero: Numeros[i],
                                Clase: "animated "+generaClases(),
                                Clickeado: false,
                                Color: randomColor()
                            });
            }
        };
        return ordenaIds(Matriz);
    };

// la funcion ordenaIds genera los ids propios de cada posicion de los numeros dentro de la Matriz esto para luego acceder a ellos
function ordenaIds(Mz){
    var MatrizOrdenada = Mz;
    for (var i = 0; i < Mz.length; i++) {
        for (var j = 0; j < Mz[i].length; j++) {
            MatrizOrdenada[i][j].Id = i+"_"+j;
        };   
    };
    return MatrizOrdenada;
}

// función para generar numeros aleatorios únicos from http://www.codigoactionscript.org/obtener-un-numero-aleatorio-sin-que-se-repita/#sthash.Gqj1Bbzn.dpuf    
function generAaleatorio(min, max)
{ 
    if (usados.length != NumNumeros+1) { 
        var num;
        var repe = false; 
        do { 
            num = Math.floor(Math.random() * (max - min + 1)) + min; 
                repe = repetido(num); 
        } while (repe != false); 
            usados.push(num); 
        return num; 
    } else { 
        return 0;
    } 
}  

function repetido(num) {
    var repe = false; 
        if(num != 0){
            for (var i = 0; i < usados.length; i++) { 
               if (num == usados[i]) {
                repe = true; 
               } 
            } 
        }else{
            repe = false;
        }
    return repe; 
} 

// genera clases de animate aleatoriamente
function generaClases(){
    return clasesAnimate[Math.floor(Math.random() * ((clasesAnimate.length-1) - 0 + 1)) + 0]
}

// from http://www.paulirish.com/2009/random-hex-color-code-snippets/
function randomColor()
    {
        return '#'+(function lol(m,s,c){return s[m.floor(m.random() * s.length)] +
        (c && lol(m,s,c-1));})(Math,'0123456789ABCDEF',4);
    };
    return {
        generaGrilla : generaGrilla,
        generaClases: generaClases
    }
}();
