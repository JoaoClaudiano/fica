// Simples mock de login
function login(email, password) {
  if(email && password){
    localStorage.setItem('user', JSON.stringify({email}));
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('user');
}