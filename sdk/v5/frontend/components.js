class WCLoginFormView extends HTMLElement {
  constructor() {
    super();

    // Estructura del DOM
    this.cardContainer = document.createElement('div');
    this.cardContainer.className = 'w3-white w3-round w3-margin-bottom w3-border';

    // Seccion central: padding grande
    const paddingDiv = document.createElement('div');
    paddingDiv.className = 'w3-padding-large';

    // Logo y Encabezado "SIGN IN"
    const headerDiv = document.createElement('div');
    headerDiv.className = 'w3-center w3-padding-16';

    const logoImg = document.createElement('img');
    logoImg.src = './assets/admin-logo.png';
    logoImg.alt = 'w3mix';
    logoImg.className = 'w3-image';
    headerDiv.append(logoImg);

    const titleP = document.createElement('p');
    titleP.textContent = 'SIGN IN';
    headerDiv.append(titleP);

    paddingDiv.append(headerDiv);

    // Input Username (txtUser)
    const usernameContainer = document.createElement('div');
    usernameContainer.className = 'w3-margin-bottom';

    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.id = 'txtUser'; // ID que espera el backend
    this.usernameInput.className = 'w3-input w3-round w3-border';
    this.usernameInput.placeholder = 'Enter Username';
    
    usernameContainer.append(this.usernameInput);
    paddingDiv.append(usernameContainer);

    // Input Password (txtPass)
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'w3-margin-bottom';

    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.id = 'txtPass';
    this.passwordInput.className = 'w3-input w3-round w3-border';
    this.passwordInput.placeholder = 'Enter Password';
    
    passwordContainer.append(this.passwordInput);
    paddingDiv.append(passwordContainer);

    // Checkbox "Terms & Conditions"
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'w3-margin-bottom';

    const icheckDiv = document.createElement('div');
    icheckDiv.className = 'icheck-material-white';

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.id = 'user-checkbox';
    checkboxInput.className = 'w3-check';
    checkboxInput.checked = true;

    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'user-checkbox';
    checkboxLabel.textContent = 'I AGREE WITH TERMS & CONDITIONS';

    icheckDiv.append(checkboxInput, checkboxLabel);
    checkboxContainer.append(icheckDiv);
    paddingDiv.append(checkboxContainer);

    // Iniciar Sesión (btnLogin)
    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'button'; 
    this.submitBtn.id = 'btnLogin'; // ID que busca el backend
    this.submitBtn.className = 'w3-button w3-round w3-margin-bottom w3-primary w3-block';
    this.submitBtn.textContent = 'Sign In';

    paddingDiv.append(this.submitBtn);

    // Separador "Sign In With"
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'w3-center w3-margin-bottom w3-opacity';
    separatorDiv.textContent = 'Sign In With';
    paddingDiv.append(separatorDiv);

    // Redes (Facebook y Twitter)
    const socialRow = document.createElement('div');
    socialRow.className = 'w3-row-padding w3-stretch';

    // Columna Facebook
    const fbCol = document.createElement('div');
    fbCol.className = 'w3-col m6';

    const fbBtn = document.createElement('button');
    fbBtn.type = 'button';
    fbBtn.className = 'w3-button w3-round w3-margin-bottom bg-facebook w3-text-white w3-block';

    const fbIcon = document.createElement('i');
    fbIcon.className = 'fa fa-facebook-square';
    fbBtn.append(fbIcon, document.createTextNode(' Facebook'));

    fbCol.append(fbBtn);
    socialRow.append(fbCol);

    // Columna Twitter
    const twCol = document.createElement('div');
    twCol.className = 'w3-col m6 text-right';

    const twBtn = document.createElement('button');
    twBtn.type = 'button';
    twBtn.className = 'w3-button w3-round w3-margin-bottom bg-twitter w3-text-white w3-block';

    const twIcon = document.createElement('i');
    twIcon.className = 'fa fa-twitter-square';
    twBtn.append(twIcon, document.createTextNode(' Twitter'));

    twCol.append(twBtn);
    socialRow.append(twCol);

    paddingDiv.append(socialRow);
    this.cardContainer.append(paddingDiv);

    // Enlace a registro
    const footerDiv = document.createElement('div');
    footerDiv.className = 'w3-center w3-border-top';

    const footerP = document.createElement('p');
    footerP.className = 'w3-margin';

    const footerSpan = document.createElement('span');
    footerSpan.className = 'w3-text-warning';
    footerSpan.textContent = 'Do not have an account?';

    const footerLink = document.createElement('a');
    footerLink.href = 'register.html';
    footerLink.textContent = ' Sign Up here';

    footerP.append(footerSpan, footerLink);
    footerDiv.append(footerP);

    this.cardContainer.append(footerDiv);

    // Agregamos todo al elemento raíz
    this.append(this.cardContainer);
  }

  
  connectedCallback() {
    if (this.submitBtn) {
      this.submitBtn.onclick = this.handleLogin.bind(this);
    }
  }

  // Operación inversa estricta (limpieza a null)
  disconnectedCallback() {
    if (this.submitBtn) {
      this.submitBtn.onclick = null;
    }
  }

  // Manejo de Login
  handleLogin(event) {
    event.preventDefault();

    const username = this.usernameInput.value;
    const password = this.passwordInput.value;

    this.dispatchEvent(new CustomEvent('login-submit', {
      detail: { username, password },
      bubbles: true,
      composed: true
    }));

    if (typeof window.ejecutarLogin === 'function') {
      window.ejecutarLogin();
    }
  }
}

