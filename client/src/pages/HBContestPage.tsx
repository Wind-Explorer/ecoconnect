import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function HBContestPage() {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } else {
      navigate("new-submission");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <section className="bg-red-50 dark:bg-primary-950 border border-primary-100 p-10 rounded-xl shadow-md w-full max-w-2xl">
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-red-900 dark:text-white">
              Home Bill Contest
            </p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              This contest is to encourage residents to reduce the use of
              electricity and water usage. This contest would be won by the
              person with the lowest overall bill average. Join us in this
              important effort to create a more sustainable future for everyone.{" "}
              <span className="text-red-600">
                Participants would be required to input and upload their bills into the form to ensure integrity and honesty.{" "}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-900 dark:text-white">
              Winners
            </p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              There will 3 winners for each month. Each winner will receive
              random food vouchers.
            </p>
            <p className="text-gray-700 dark:text-gray-300">1st &rarr; 3 vouchers</p>
            <p className="text-gray-700 dark:text-gray-300">2nd &rarr; 2 vouchers</p>
            <p className="text-gray-700 dark:text-gray-300">3rd &rarr; 1 voucher</p>
          </div>
          <div>
            <Button
              className="bg-red-300 text-white hover:bg-red-600 focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-900 dark:focus:ring-red-700 w-100"
              size="lg"
              onPress={handleJoinClick}
            >
              <p>Join</p>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}