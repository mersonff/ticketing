import axios, { AxiosInstance } from "axios";
import { NextPageContext } from "next";

const buildClient = (context?: NextPageContext): AxiosInstance => {
  if (typeof window === "undefined") {
    // We are on the server!
    return axios.create({
      baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: context?.req?.headers || {},
    });
  } else {
    // We are on the browser!
    return axios.create({
      baseURL: "",
    });
  }
};

export default buildClient;
