import SignUpModule from "../components/SignUpModule";
import SingaporeAgencyStrip from "../components/SingaporeAgencyStrip";

export default function SignUpPage() {
  return (
    <div className="absolute inset-0">
      <div className="flex flex-col h-full">
        <SingaporeAgencyStrip></SingaporeAgencyStrip>
        <div className="flex flex-row h-full">
          <div className="w-3/5 relative">
            <div className="absolute inset-0">
              <div className="w-full h-full relative">
                <img
                  src="../assets/SignupScreenBG.png"
                  alt="HDB flat"
                  className="w-full h-full object-cover -z-10"
                />
                <div className="absolute inset-0 z-10 flex flex-col justify-center">
                  <div className="w-full text-right text-white flex flex-col gap-6 p-16">
                    <p className="text-7xl font-semibold">Welcome!</p>
                    <p className="text-3xl">
                      Register a new account to access all of HDB Residence
                      services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-2/5 p-8">
            <SignUpModule></SignUpModule>
          </div>
        </div>
      </div>
    </div>
  );
}
