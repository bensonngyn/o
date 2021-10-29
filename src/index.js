import { React, useState, useEffect, createContext } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "./black-dashboard-react.scss";
import "./theme.css";
import "./icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function ThemeContextWrapper(props) {
  const themes = {
    dark: "",
    light: "white-content",
  };
  
  const ThemeContext = createContext({
    theme: themes.dark,
    changeTheme: () => {},
  });
  const [theme, setTheme] = useState(themes.dark);

  function changeTheme(theme) {
    setTheme(theme);
  }

  useEffect(() => {
    switch (theme) {
      case themes.light:
        document.body.classList.add("white-content");
        break;
      case themes.dark:
      default:
        document.body.classList.remove("white-content");
        break;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: theme, changeTheme: changeTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

function BackgroundColorWrapper(props) {
  const backgroundColors = {
    primary: "primary",
    blue: "blue",
    green: "green",
  };
  
  const BackgroundColorContext = createContext({
    color: backgroundColors.blue,
    changeColor: (color) => {},
  });
  const [color, setColor] = useState(backgroundColors.blue);

  function changeColor(color) {
    setColor(color);
  }

  return (
    <BackgroundColorContext.Provider
      value={{ color: color, changeColor: changeColor }}
    >
      {props.children}
    </BackgroundColorContext.Provider>
  );
}

ReactDOM.render(
  <ThemeContextWrapper>
    <BackgroundColorWrapper>
      <BrowserRouter>
        <Switch>
          <Route path="/" render={(props) => <App {...props} />} />
          <Redirect from="*" to="/stake" />
        </Switch>
      </BrowserRouter>
    </BackgroundColorWrapper>
  </ThemeContextWrapper>,
  document.getElementById("root")
);
