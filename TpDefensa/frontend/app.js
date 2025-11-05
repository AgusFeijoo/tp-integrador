const API_URL = 'http://localhost:3000';

let currentUser = null;
let currentToken = null;

// Función para hacer peticiones HTTP
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        currentUser = data.usuario;
        currentToken = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));

        showDashboard();
        errorDiv.classList.remove('show');
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
});

// Quick login
function quickLogin(email) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = 'password123';
    document.getElementById('login-form').dispatchEvent(new Event('submit'));
}

// Verificar si hay sesión guardada
window.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
        currentToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
});

// Mostrar dashboard
function showDashboard() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');

    document.getElementById('user-name').textContent = currentUser.nombre;
    document.getElementById('user-role').textContent = `Rol: ${currentUser.rol}`;

    // Mostrar dashboard según rol
    document.getElementById('duenio-dashboard').style.display = 
        currentUser.rol === 'DUENIO' ? 'block' : 'none';
    document.getElementById('inspector-dashboard').style.display = 
        (currentUser.rol === 'INSPECTOR' || currentUser.rol === 'ADMIN') ? 'block' : 'none';
    document.getElementById('admin-dashboard').style.display = 
        currentUser.rol === 'ADMIN' ? 'block' : 'none';
}

// Logout
function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.getElementById('login-page').classList.add('active');
    document.getElementById('dashboard-page').classList.remove('active');
    document.getElementById('login-form').reset();
}

