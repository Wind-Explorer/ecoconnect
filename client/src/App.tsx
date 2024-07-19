import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import SpringboardPage from "./pages/SpringboardPage";
import ManageUserAccountPage from "./pages/ManageUserAccountPage";

import CommunityPage from "./pages/CommunityPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import PostPage from './pages/PostPage';
import SchedulePage from "./pages/SchedulePage";
import EventsPage from "./pages/EventsPage";
import CreateEventsPage from "./pages/CreateEventsPage";
import ManageEventsPage from "./pages/ManageEventsPage";
import AdministratorSpringboard from "./pages/AdministratorSpringboard";

function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<SignUpPage />} path="/signup" />
      <Route element={<SignInPage />} path="/signin" />
      <Route element={<SpringboardPage />} path="/springboard" />
      <Route element={<ManageUserAccountPage />} path="/manage-account" />
      <Route element={<AdministratorSpringboard />} path="/admin" />

      <Route element={<CommunityPage />} path="/community" />
      <Route element={<CreatePostPage />} path="/createPost" />
      <Route element={<EditPostPage />} path="/editPost/:id" />
      <Route element={<PostPage />} path="/post/:id" />
      <Route element={<SchedulePage />} path="/schedule" />
      <Route element={<EventsPage />} path="/events" />
      <Route element={<CreateEventsPage />} path="/createEvent" />
      <Route element={<ManageEventsPage />} path="/manageEvent" />
    </Routes>
  );
}

export default App;
