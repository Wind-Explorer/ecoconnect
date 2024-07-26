import SignInModule from "../components/SignInModule";
import SignedInStatusVerifier from "../components/SignedInStatusVerifier";

export default function SignInPage() {
  return (
    <SignedInStatusVerifier>
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-row h-full">
            <div className="w-3/5 relative">
              <div className="absolute inset-0">
                <div className="w-full h-full relative">
                  <img
                    src="../assets/SigninScreenBG.png"
                    alt="HDB flat"
                    className="w-full h-full object-cover -z-10"
                  />
                  <div className="absolute inset-0 z-10 flex flex-col justify-center">
                    <div className="w-full text-right text-white flex flex-col gap-6 p-16">
                      <p className="text-7xl font-semibold">Welcome back!</p>
                      <p className="text-3xl">
                        Good to have you here again. Tell us who you are, and
                        we'll will let you in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-2/5 p-8">
              <SignInModule />
            </div>
          </div>
        </div>
      </div>
    </SignedInStatusVerifier>
  );
}
