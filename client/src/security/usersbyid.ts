import { AxiosError } from "axios";
import config from "../config";
import instance from "./http";

export async function retrieveUserInformationById(userId: number) {
  if (!localStorage.getItem("accessToken")) {
    throw "No access token";
  }
  try {
    let userInformation = await instance.get(
      `${config.serverAddress}/users/individual/${userId}`
    );
    return userInformation.data;
  } catch (error) {
    throw ((error as AxiosError).response?.data as any).message;
  }
}