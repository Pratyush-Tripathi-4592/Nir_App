import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen.jsx";
import LogoScreen from "./components/LogoScreen.jsx";
import CitizenTypeSelect from "./components/CitizenTypeSelect.jsx";
import UploadForm from "./components/UploadForm.jsx";
import ResultCard from "./components/ResultCard.jsx";

function App() {
  const [step, setStep] = useState(0); // Start at step 0 (Splash Screen)
  const [citizenType, setCitizenType] = useState("");
  const [result, setResult] = useState(null);
  const [uploadedImageURL, setUploadedImageURL] = useState("");

  // This hook now ONLY handles the first automatic transition
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 2500); // Wait 2.5 seconds
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [step]);

  // This function is passed to the LogoScreen button
  const handleNext = () => setStep(2);

  return (
    <div className="app">
      {step === 0 && <SplashScreen />}
      {/* CORRECTED: The onNext prop is now correctly passed to the button */}
      {step === 1 && <LogoScreen onNext={handleNext} />}
      {step === 2 && (
        <CitizenTypeSelect
          onSelect={(type) => {
            setCitizenType(type);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <UploadForm
          citizenType={citizenType}
          onResult={(res, imageURL) => {
            setResult(res);
            setUploadedImageURL(imageURL);
            setStep(4);
          }}
        />
      )}
      {step === 4 && <ResultCard result={result} imageURL={uploadedImageURL} />}
    </div>
  );
}

export default App;