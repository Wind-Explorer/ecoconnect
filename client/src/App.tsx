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
import EventDetailsPage from "./pages/EventDetailsPage";
import RegisterPage from "./pages/RegisterPage";
import CreateEventsPage from "./pages/CreateEventsPage";
import ManageEventsPage from "./pages/ManageEventsPage";
import AdministratorSpringboard from "./pages/AdministratorSpringboard";
import EditEventsPage from "./pages/EditEventsPage";
import HBContestPage from "./pages/HBContestPage";
import HBFormPage from "./pages/HBFormPage";
import DefaultLayout from "./layouts/default";
import AdministratorLayout from "./layouts/administrator";
import UsersManagement from "./pages/UsersManagementPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RestrictedLayout from "./layouts/restricted";
import Ranking from "./pages/Ranking";
import ManageSchedulePage from "./pages/ManageSchedulePage";
import EditSchedulePage from "./pages/EditSchedulePage";
import CreateSchedulePage from "./pages/CreateSchedulePage";
import CommunityPostManagement from "./pages/CommunityPostManagement";
import ManageVoucherPage from "./pages/ManageVoucherPage";
import CreateVoucherPage from "./pages/CreateVoucherPage";
import EditVoucherPage from "./pages/EditVoucherPage";
import FeedbackPage from "./pages/FeedbackPage";
import UserVouchersPage from "./pages/UserVouchersPage";
import ManageFeedbacksPage from "./pages/ManageFeedbacksPage";
import TagManagement from "./pages/TagManagement";


function App() {
  return (
    <Routes>
      <Route>
        {/* User Routes */}
        <Route path="/">
          <Route element={<DefaultLayout />}>
            {/* General Routes */}
            <Route index element={<HomePage />} />
            <Route element={<SignUpPage />} path="signup" />
            <Route element={<SignInPage />} path="signin" />
            <Route element={<SpringboardPage />} path="springboard" />
            <Route element={<ManageUserAccountPage />} path="manage-account" />

            {/* Events Route */}
            <Route path="events">
              <Route index element={<EventsPage />} />
              <Route element={<EventDetailsPage />} path="view/:id" />
              <Route element={<RegisterPage />} path="register/:id" />
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

            {/* Vouchers */}
            <Route element={<UserVouchersPage />} path="user-voucher" />
          </Route>

          

          {/* Special (Restricted) Routes */}
          <Route element={<RestrictedLayout />}>
            <Route element={<ForgotPasswordPage />} path="forgot-password" />
            <Route
              element={<ResetPasswordPage />}
              path="reset-password/:token"
            />
            <Route element={<FeedbackPage />} path="feedback" />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdministratorLayout />}>
          <Route index element={<AdministratorSpringboard />} />
          <Route path="manage-account" element={<ManageUserAccountPage />} />
          <Route path="manage-feedbacks" element={<ManageFeedbacksPage />} />
          <Route path="users-management">
            <Route index element={<UsersManagement />} />
          </Route>

          {/* Events */}
          <Route path="events">
            <Route index element={<ManageEventsPage />} />
            <Route element={<CreateEventsPage />} path="createEvent" />
            <Route element={<EditEventsPage />} path="editEvent/:id" />
          </Route>

          <Route path="ranking">
            <Route index element={<Ranking />} />
          </Route>

          <Route path="voucher">
            <Route index element={<ManageVoucherPage />} />
            <Route path="create-voucher" element={<CreateVoucherPage />} />
            <Route path="edit-voucher/:id" element={<EditVoucherPage />} />
          </Route>

          <Route path="schedules">
            <Route index element={<ManageSchedulePage />} />
            <Route path="create-schedule" element={<CreateSchedulePage />} />
            <Route path="edit-schedule/:id" element={<EditSchedulePage />} />
          </Route>

          <Route path="community-posts">
            <Route index element={<CommunityPostManagement />} />
            <Route path="manage-tag" element={<TagManagement />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