customElements.define('wc-login-form-view', WCLoginFormView);




class WCRegisterFormView extends HTMLElement {
  constructor() {
    super();

    // Estructura del DOM
    this.cardContainer = document.createElement('div');
    this.cardContainer.className = 'w3-white w3-round w3-margin-bottom w3-border';

    
    const header = document.createElement('header');
    header.className = 'w3-padding-large w3-large w3-border-bottom';
    header.style.fontWeight = '500';
    header.textContent = 'HORIZONTAL FORM';
    this.cardContainer.append(header);

    // Div contenedor del formulario con padding
    const formPaddingDiv = document.createElement('div');
    formPaddingDiv.className = 'w3-padding-large';

    this.formElement = document.createElement('form');

    // Fila name
    const rowName = document.createElement('div');
    rowName.className = 'w3-row w3-margin-bottom';

    const labelName = document.createElement('label');
    labelName.className = 'w3-col l2';
    labelName.textContent = 'Name';

    const colNameInput = document.createElement('div');
    colNameInput.className = 'w3-col l10';

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.className = 'w3-input w3-border w3-round';
    this.nameInput.placeholder = 'Enter Your Name';
    this.nameInput.required = true;

    colNameInput.append(this.nameInput);
    rowName.append(labelName, colNameInput);
    this.formElement.append(rowName);

    // Fila Email
    const rowEmail = document.createElement('div');
    rowEmail.className = 'w3-row w3-margin-bottom';

    const labelEmail = document.createElement('label');
    labelEmail.className = 'w3-col l2';
    labelEmail.textContent = 'Email';

    const colEmailInput = document.createElement('div');
    colEmailInput.className = 'w3-col l10';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.className = 'w3-input w3-border w3-round';
    this.emailInput.placeholder = 'Enter Your Email Address';
    this.emailInput.required = true;

    colEmailInput.append(this.emailInput);
    rowEmail.append(labelEmail, colEmailInput);
    this.formElement.append(rowEmail);

    // Fila Mobile Number
    const rowMobile = document.createElement('div');
    rowMobile.className = 'w3-row w3-margin-bottom';

    const labelMobile = document.createElement('label');
    labelMobile.className = 'w3-col l2';
    labelMobile.textContent = 'Mobile Number';

    const colMobileInput = document.createElement('div');
    colMobileInput.className = 'w3-col l10';

    this.mobileInput = document.createElement('input');
    this.mobileInput.type = 'text';
    this.mobileInput.className = 'w3-input w3-border w3-round';
    this.mobileInput.placeholder = 'Enter Your Mobile Number';

    colMobileInput.append(this.mobileInput);
    rowMobile.append(labelMobile, colMobileInput);
    this.formElement.append(rowMobile);

    // Fila Password
    const rowPass = document.createElement('div');
    rowPass.className = 'w3-row w3-margin-bottom';

    const labelPass = document.createElement('label');
    labelPass.className = 'w3-col l2';
    labelPass.textContent = 'Password';

    const colPassInput = document.createElement('div');
    colPassInput.className = 'w3-col l10';

    this.passInput = document.createElement('input');
    this.passInput.type = 'password';
    this.passInput.className = 'w3-input w3-border w3-round';
    this.passInput.placeholder = 'Enter Password';
    this.passInput.required = true;

    colPassInput.append(this.passInput);
    rowPass.append(labelPass, colPassInput);
    this.formElement.append(rowPass);

    // Fila Confirm Password
    const rowConfirmPass = document.createElement('div');
    rowConfirmPass.className = 'w3-row w3-margin-bottom';

    const labelConfirmPass = document.createElement('label');
    labelConfirmPass.className = 'w3-col l2';
    labelConfirmPass.textContent = 'Confirm Password';

    const colConfirmPassInput = document.createElement('div');
    colConfirmPassInput.className = 'w3-col l10';

    this.confirmPassInput = document.createElement('input');
    this.confirmPassInput.type = 'password';
    this.confirmPassInput.className = 'w3-input w3-border w3-round';
    this.confirmPassInput.placeholder = 'Confirm Password';
    this.confirmPassInput.required = true;

    colConfirmPassInput.append(this.confirmPassInput);
    rowConfirmPass.append(labelConfirmPass, colConfirmPassInput);
    this.formElement.append(rowConfirmPass);

    // Fila: Checkbox "Terms & Conditions"
    const rowCheckbox = document.createElement('div');
    rowCheckbox.className = 'w3-row w3-margin-bottom';

    // Columna izquierda vacia para alinear el checkbox
    const colLeftEmptyCheckbox = document.createElement('div');
    colLeftEmptyCheckbox.className = 'w3-col l2';
    const nonBreakingSpace1 = document.createTextNode('\u00A0'); 
    colLeftEmptyCheckbox.append(nonBreakingSpace1);

    const colRightCheckbox = document.createElement('div');
    colRightCheckbox.className = 'w3-col l10';

    const checkboxLabel = document.createElement('label');

    this.termsCheckbox = document.createElement('input');
    this.termsCheckbox.type = 'checkbox';
    this.termsCheckbox.className = 'w3-check';
    this.termsCheckbox.checked = true;

    checkboxLabel.append(this.termsCheckbox, document.createTextNode(' I Agree Terms & Conditions'));

    colRightCheckbox.append(checkboxLabel);
    rowCheckbox.append(colLeftEmptyCheckbox, colRightCheckbox);
    this.formElement.append(rowCheckbox);

    // Fila del Boton Register
    const rowButton = document.createElement('div');
    rowButton.className = 'w3-row w3-margin-bottom';

    // Columna izquierda vacia para alinear el botón
    const colLeftEmptyButton = document.createElement('div');
    colLeftEmptyButton.className = 'w3-col l2';
    const nonBreakingSpace2 = document.createTextNode('\u00A0');
    colLeftEmptyButton.append(nonBreakingSpace2);

    const colRightButton = document.createElement('div');
    colRightButton.className = 'w3-col l10';

    this.submitBtn = document.createElement('button');
    this.submitBtn.type = 'submit';
    this.submitBtn.className = 'w3-button w3-primary w3-round';

    // candado
    const lockIcon = document.createElement('i');
    lockIcon.className = 'fa fa-fw fa-lock';
    
    this.submitBtn.append(lockIcon, document.createTextNode(' Register'));

    colRightButton.append(this.submitBtn);
    rowButton.append(colLeftEmptyButton, colRightButton);
    this.formElement.append(rowButton);

    // Adjuntar al contenedor
    formPaddingDiv.append(this.formElement);
    this.cardContainer.append(formPaddingDiv);

    this.append(this.cardContainer);
  }

  
  connectedCallback() {
    if (this.formElement) {
      this.formElement.onsubmit = this.handleRegister.bind(this);
    }
  }

  
  disconnectedCallback() {
    if (this.formElement) {
      this.formElement.onsubmit = null;
    }
  }

  // Manejo de registros
  handleRegister(event) {
    event.preventDefault();

    const name = this.nameInput.value;
    const email = this.emailInput.value;
    const mobile = this.mobileInput.value;
    const pass = this.passInput.value;
    const confirmPass = this.confirmPassInput.value;
    const agreeTerms = this.termsCheckbox.checked;

    if (pass !== confirmPass) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if (!agreeTerms) {
      alert('Debe aceptar los términos y condiciones.');
      return;
    }

    this.dispatchEvent(new CustomEvent('register-submit', {
      detail: { name, email, mobile, pass },
      bubbles: true,
      composed: true
    }));

    console.log('Registro Exitoso! Datos del usuario:', { name, email, mobile });
  }
}

customElements.define('wc-register-form-view', WCRegisterFormView);