
class WCLoginFormView extends HTMLElement {
  constructor() {
    super();

    // Clase box
    this.container = document.createElement('div');
    this.container.className = 'box';


    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.style.backgroundColor = '#007bff';
    badge.style.color = 'white';
    badge.textContent = 'Login del usuario';
    this.container.appendChild(badge);

    // Título
    const title = document.createElement('h2');
    title.textContent = 'Formulario de Autenticación (Login)';
    this.container.appendChild(title);

    // Descripción
    const desc = document.createElement('p');
    desc.textContent = 'Iniciá sesión para registrar tu contexto de ejecución en la memoria RAM del servidor.';
    this.container.appendChild(desc);

    // Formulario
    this.formElement = document.createElement('form');
    this.formElement.id = 'login-form';

    // Label Usuario
    const labelUser = document.createElement('label');
    labelUser.textContent = 'Usuario:';
    this.formElement.appendChild(labelUser);

    // Input Usuario
    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.id = 'txtUser';
    this.usernameInput.value = 'admin';
    this.usernameInput.required = true;
    this.formElement.appendChild(this.usernameInput);

    // Label Password
    const labelPass = document.createElement('label');
    labelPass.textContent = 'Password:';
    this.formElement.appendChild(labelPass);

    // Input Password (ID original "txtPass")
    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.id = 'txtPass';
    this.passwordInput.value = '1234';
    this.passwordInput.required = true;
    this.formElement.appendChild(this.passwordInput);

    // Botón Iniciar Sesión (ID original "btnLogin")
    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'submit';
    this.submitBtn.id = 'btnLogin';
    this.submitBtn.textContent = 'Iniciar Sesión (POST /login)';
    this.formElement.appendChild(this.submitBtn);

    this.container.appendChild(this.formElement);

    // Adjuntar todo al componente
    this.appendChild(this.container);

    // Enlazar el manejador para evitar funciones flecha
    this.handleSubmitBinded = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    if (this.formElement) {
      this.formElement.addEventListener('submit', this.handleSubmitBinded);
    }
  }

  disconnectedCallback() {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmitBinded);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const username = this.usernameInput.value;
    const password = this.passwordInput.value;

    this.dispatchEvent(new CustomEvent('login-submit', {
      detail: { username, password },
      bubbles: true,
      composed: true
    }));
    
    // Ejecutamos tu función de login global para que la lógica de default.html siga corriendo
    if (typeof window.ejecutarLogin === 'function') {
      window.ejecutarLogin();
    }
  }
}
customElements.define('wc-login-form-view', WCLoginFormView);




class WCRegisterFormView extends HTMLElement {
  constructor() {
    super();

    // 1. Crear contenedor principal (Card usando la clase ".box")
    this.container = document.createElement('div');
    this.container.className = 'box';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.style.backgroundColor = '#2bba5c'; 
    badge.style.color = 'white';
    badge.textContent = 'Registro del usuario';
    this.container.appendChild(badge);

    // Título
    const title = document.createElement('h2');
    title.textContent = 'Crear Cuenta Nueva';
    this.container.appendChild(title);

    // Descripción
    const desc = document.createElement('p');
    desc.textContent = 'Completá los campos para dar de alta un nuevo contexto de usuario.';
    this.container.appendChild(desc);

    // Formulario
    this.formElement = document.createElement('form');
    this.formElement.id = 'register-form';

    // Lista de inputs
    const fields = [
      { id: 'reg-name', label: 'Nombre Completo:', type: 'text', placeholder: 'Ingresá tu nombre', required: true },
      { id: 'reg-email', label: 'Correo Electrónico:', type: 'email', placeholder: 'ejemplo@correo.com', required: true },
      { id: 'reg-pass', label: 'Contraseña:', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true },
      { id: 'reg-confirm-pass', label: 'Confirmar Contraseña:', type: 'password', placeholder: 'Repetí tu contraseña', required: true }
    ];

    //campos dinamicos
    fields.forEach((field) => {
      // Label
      const label = document.createElement('label');
      label.textContent = field.label;
      this.formElement.appendChild(label);

      // Input
      const input = document.createElement('input');
      input.type = field.type;
      input.id = field.id;
      input.placeholder = field.placeholder;
      input.required = field.required;
      this.formElement.appendChild(input);

      // Guardar referencias en la clase para su posterior validación
      if (field.id === 'reg-name') this.nameInput = input;
      if (field.id === 'reg-email') this.emailInput = input;
      if (field.id === 'reg-pass') this.passInput = input;
      if (field.id === 'reg-confirm-pass') this.confirmPassInput = input;
    });

    // Botón Registrarse
    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'submit';
    this.submitBtn.id = 'btnRegister';
    this.submitBtn.style.backgroundColor = '#007bff';
    this.submitBtn.style.color = 'white';
    this.submitBtn.style.border = 'none';
    this.submitBtn.style.width = '95%';
    this.submitBtn.textContent = 'Registrarse y Guardar';
    this.formElement.appendChild(this.submitBtn);

    this.container.appendChild(this.formElement);

    // Adjuntar estructura al componente
    this.appendChild(this.container);

    // Enlazar manejador de eventos
    this.handleSubmitBinded = this.handleSubmit.bind(this);
  }

  //asocia el manejador de eventos del submit.
  connectedCallback() {
    if (this.formElement) {
      this.formElement.addEventListener('submit', this.handleSubmitBinded);
    }
  }

  //Remueve el listener de forma idéntica.
  disconnectedCallback() {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmitBinded);
    }
  }

  //Manejador del submit de registro
  handleSubmit(event) {
    event.preventDefault();

    const name = this.nameInput.value;
    const email = this.emailInput.value;
    const pass = this.passInput.value;
    const confirmPass = this.confirmPassInput.value;

    if (pass !== confirmPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    
    this.dispatchEvent(new CustomEvent('register-submit', {
      detail: { name, email, pass },
      bubbles: true,
      composed: true
    }));

    console.log('Registro Submit:', { name, email });
  }
}

// Registro del WebComponent de Registro
customElements.define('wc-register-form-view', WCRegisterFormView);