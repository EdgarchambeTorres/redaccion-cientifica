/**
 * Script Avanzado de Hotmart para ordenar Lecciones usando Detección Reactiva
 */

function ordenarContenidoHotmart() {
    console.log("🔍 Detectando estructura interna de Hotmart (Modo Avanzado)...");

    // 1. Buscar cualquier nodo de texto "hoja" (sin hijos) que contenga la palabra clave.
    // Con esto no importa si cambiaron las clases, encontraremos el texto.
    const tags = Array.from(document.querySelectorAll('*'));
    let nodosTexto = tags.filter(el => {
        if (el.children.length > 0) return false; 
        const txt = el.textContent.toLowerCase();
        return (txt.includes('lección') || txt.includes('leccion') || txt.includes('diapositiva') || txt.includes('lectura') || txt.includes('evaluación')) && /\d+/.test(txt);
    });

    if (nodosTexto.length === 0) {
        return console.error("❌ ERROR: No veo a simple vista un texto que diga 'Lección 01' o algo por el estilo. ¡Asegúrate de darle clic a la flechita del módulo para que se desplieguen las lecciones antes de correr el código!");
    }

    // 2. Inteligencia de Trazabilidad del DOM:
    // Tenemos el texto "Lección 01". Vamos a 'escalar' el árbol HTML hasta encontrar la caja que lo envuelve 
    // y que convive con "Diapositiva 01" y "Lectura 01".
    let hoja = nodosTexto[0];
    let contenedor = hoja.parentElement;
    
    // Subimos carpetas asumiendo un módulo usual tiene de 3 a más lecciones hijas.
    while (contenedor && contenedor.children.length < 3) {
        hoja = contenedor;
        contenedor = contenedor.parentElement;
    }

    if (!contenedor) return console.error("❌ ERROR: Estructura no reconocida.");

    let elementos = Array.from(contenedor.children);
    console.log(`✅ ¡He logrado interceptar la lista madre de Hotmart! Encontré ${elementos.length} elementos (filas) aquí.`);

    // 3. Diccionario de Prioridades según lo que pediste
    const prioridades = {
        "lección": 1, "leccion": 1,
        "diapositiva": 2,
        "lectura": 3,
        "evaluación": 4, "evaluacion": 4, "quiz": 4
    };

    // 4. Leer toda la lista y ordenarla
    const elementosMapeados = elementos.map(elemento => {
        const texto = elemento.innerText ? elemento.innerText.toLowerCase() : "";
        
        // Número extraído ("01", "12", etc)
        const matchNumero = texto.match(/(\d+)/);
        const numero = matchNumero ? parseInt(matchNumero[0], 10) : 999; 

        // Identificar su tipo (evaluando el diccionario en orden)
        let prioridad = 99; 
        for (let clave in prioridades) {
            if (texto.includes(clave)) {
                prioridad = prioridades[clave];
                break;
            }
        }
        return { elemento, numero, prioridad };
    });

    // Filtramos para ignorar falsos positivos y ordenamos
    elementosMapeados.sort((a, b) => {
        // Primero aseguramos que la Lección 02 no esté antes de la Lección 03...
        if (a.numero !== b.numero) {
            return a.numero - b.numero;
        }
        // Luego aseguramos que "Diapositiva" vaya después de "Lección" (1 al 4)
        return a.prioridad - b.prioridad;
    });

    // 5. Mover los elementos físicamente (Inyectar al final del DOM reciclará los nodos existentes)
    elementosMapeados.forEach(item => {
        if(item.numero !== 999) { // Solo si validamos que era una lección válida
             contenedor.appendChild(item.elemento);
        }
    });

    console.log(`✨ ¡Boom! Todo este módulo ha sido ordenado en este flujo:\n [Lección -> Diapositiva -> Lectura -> Evaluación]`);
    console.warn("⚠️ RECORDATORIO REACT: Dado que forzamos al navegador, quizás tengas que arrastrar y soltar un centímetro la última casilla con el mouse manualmente para que el botón azul de 'Guardar' de Hotmart se active y registre el cambio en su servidor.");
}

ordenarContenidoHotmart();
