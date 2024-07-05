import { AxiosError } from "axios";
import config from "../config";
import instance from "./http";

export async function retrieveUserInformation() {
  try {
    let userId = await instance.get(`${config.serverAddress}/users/auth`);
    let userInformation = await instance.get(
      `${config.serverAddress}/users/individual/${userId.data.id}`
    );
    return userInformation.data;
  } catch (error) {
    throw ((error as AxiosError).response?.data as any).message;
  }
}
