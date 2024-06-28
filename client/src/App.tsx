import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import SpringboardPage from "./pages/SpringboardPage";
import ManageUserAccountPage from "./pages/ManageUserAccountPage";

import CommunityPage from "./pages/CommunityPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
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

      <Route element={<CommunityPage />} path="/community" />
      <Route element={<CreatePostPage />} path="/createPost" />
      <Route element={<EditPostPage/>} path="/editPost/:id" />
      <Route element={<SchedulePage/>} path="/schedule"/>
    </Routes>
  );
}

export default App;
