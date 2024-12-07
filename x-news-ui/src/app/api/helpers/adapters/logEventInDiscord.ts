import { formatAxiosError } from "@/app/api/helpers/adapters/formatAxiosError";
import axios from "axios";

export async function logEventInDiscord(
  spaceId: string | null,
  message: string,
  params: Record<string, any> = {}
) {
  if (message === "invalid request request") {
    return;
  }
  const embeds = [
    {
      title: "Request Info",
      fields: [
        {
          name: "SpaceId",
          value: spaceId || "----",
          inline: true,
        },
        {
          name: "Message",
          value: (message || "----").substr(0, 1000),
          inline: false,
        },
        {
          name: "Params",
          value: JSON.stringify(params || {}).substr(0, 1000),
          inline: false,
        },
      ],
    },
  ];
  const data = {
    content: `Got a message on ${process.env.SNAPSHOT_URI}`,
    embeds,
  };

  axios.post(process.env.SERVER_ERRORS_WEBHOOK!, data).catch((err) => {
    console.log(formatAxiosError(err));
    console.log(JSON.stringify(embeds, null, 2));
  });
}
