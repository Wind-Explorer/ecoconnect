import axios, { AxiosError } from "axios";
import config from "../config";

export async function retrieveUserInformation(accessToken: string) {
  try {
    let userId = await axios.get(`${config.serverAddress}/users/auth`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let userInformation = await axios.get(
      `${config.serverAddress}/users/individual/${userId.data.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return userInformation.data;
  } catch (error) {
    throw ((error as AxiosError).response?.data as any).message;
  }
}