// Funciones DUENIO
async function cargarVehiculos() {
    const resultDiv = document.getElementById('mis-vehiculos');

    try {
        const data = await apiRequest('/vehiculos/mis-vehiculos');
        
        if (data.length === 0) {
            showResult(resultDiv, 'No tienes vehículos registrados. Agrega uno nuevo usando el formulario de arriba.', 'success');
            return;
        }

        const vehiculosHTML = data.map(vehiculo => `
            <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #667eea;">
                <div style="font-weight: 600; color: #667eea; margin-bottom: 8px;">${vehiculo.patente}</div>
                <div><strong>Marca:</strong> ${vehiculo.marca}</div>
                <div><strong>Modelo:</strong> ${vehiculo.modelo}</div>
                <div><strong>Año:</strong> ${vehiculo.anio}</div>
                <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 5px;">
                    <strong>ID del Vehículo (copia este UUID para solicitar turnos):</strong><br>
                    <code style="background: white; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-top: 5px; cursor: pointer; font-size: 12px;" onclick="copiarAlPortapapeles('${vehiculo.id}')" title="Click para copiar">${vehiculo.id}</code>
                </div>
            </div>
        `).join('');

        resultDiv.innerHTML = vehiculosHTML;
        resultDiv.classList.add('show', 'success');
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

async function crearVehiculo() {
    const patente = document.getElementById('nueva-patente').value.trim();
    const marca = document.getElementById('nueva-marca').value.trim();
    const modelo = document.getElementById('nuevo-modelo').value.trim();
    const anio = parseInt(document.getElementById('nuevo-anio').value);
    const resultDiv = document.getElementById('vehiculo-crear-result');

    if (!patente || !marca || !modelo || !anio) {
        showResult(resultDiv, 'Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const data = await apiRequest('/vehiculos', {
            method: 'POST',
            body: JSON.stringify({ patente, marca, modelo, anio })
        });

        showResult(resultDiv, `Vehículo creado exitosamente!\n\nPatente: ${data.patente}\nMarca: ${data.marca}\nModelo: ${data.modelo}\nAño: ${data.anio}\nID: ${data.id}`, 'success');
        
        // Limpiar campos
        document.getElementById('nueva-patente').value = '';
        document.getElementById('nueva-marca').value = '';
        document.getElementById('nuevo-modelo').value = '';
        document.getElementById('nuevo-anio').value = '';
        
        // Recargar lista de vehículos
        setTimeout(() => {
            cargarVehiculos();
        }, 1000);
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

// Función para copiar al portapapeles
function copiarAlPortapapeles(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        alert('ID copiado al portapapeles: ' + texto);
    }).catch(() => {
        // Fallback para navegadores que no soportan clipboard API
        const input = document.createElement('input');
        input.value = texto;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('ID copiado al portapapeles: ' + texto);
    });
}

async function consultarDisponibilidad() {
    const fecha = document.getElementById('fecha-disponibilidad').value;
    const resultDiv = document.getElementById('disponibilidad-result');

    if (!fecha) {
        showResult(resultDiv, 'Por favor selecciona una fecha', 'error');
        return;
    }

    try {
        const data = await apiRequest(`/turnos/disponibilidad?fecha=${fecha}`);
        showResult(resultDiv, `Horarios disponibles: ${data.horariosDisponibles.length}\n\n${data.horariosDisponibles.map(h => new Date(h).toLocaleString()).join('\n')}`, 'success');
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

async function solicitarTurno() {
    const idVehiculo = document.getElementById('turno-vehiculo').value.trim();
    const fechaHora = document.getElementById('turno-fecha').value;
    const resultDiv = document.getElementById('turno-result');

    if (!idVehiculo || !fechaHora) {
        showResult(resultDiv, 'Por favor completa todos los campos', 'error');
        return;
    }

    try {
        // Si el usuario ingresa una patente, intentamos buscar el vehículo
        let vehiculoId = idVehiculo;
        
        // Si no parece un UUID, intentamos buscar por patente
        if (!idVehiculo.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Nota: Necesitaríamos un endpoint para buscar vehículo por patente
            // Por ahora, usamos el ID directamente o la patente si es "ABC123"
            if (idVehiculo.toUpperCase() === 'ABC123') {
                // En el seed, el vehículo tiene patente ABC123, pero necesitamos el ID
                // Por ahora, mostramos un mensaje instructivo
                showResult(resultDiv, 'Por favor usa el ID del vehículo (UUID). Puedes obtenerlo del vehículo creado en el seed. Si no tienes el ID, usa el vehículo del seed con patente ABC123.', 'error');
                return;
            }
        }

        const fechaISO = new Date(fechaHora).toISOString();
        const data = await apiRequest('/turnos', {
            method: 'POST',
            body: JSON.stringify({
                idVehiculo: vehiculoId,
                fechaHora: fechaISO
            })
        });

        showResult(resultDiv, `Turno creado exitosamente!\n\nID Turno: ${data.id}\nEstado: ${data.estadoTurno}\nFecha: ${new Date(data.fechaHora).toLocaleString()}\nVehículo: ${data.vehiculo.patente}`, 'success');
        
        // Limpiar campos
        document.getElementById('turno-vehiculo').value = '';
        document.getElementById('turno-fecha').value = '';
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

async function obtenerMisTurnos() {
    const resultDiv = document.getElementById('mis-turnos');

    try {
        const data = await apiRequest('/turnos/mis-turnos');
        
        if (data.length === 0) {
            showResult(resultDiv, 'No tienes turnos registrados', 'success');
            return;
        }

        const turnosHTML = data.map(turno => {
            const tieneChequeo = turno.chequeo && turno.chequeo.id;
            const esRechequear = tieneChequeo && turno.chequeo.estadoResultado === 'RECHEQUEAR';
            
            // Colores y estilos según el estado del chequeo
            const borderColor = esRechequear ? '#dc3545' : '#667eea';
            const titleColor = esRechequear ? '#dc3545' : '#667eea';
            const backgroundColor = esRechequear ? '#fff5f5' : 'white';
            
            return `
            <div style="margin-bottom: 15px; padding: 15px; background: ${backgroundColor}; border-radius: 5px; border-left: 4px solid ${borderColor};">
                <div style="font-weight: 600; color: ${titleColor}; margin-bottom: 8px;">
                    ${esRechequear ? '⚠️ RECHEQUEAR - ' : ''}ID Turno: ${turno.id}
                </div>
                <div><strong>Vehículo:</strong> ${turno.vehiculo.patente} - ${turno.vehiculo.marca} ${turno.vehiculo.modelo}</div>
                <div><strong>Fecha:</strong> ${new Date(turno.fechaHora).toLocaleString()}</div>
                <div><strong>Estado Turno:</strong> <span style="padding: 2px 8px; background: ${turno.estadoTurno === 'CONFIRMADO' ? '#d4edda' : turno.estadoTurno === 'COMPLETADO' ? '#d1ecf1' : '#fff3cd'}; border-radius: 3px;">${turno.estadoTurno}</span></div>
                ${tieneChequeo ? `
                    <div style="margin-top: 8px;">
                        <strong>Estado Chequeo:</strong> 
                        <span style="padding: 2px 8px; background: ${esRechequear ? '#f8d7da' : '#d4edda'}; color: ${esRechequear ? '#721c24' : '#155724'}; border-radius: 3px; font-weight: 600;">
                            ${turno.chequeo.estadoResultado || 'En proceso'}
                        </span>
                        ${turno.chequeo.totalPuntaje ? ` - Puntaje: ${turno.chequeo.totalPuntaje}/80` : ''}
                    </div>
                    ${turno.chequeo.estadoResultado ? `<button onclick="verDetalleChequeo('${turno.chequeo.id}')" style="margin-top: 10px; background: ${esRechequear ? '#dc3545' : '#28a745'}; color: white;">Ver Detalle</button>` : ''}
                ` : ''}
            </div>
        `}).join('');

        resultDiv.innerHTML = turnosHTML;
        resultDiv.classList.add('show', 'success');
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

// Funciones INSPECTOR
async function cargarTurnosPendientes() {
    const resultDiv = document.getElementById('turnos-pendientes');

    try {
        const data = await apiRequest('/turnos/pendientes');
        
        if (data.length === 0) {
            showResult(resultDiv, 'No hay turnos pendientes', 'success');
            return;
        }

        const turnosHTML = data.map(turno => `
            <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #ff9800;">
                <div style="font-weight: 600; color: #ff9800; margin-bottom: 8px;">Turno Pendiente</div>
                <div><strong>ID:</strong> ${turno.id}</div>
                <div><strong>Vehículo:</strong> ${turno.vehiculo.patente} - ${turno.vehiculo.marca} ${turno.vehiculo.modelo}</div>
                <div><strong>Dueño:</strong> ${turno.vehiculo.duenio.nombre} (${turno.vehiculo.duenio.email})</div>
                <div><strong>Fecha:</strong> ${new Date(turno.fechaHora).toLocaleString()}</div>
                <button onclick="seleccionarTurnoParaConfirmar('${turno.id}')" style="margin-top: 10px; background: #28a745;">Confirmar Este Turno</button>
            </div>
        `).join('');

        resultDiv.innerHTML = turnosHTML;
        resultDiv.classList.add('show', 'success');
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

function seleccionarTurnoParaConfirmar(turnoId) {
    confirmarTurno(turnoId);
}

async function confirmarTurno(turnoId) {
    const resultDiv = document.getElementById('confirmar-result');

    try {
        const data = await apiRequest(`/turnos/${turnoId}/confirmar`, {
            method: 'POST'
        });

        showResult(resultDiv, `Turno confirmado exitosamente!\n\nID Turno: ${data.id}\nEstado: ${data.estadoTurno}\nVehículo: ${data.vehiculo.patente}\nDueño: ${data.vehiculo.duenio.nombre}`, 'success');
        
        // Recargar listas
        setTimeout(() => {
            cargarTurnosPendientes();
            cargarTurnosConfirmados();
        }, 1000);
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

async function cargarTurnosConfirmados() {
    const resultDiv = document.getElementById('turnos-confirmados');

    try {
        const data = await apiRequest('/turnos/confirmados');
        
        if (data.length === 0) {
            showResult(resultDiv, 'No hay turnos confirmados', 'success');
            return;
        }

        const turnosHTML = data.map(turno => {
            const tieneChequeo = turno.chequeo && turno.chequeo.id;
            return `
            <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
                <div style="font-weight: 600; color: #28a745; margin-bottom: 8px;">Turno Confirmado</div>
                <div><strong>ID:</strong> ${turno.id}</div>
                <div><strong>Vehículo:</strong> ${turno.vehiculo.patente} - ${turno.vehiculo.marca} ${turno.vehiculo.modelo}</div>
                <div><strong>Dueño:</strong> ${turno.vehiculo.duenio.nombre} (${turno.vehiculo.duenio.email})</div>
                <div><strong>Fecha:</strong> ${new Date(turno.fechaHora).toLocaleString()}</div>
                ${tieneChequeo ? 
                    '<div style="color: #666; margin-top: 5px;">Este turno ya tiene un chequeo creado</div>' :
                    `<button onclick="seleccionarTurnoParaChequeo('${turno.id}')" style="margin-top: 10px; background: #667eea;">Crear Chequeo para Este Turno</button>`
                }
            </div>
        `}).join('');

        resultDiv.innerHTML = turnosHTML;
        resultDiv.classList.add('show', 'success');
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

function seleccionarTurnoParaChequeo(turnoId) {
    crearChequeo(turnoId);
}

async function crearChequeo(turnoId) {
    try {
        const data = await apiRequest('/chequeos', {
            method: 'POST',
            body: JSON.stringify({ idTurno: turnoId })
        });

        // Mostrar mensaje de éxito brevemente
        const resultDiv = document.getElementById('chequeo-crear-result');
        if (resultDiv) {
            showResult(resultDiv, `Chequeo creado exitosamente!\n\nVehículo: ${data.turno.vehiculo.patente}`, 'success');
        }
        
        // Ocultar sección de finalizar si está visible
        const seccionFinalizar = document.getElementById('seccion-finalizar');
        if (seccionFinalizar) seccionFinalizar.style.display = 'none';
        
        // Mostrar automáticamente el formulario de ítems
        setTimeout(() => {
            mostrarFormularioItems(data.id);
        }, 300);
        
        // Recargar listas
        setTimeout(() => {
            cargarTurnosConfirmados();
        }, 1000);
    } catch (error) {
        const resultDiv = document.getElementById('chequeo-crear-result');
        if (resultDiv) {
            showResult(resultDiv, error.message, 'error');
        } else {
            alert('Error: ' + error.message);
        }
    }
}

async function cargarChequeosRealizados() {
    const resultDiv = document.getElementById('chequeos-realizados');

    try {
        const data = await apiRequest('/chequeos/realizados');
        
        if (data.length === 0) {
            showResult(resultDiv, 'No tienes chequeos realizados', 'success');
            return;
        }

        const chequeosHTML = data.map(chequeo => {
            const estadoColor = chequeo.estadoResultado === 'SEGURO' ? '#28a745' : '#dc3545';
            const estadoTexto = chequeo.estadoResultado === 'SEGURO' ? 'SEGURO' : 'RECHEQUEAR';
            const fecha = new Date(chequeo.fechaCreacion).toLocaleString();
            
            return `
            <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid ${estadoColor};">
                <div style="font-weight: 600; color: ${estadoColor}; margin-bottom: 8px;">Estado: ${estadoTexto}</div>
                <div><strong>Vehículo:</strong> ${chequeo.turno.vehiculo.patente} - ${chequeo.turno.vehiculo.marca} ${chequeo.turno.vehiculo.modelo}</div>
                <div><strong>Dueño:</strong> ${chequeo.turno.vehiculo.duenio.nombre} (${chequeo.turno.vehiculo.duenio.email})</div>
                <div><strong>Total Puntaje:</strong> ${chequeo.totalPuntaje || 0}/80</div>
                <div><strong>Fecha:</strong> ${fecha}</div>
                ${chequeo.observacion ? `<div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 3px;"><strong>Observación:</strong> ${chequeo.observacion}</div>` : ''}
                <button onclick="verDetalleChequeo('${chequeo.id}')" style="margin-top: 10px; background: #667eea;">Ver Detalle</button>
            </div>
        `}).join('');

        resultDiv.innerHTML = chequeosHTML;
        resultDiv.classList.add('show', 'success');
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

async function verDetalleChequeo(chequeoId) {
    try {
        const chequeo = await apiRequest(`/chequeos/${chequeoId}`);
        
        const estadoColor = chequeo.estadoResultado === 'SEGURO' ? '#28a745' : '#dc3545';
        const estadoTexto = chequeo.estadoResultado === 'SEGURO' ? 'SEGURO' : 'RECHEQUEAR';
        const fecha = new Date(chequeo.fechaCreacion).toLocaleString();
        
        const puntuacionesHTML = chequeo.puntuaciones?.map(p => 
            `<div style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ítem ${p.numeroItem}:</strong> ${p.puntaje}/10</div>`
        ).join('') || '<div style="padding: 8px;">No hay puntuaciones</div>';
        
        const modalBody = document.getElementById('modal-detalle-body');
        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <strong style="margin-right: 10px; min-width: 120px;">Estado:</strong>
                    <span style="padding: 5px 15px; background: ${estadoColor}; color: white; border-radius: 5px; font-weight: 600;">${estadoTexto}</span>
                </div>
                <div style="margin-bottom: 10px;"><strong>Total Puntaje:</strong> ${chequeo.totalPuntaje || 0}/80</div>
                <div style="margin-bottom: 10px;"><strong>Vehículo:</strong> ${chequeo.turno.vehiculo.patente} - ${chequeo.turno.vehiculo.marca} ${chequeo.turno.vehiculo.modelo}</div>
                <div style="margin-bottom: 10px;"><strong>Dueño:</strong> ${chequeo.turno.vehiculo.duenio.nombre} (${chequeo.turno.vehiculo.duenio.email})</div>
                <div style="margin-bottom: 10px;"><strong>Fecha:</strong> ${fecha}</div>
            </div>
            <div style="margin-bottom: 20px;">
                <strong style="display: block; margin-bottom: 10px;">Puntuaciones por Ítem:</strong>
                <div style="background: #f8f9fa; border-radius: 5px; padding: 10px;">
                    ${puntuacionesHTML}
                </div>
            </div>
            ${chequeo.observacion ? `
                <div>
                    <strong style="display: block; margin-bottom: 10px;">Observación:</strong>
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; border-radius: 5px;">
                        ${chequeo.observacion}
                    </div>
                </div>
            ` : '<div><strong>Observación:</strong> N/A</div>'}
        `;
        
        // Mostrar el modal
        const modal = document.getElementById('modal-detalle-chequeo');
        modal.style.display = 'flex';
    } catch (error) {
        alert('Error al obtener detalle: ' + error.message);
    }
}

function cerrarModalDetalle() {
    const modal = document.getElementById('modal-detalle-chequeo');
    modal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-detalle-chequeo');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalDetalle();
            }
        });
    }
});

function seleccionarChequeoParaItems(chequeoId) {
    mostrarFormularioItems(chequeoId);
}

function mostrarFormularioItems(chequeoId) {
    const container = document.getElementById('agregar-items-container');
    const seccionItems = document.getElementById('seccion-items');
    
    if (!container || !seccionItems) {
        console.error('No se encontraron los elementos necesarios para mostrar el formulario');
        return;
    }
    
    // Crear opciones del selector del 1 al 10
    const opcionesSelector = Array.from({ length: 10 }, (_, i) => {
        const valor = i + 1;
        return `<option value="${valor}">${valor}</option>`;
    }).join('');
    
    container.innerHTML = `
        <div class="form-group">
            <label><strong>Chequeo ID:</strong> ${chequeoId}</label>
        </div>
        <div id="items-container">
            <div class="item-input">
                <label>Ítem 1:</label>
                <select class="item-puntaje" data-item="1" id="item-1">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 2:</label>
                <select class="item-puntaje" data-item="2" id="item-2">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 3:</label>
                <select class="item-puntaje" data-item="3" id="item-3">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 4:</label>
                <select class="item-puntaje" data-item="4" id="item-4">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 5:</label>
                <select class="item-puntaje" data-item="5" id="item-5">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 6:</label>
                <select class="item-puntaje" data-item="6" id="item-6">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 7:</label>
                <select class="item-puntaje" data-item="7" id="item-7">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
            <div class="item-input">
                <label>Ítem 8:</label>
                <select class="item-puntaje" data-item="8" id="item-8">
                    <option value="">Seleccionar...</option>
                    ${opcionesSelector}
                </select>
            </div>
        </div>
        <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center;">
            <strong>Total: <span id="total-puntaje">0</span>/80</strong>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Rango: 8 - 80</div>
        </div>
        <button onclick="agregarItems('${chequeoId}')">Cargar Notas</button>
    `;
    
    // Agregar event listeners para calcular el total en tiempo real
    const selectores = container.querySelectorAll('.item-puntaje');
    selectores.forEach(selector => {
        selector.addEventListener('change', calcularTotal);
    });
    
    // Mostrar la sección de ítems
    seccionItems.style.display = 'block';
    
    // Scroll suave después de un pequeño delay para asegurar que el DOM esté actualizado
    setTimeout(() => {
        seccionItems.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function calcularTotal() {
    const selectores = document.querySelectorAll('.item-puntaje');
    let total = 0;
    
    selectores.forEach(selector => {
        const valor = parseInt(selector.value) || 0;
        total += valor;
    });
    
    const totalElement = document.getElementById('total-puntaje');
    if (totalElement) {
        totalElement.textContent = total;
        
        // Cambiar color según el rango
        if (total < 8) {
            totalElement.style.color = '#dc3545';
        } else if (total >= 8 && total < 40) {
            totalElement.style.color = '#ffc107';
        } else if (total >= 40 && total < 80) {
            totalElement.style.color = '#17a2b8';
        } else if (total === 80) {
            totalElement.style.color = '#28a745';
        }
    }
}

async function agregarItems(chequeoId) {
    const resultDiv = document.getElementById('items-result');

    const items = [];
    const itemSelects = document.querySelectorAll('.item-puntaje');
    
    itemSelects.forEach(select => {
        const numeroItem = parseInt(select.dataset.item);
        const puntaje = parseInt(select.value);
        
        if (puntaje && puntaje >= 1 && puntaje <= 10) {
            items.push({ numeroItem, puntaje });
        }
    });

    if (items.length === 0) {
        showResult(resultDiv, 'Por favor selecciona al menos un ítem con puntaje válido (1-10)', 'error');
        return;
    }

    try {
        const data = await apiRequest(`/chequeos/${chequeoId}/items`, {
            method: 'POST',
            body: JSON.stringify({ items })
        });

        const totalItems = data.puntuaciones?.length || items.length;
        showResult(resultDiv, `Ítems agregados exitosamente!\n\nTotal de ítems: ${totalItems}/8\n\n${totalItems === 8 ? '¡Ya puedes finalizar el chequeo!' : `Faltan ${8 - totalItems} ítems para finalizar.`}`, 'success');
        
        // Si se completaron 8 ítems, mostrar formulario de finalizar
        if (totalItems === 8) {
            // Limpiar campos de items
            document.querySelectorAll('.item-puntaje').forEach(select => select.value = '');
            // Actualizar total
            calcularTotal();
            // Mostrar formulario de finalizar
            setTimeout(() => {
                mostrarFormularioFinalizar(chequeoId);
            }, 500);
        } else {
            // Limpiar solo los campos que se enviaron
            itemSelects.forEach(select => {
                if (items.some(item => item.numeroItem === parseInt(select.dataset.item))) {
                    select.value = '';
                }
            });
            // Actualizar total
            calcularTotal();
        }
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}

function seleccionarChequeoParaFinalizar(chequeoId) {
    mostrarFormularioFinalizar(chequeoId);
}

function mostrarFormularioFinalizar(chequeoId) {
    const container = document.getElementById('finalizar-chequeo-container');
    const seccionFinalizar = document.getElementById('seccion-finalizar');
    
    container.innerHTML = `
        <div class="form-group">
            <label><strong>Chequeo ID:</strong> ${chequeoId}</label>
        </div>
        <div class="form-group">
            <label for="observacion">Observación (obligatoria si total < 40):</label>
            <textarea id="observacion" rows="3"></textarea>
        </div>
        <button onclick="finalizarChequeo('${chequeoId}')">Finalizar Chequeo</button>
    `;
    
    // Mostrar la sección de finalizar
    seccionFinalizar.style.display = 'block';
    seccionFinalizar.scrollIntoView({ behavior: 'smooth' });
}

async function finalizarChequeo(chequeoId) {
    const observacion = document.getElementById('observacion')?.value || '';
    const resultDiv = document.getElementById('finalizar-result');

    try {
        const data = await apiRequest(`/chequeos/${chequeoId}/finalizar`, {
            method: 'POST',
            body: JSON.stringify({ observacion: observacion || null })
        });

        const puntuaciones = data.puntuaciones || [];
        const total = data.totalPuntaje || puntuaciones.reduce((sum, p) => sum + p.puntaje, 0);
        
        const puntuacionesDetalle = puntuaciones.map(p => `  Ítem ${p.numeroItem}: ${p.puntaje}`).join('\n');

        showResult(resultDiv, `Chequeo finalizado exitosamente!\n\nEstado: ${data.estadoResultado}\nTotal Puntaje: ${total}/80\n\nPuntuaciones:\n${puntuacionesDetalle}\n\nObservación: ${data.observacion || 'N/A'}`, 'success');
        
        // Ocultar secciones
        const seccionItems = document.getElementById('seccion-items');
        const seccionFinalizar = document.getElementById('seccion-finalizar');
        if (seccionItems) seccionItems.style.display = 'none';
        if (seccionFinalizar) seccionFinalizar.style.display = 'none';
        
        // Limpiar formularios
        const containerItems = document.getElementById('agregar-items-container');
        const containerFinalizar = document.getElementById('finalizar-chequeo-container');
        if (containerItems) containerItems.innerHTML = '';
        if (containerFinalizar) containerFinalizar.innerHTML = '';
        
        // Recargar chequeos realizados
        setTimeout(() => {
            cargarChequeosRealizados();
        }, 1000);
    } catch (error) {
        showResult(resultDiv, error.message, 'error');
    }
}


// Función auxiliar para mostrar resultados
function showResult(element, message, type = 'success') {
    element.textContent = message;
    element.className = 'result-box show';
    element.classList.add(type);
}

// Establecer fecha mínima para inputs de fecha
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fecha-disponibilidad');
    if (fechaInput) {
        fechaInput.min = today;
    }

    const fechaHoraInput = document.getElementById('turno-fecha');
    if (fechaHoraInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        fechaHoraInput.min = now.toISOString().slice(0, 16);
    }
});

