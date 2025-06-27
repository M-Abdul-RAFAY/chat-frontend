"use client";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    window.location.replace("/static/index.html");
  }, []);

  return null;
};

export default Home;
