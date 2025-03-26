import React from "react";
import AppRoutes from "./routes";

import Header from "./components/Header";

const App = () => {
  return (
    <div>
      <Header />

      <AppRoutes />
    </div>
  );
};

export default App;
