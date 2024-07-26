import UpdateAccountModule from "../components/UpdateAccountModule";
import { useNavigate } from "react-router-dom";

export default function ManageUserAccountPage() {
  const navigate = useNavigate();
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/signin");
  }

  return (
    <div className="w-full h-full">
      <div>
        <div className="p-8 flex flex-col gap-8">
          <UpdateAccountModule />
        </div>
      </div>
    </div>
  );
}
