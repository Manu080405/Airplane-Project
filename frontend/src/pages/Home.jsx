import Header from "../components/Header";
import InputForm from "../components/InputForm";
import PredictionCard from "../components/PredictionCard";
import AIInsights from "../components/AIInsights";
import Footer from "../components/Footer";
import { useState } from "react";

function Home() {
  const [prediction, setPrediction] = useState(null);

  return (
    <>
      <Header />
      <main className="app-content">
        <InputForm setPrediction={setPrediction} />
        {prediction && <PredictionCard prediction={prediction} />}
        {prediction && <AIInsights prediction={prediction} />}
      </main>
      <Footer />
    </>
  );
}

export default Home;