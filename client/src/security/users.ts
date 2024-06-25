import axios from "axios";
import config from "../config";

export function retrieveUserInformation(
  accessToken: string,
  andThen: React.Dispatch<any>
) {
  axios
    .get(`${config.serverAddress}/users/auth`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      axios
        .get(`${config.serverAddress}/users/individual/${response.data.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          andThen(response.data);
        })
        .catch((error) => {
          console.error("Error retrieving user information:", error);
        });
    })
    .catch((error) => {
      console.error("Error retrieving user ID:", error);
    });
}
