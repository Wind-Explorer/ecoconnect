import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import SpringboardPage from "./pages/SpringboardPage";
import ManageUserAccountPage from "./pages/ManageUserAccountPage";
import SchedulePage from "./pages/SchedulePage";

function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<SignUpPage />} path="/signup" />
      <Route element={<SignInPage />} path="/signin" />
      <Route element={<SpringboardPage />} path="/springboard/:accessToken" />
      <Route
        element={<ManageUserAccountPage />}
        path="/manage-account/:accessToken"
      />
      <Route element={<SchedulePage/>} path="/schedule"/>
    </Routes>
  );
}

export default App;
