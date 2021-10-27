//variables Globales
const lista = document.querySelector('.lista'),
formulario = document.querySelector('.form');

nombreDB = 'Tareas';
versionDB = 1;

// configuarando IndexedDB

let peticion = indexedDB.open(nombreDB, versionDB);
let db = null;

peticion.onupgradeneeded = e=>{
    console.log('creando db')
    db = e.target.result;
    db.createObjectStore('tareas', {
        keyPath  : 'nombre',
    })
}

peticion.onsuccess = e=>{
    console.log('abierta db')
    db = e.target.result;
    consultar();

}


function consultar(renderizar=true, key=null){
    let transaccion = db.transaction('tareas', 'readonly');
    let almacen = transaccion.objectStore('tareas');
    let cursor = almacen.openCursor()
    let data = [];
    cursor.onsuccess = e =>{
        if(e.target.result == null) return false;
        data.push(e.target.result.value)

        if(!renderizar && key != null) {
            if(e.target.result.value.nombre == key) llenarFormulario(e.target.result.value);
        }
        e.target.result.continue();
    }

    transaccion.oncomplete = e =>{
        if(renderizar) return render(data);
    }
    return true;
}

function render(data){
    lista.innerHTML = '';
    let fragmento = document.
    createDocumentFragment();
    for (el of data){
        let tarea = document.createElement('article');
        let nombre = document.createElement('p');
        let acciones = document.createElement('section');
        let btnEditar = document.createElement('button');
        let btnEliminar = document.createElement('button');

        tarea.dataset.key = el.nombre;

        tarea.classList.add('tarea');
        nombre.classList.add('tarea-nombre');
        acciones.classList.add('tarea-acciones');
        btnEditar.classList.add('tarea-button');
        btnEliminar.classList.add('tarea-button', 'button-eliminar');

        nombre.textContent = el.nombre;
        btnEditar.textContent = 'editar';
        btnEditar.dataset.accion = 'editar';
        btnEliminar.textContent = 'eliminar';
        btnEliminar.dataset.accion = 'eliminar';

        tarea.style.setProperty('--color-usuario', el.nivel);

        acciones.appendChild(btnEditar);
        acciones.appendChild(btnEliminar);

        tarea.appendChild(nombre);
        tarea.appendChild(acciones);

        fragmento.appendChild(tarea);
    }

    lista.appendChild(fragmento);
    
    if(lista.children.length == 0){
        lista.innerHTML = `<article class="tarea">
            <h3 class="sin-tareas">No tienes Tareas </h3>
            <strong class="tarea-button" data-accion="iniciar">Agregar</strong>
        </article>`
    }

}


function crear(nodo){
    crearRegistro({nombre : nodo.nombre.value,
        nivel : nodo.nivel.value,
        });
    nodo.reset();
}

function crearRegistro(data){
    let transaccion = db.transaction('tareas', 'readwrite');
    let almacen = transaccion.objectStore('tareas');
    almacen.add(data);

    consultar();
}

function llenarFormulario(data){
    formulario.nombre.value = data.nombre;
    formulario.nivel.value = data.value;
    formulario.nombre.disabled = true;


    for(let opcion of formulario.nivel.options){

        if(opcion.value == data.nivel){
            opcion.selected = true;
            break;
        }
    }
}

function actualizar(nodo){
    nodo.dataset.accion == 'crear';
    nodo.querySelector('button').textContent = 'Agregar';
    nodo.nombre.disabled = false;

    let transaccion = db.transaction('tareas', 'readwrite');
    let almacen = transaccion.objectStore('tareas');
    almacen.put({nombre : nodo.nombre.value, nivel : nodo.nivel.value});

    nodo.reset();
    consultar();
}

function eliminar(key){
    let transaccion = db.transaction('tareas', 'readwrite');
    let almacen = transaccion.objectStore('tareas');
    almacen.delete(key);
    consultar();
}

function cargar(){

}


document.addEventListener('submit', e=>{
    e.preventDefault();
    if(e.target.dataset.accion == 'crear') crear(e.target);
    if(e.target.dataset.accion == 'editar') actualizar(e.target);
})


lista.addEventListener('click', e=>{
    if(e.target.dataset.accion == 'editar'){
        formulario.dataset.accion = 'editar';
        formulario.querySelector('button').textContent = 'Editar';
        consultar(false, e.target.parentElement.parentElement.dataset.key)
    }
    if(e.target.dataset.accion == 'eliminar') {
        eliminar(e.target.parentElement.parentElement.dataset.key);
    }
    if(e.target.dataset.accion == 'iniciar') {
        formulario.nombre.focus();
    }
})