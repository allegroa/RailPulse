export function logout() {
  localStorage.removeItem('token');
  window.location.href = import.meta.env.BASE_URL + 'login';
}

export function getToken(){
  return localStorage.getItem('token');
}
