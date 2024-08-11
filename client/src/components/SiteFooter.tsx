import { Button, Link } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function SiteFooter() {
  const navigate = useNavigate();
  return (
    <div className="bg-black text-white p-8">
      <div className="flex flex-col text-center *:mx-auto gap-16">
        <div className="flex flex-col gap-4 *:mx-auto">
          <p className="text-2xl font-bold">Have a question?</p>
          <Button
            color="primary"
            variant="solid"
            className="px-24"
            size="lg"
            onPress={() => {
              navigate("/feedback");
            }}
          >
            Get in touch with us
          </Button>
        </div>
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-row justify-between w-full">
            <p className="font-bold">Powered by DIT2303</p>
            <div className="flex flex-row gap-2 *:underline *:text-white">
              <Link>Terms of use</Link>
              <Link>Privacy statement</Link>
              <Link>Report vulnerability</Link>
            </div>
          </div>
          <div className="flex flex-col gap-8 *:mx-auto">
            <p className="text-xl">Connecting neighbourhoods together</p>
            <div className="flex flex-col gap-6 *:mx-auto">
              <img
                src="../assets/gov-footer.png"
                alt="Gov Tech footer logo"
                className=" w-80"
              />
              <p className="font-bold">©2024 STUDENTS OF NANYANG POLYTECHNIC</p>
              <p>Last updated on 23 July 1921</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
