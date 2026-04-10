const API_URL = "/api";

async function cargarMateriales() {
    try {
        const response = await fetch(`${API_URL}/materiales`);
        const materiales = await response.json();
        
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        const selectMaterial = document.getElementById('select-material');
        
        cuerpoTabla.innerHTML = "";
        selectMaterial.innerHTML = '<option value="">Seleccione...</option>';

        materiales.forEach(mat => {
            cuerpoTabla.innerHTML += `
                <tr>
                    <td>${mat.nombre}</td>
                    <td><strong>${mat.cantidad}</strong></td>
                    <td>${mat.unidad_medida}</td>
                </tr>`;
            
            selectMaterial.innerHTML += `<option value="${mat.id}">${mat.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error cargando materiales:", error);
    }
}

async function realizarOperacion(tipo) {
    const id = document.getElementById('select-material').value;
    const cantidad = parseFloat(document.getElementById('input-cantidad').value);

    if (!id || isNaN(cantidad)) return alert("Completá los datos");

    const response = await fetch(`${API_URL}/operacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cantidad, tipo })
    });

    if (response.ok) {
        cargarMateriales(); // Recarga la tabla con el nuevo stock
    } else {
        const res = await response.json();
        alert("Error: " + res.error);
    }
}

document.getElementById('btn-comprar').onclick = () => realizarOperacion('compra');
document.getElementById('btn-vender').onclick = () => realizarOperacion('venta');

cargarMateriales();