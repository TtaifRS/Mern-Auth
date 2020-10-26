import cookie from "js-cookie";

//set cookie
export const setCookie = (key, value) => {
  if (window !== undefined) {
    cookie.set(key, value, {
      expires: 1,
    });
  }
};

//remove cookie
export const removeCookie = (key) => {
  if (window !== undefined) {
    cookie.remove(key, {
      expires: 1,
    });
  }
};

//get cookie
//usefull to make req to server with token
export const getCookie = (key) => {
  if (window !== undefined) {
    return cookie.get(key);
  }
};

//set in local storage
export const setLocalStorage = (key, value) => {
  if (window !== undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

//remove from local storage
export const removeLocalStorage = (key) => {
  if (window !== undefined) {
    localStorage.removeItem(key);
  }
};

// authenticate user by passing data to cookie and local storage during sign in
export const authenticate = (response, next) => {
  console.log("AUTHENTICATE HELPER ON SIGNIN RESPONSE", response);
  setCookie("token", response.data.token);
  setLocalStorage("user", response.data.user);
  next();
};

//access user info from local storage
export const isAuth = () => {
  if (window !== undefined) {
    const cookieChecked = getCookie("token");
    if (cookieChecked) {
      if (localStorage.getItem("user")) {
        return JSON.parse(localStorage.getItem("user"));
      } else {
        return false;
      }
    }
  }
};

//signout
export const signOut = (next) => {
  removeCookie("token");
  removeLocalStorage("user");
  next();
};
