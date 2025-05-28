import { FC } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./Pages/Landing";
import Home from "./Pages/Home";

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Landing />} />
        <Route path="/chat" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
