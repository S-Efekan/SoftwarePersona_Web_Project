const mainButtons = document.getElementById('main-buttons');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const backBtns = document.querySelectorAll('.back-btn');

btnLogin.addEventListener('click', () => {
    mainButtons.classList.add('slide-out-left');
    loginFormContainer.classList.add('slide-in-center');
});

btnRegister.addEventListener('click', () => {
    mainButtons.classList.add('slide-out-left');
    registerFormContainer.classList.add('slide-in-center');
});

backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        mainButtons.classList.remove('slide-out-left');
        loginFormContainer.classList.remove('slide-in-center');
        registerFormContainer.classList.remove('slide-in-center');
    });
});

/* Bu kısımı butonlara tıklandıktan sonra formun ekrana kayarak gelip gitmesi için ekledim */