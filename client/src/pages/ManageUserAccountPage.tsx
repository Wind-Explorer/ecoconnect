import { useParams } from "react-router-dom";
import DefaultLayout from "../layouts/default";
import UpdateAccountModule from "../components/UpdateAccountModule";

export default function ManageUserAccountPage() {
  let { accessToken } = useParams<string>(); // TODO: Replace AT from props with AT from localstorage

  return (
    <DefaultLayout>
      <div>
        <div className="p-8 flex flex-col gap-8">
          <UpdateAccountModule accessToken={accessToken!} />
        </div>
      </div>
    </DefaultLayout>
  );
}
