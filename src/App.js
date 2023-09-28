import React, { useState } from "react";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import OTPInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "./firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
const App = () => {
  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [user, setUser] = useState(null);

  function onCaptchaVerify(){
    if(!window.recaptchaVerifier){
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // ...
          onSignup();
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // ...
        }
      });
    }
  }
  

  function onSignup(){
    setLoading(true)
    onCaptchaVerify()
    const appVerifier = window.recaptchaVerifier

    const formatPh = "+"+ph

    signInWithPhoneNumber(auth, formatPh, appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      window.confirmationResult = confirmationResult;
      // ...
      setLoading(false)
      setShowOTP(true)
      toast.success("OTP sended successfully!")

    }).catch((error) => {
      // Error; SMS not sent
      // ...
      console.log(error)
      setLoading(false)
    });

  }

  function onOTPVerify(){
    setLoading(true)
    window.confirmationResult.confirm(otp).then(async(res)=>{
      console.log(res)
      setUser(res.user)
      setLoading(false)
    }).catch(err=>{
      console.log(err)
      setLoading(false)
    })
  }

  return (
    <section className="bg-emerald-600 flex items-center justify-center h-screen">
      <div>
      <Toaster toastOptions={{duration:6000}} />
      <div id="recaptcha-container"></div>
        {user ? (
          <h2 className="text-center text-white font-medium text-3xl mb-6">
            👍Login Success
          </h2>
        ) : (
          <div className="w-80 flex flex-col gap-4">
            <h1 className="text-center leading-normal text-white font-medium text-3xl mb-6">
              Welcome to <br /> OTP Project
            </h1>
            {showOTP ? (
              <>
                <div className="bg-white text-emerald-600 w-fit mx-auto p-4 rounded-full">
                  <BsFillShieldLockFill size={30} />
                </div>
                <label
                  htmlFor="otp"
                  className="font-bold text-xl text-white text-center"
                >
                  Enter your OTP
                </label>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  OTPLength={6}
                  otpType="number"
                  disabled={false}
                  autofocus
                  className=""
                />
                <button onClick={onOTPVerify} className="bg-emerald-900 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded">
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Verify OTP</span>
                </button>
              </>
            ) : (
              <>
                <div className="bg-white text-emerald-600 w-fit mx-auto p-4 rounded-full">
                  <BsTelephoneFill size={30} />
                </div>
                <label
                  htmlFor="ph"
                  className="font-bold text-xl text-white text-center"
                >
                  Verify your phone number
                </label>
                <PhoneInput country={"in"} value={ph} onChange={setPh} />
                <button onClick={onSignup} className="bg-emerald-900 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded">
                  {loading && (
                    <CgSpinner size={20} className="mt-1 animate-spin" />
                  )}
                  <span>Send code via SMS</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default App;
