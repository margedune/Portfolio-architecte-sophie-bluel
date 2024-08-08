const api = 'http://localhost:5678/api';
const btnLogin = document.querySelector('#login');

btnLogin.addEventListener('click', function() {
    login();
});

async function login()
{
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    
    const data = {
        email: email,
        password: password
    };

    const loginResponse = await fetch(`${api}/users/login`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json' // Indiquer que le corps de la requête est en JSON
        },
        body: JSON.stringify(data) // Convertir l'objet JavaScript en chaîne JSON
    });

    if (loginResponse.status === 404) {
        const errorMessage = document.querySelector('.message');
        errorMessage.innerHTML = 'Erreur dans l\'identifiant ou le mot de passe';
    }

    if (loginResponse.status === 200) {
        const loginResponseJson = await loginResponse.json();
        const session = loginResponseJson.token;
        window.location.href = `/FrontEnd/index.html?session=${session}`;
    }
}
