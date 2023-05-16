import { getAllData } from "./script.js";


const headers = new Headers({
    "Content-Type": "application/json",
    "Authorization": "Basic " + btoa("${username}:${password}")
  });
  
  const options = {
    method: "GET",
    headers: headers,
  };
  
  //fetch("http://localhost:3000/proxy",options)

  const loginForm = document.querySelector('#login-form');
  const loginFormContainer = document.querySelector('#login-form-container');
  const logoutButtonContainer = document.querySelector('#logout-button-container');
  const logoutButton = document.querySelector('#logout-button');

 let jwt_token = null;

  const handleToken = (token) => {
    if (token && token.error) {
      alert(`Invalid login credentials: ${token.error}`);
      return;
    }
  
    // Save the token to local storage or a cookie
    localStorage.setItem('jwt_token', token);

    jwt_token = token;
    
  
    //console.log("token Handletokenis", token)
    // Hide the login form and show the logout button
    loginFormContainer.style.display = 'none';
    logoutButtonContainer.style.display = 'block';
    getAllData(token)
   
  };
  export { jwt_token, handleToken };
  

  const handleLogout = () => {
    // Remove the token from local storage or a cookie
    localStorage.removeItem('token');
    // Hide the logout button and show the login form
    loginFormContainer.style.display = 'block';
    logoutButtonContainer.style.display = 'none';
  };

  logoutButton.addEventListener('click', handleLogout);

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = event.target.elements.username.value;
    //console.log(username)
    const password = event.target.elements.password.value;
    
    const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": "Basic " + btoa(`${username}:${password}`)
    });

    const options = {
      method: "GET",
      headers: headers,
    };

    try {
      const response = await fetch("http://localhost:3000/proxy", options);
      const data = await response.json();
      const token = data.token;
      
      handleToken(token);
    } catch (error) {
      console.error("error");
    }
  });
 
  // Check if a token is already saved and display the appropriate UI
  // window.addEventListener("DOMContentLoaded", () => {
  //   const savedToken = localStorage.getItem('jwt_token');
  //   if (savedToken) {
  //   handleToken(savedToken);
  // }
  // });
  //const savedToken = localStorage.getItem('jwt_token');
  