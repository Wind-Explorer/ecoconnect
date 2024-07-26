import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import SpringboardPage from "./pages/SpringboardPage";
import ManageUserAccountPage from "./pages/ManageUserAccountPage";

import CommunityPage from "./pages/CommunityPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import PostPage from "./pages/PostPage";
import SchedulePage from "./pages/SchedulePage";
import EventsPage from "./pages/EventsPage";
import CreateEventsPage from "./pages/CreateEventsPage";
import ManageEventsPage from "./pages/ManageEventsPage";
import AdministratorSpringboard from "./pages/AdministratorSpringboard";
import HBContestPage from "./pages/HBContestPage";
import HBFormPage from "./pages/HBFormPage";
import EditEventsPage from "./pages/EditEventsPage";
import DefaultLayout from "./layouts/default";
import AdministratorLayout from "./layouts/administrator";

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<DefaultLayout />}>
        {/* General Routes */}
        <Route index element={<HomePage />} />
        <Route element={<SignUpPage />} path="signup" />
        <Route element={<SignInPage />} path="signin" />
        <Route element={<SpringboardPage />} path="springboard" />
        <Route element={<ManageUserAccountPage />} path="manage-account" />

        {/* Events Route */}
        <Route path="events">
          <Route index element={<EventsPage />} />
        </Route>

        {/* Karang Guni Schedules Route */}
        <Route path="karang-guni-schedules">
          <Route index element={<SchedulePage />} />
        </Route>

        {/* Home Bill Contest Route */}
        <Route path="home-bill-contest">
          <Route index element={<HBContestPage />} />
          <Route element={<HBFormPage />} path="new-submission" />
        </Route>

        {/* Community Posts Route */}
        <Route path="community-posts">
          <Route index element={<CommunityPage />} />
          <Route element={<CreatePostPage />} path="create" />
          <Route element={<PostPage />} path="post/:id" />
          <Route element={<EditPostPage />} path="edit/:id" />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdministratorLayout />}>
        <Route index element={<AdministratorSpringboard />} />

        {/* Events */}
        <Route path="events">
          <Route index element={<ManageEventsPage />} />
          <Route element={<CreateEventsPage />} path="create" />
          <Route element={<EditEventsPage />} path="edit/:id" />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
