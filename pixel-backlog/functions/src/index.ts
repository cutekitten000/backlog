// functions/src/index.ts

import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import * as https from "https";

// As chaves são carregadas automaticamente pelo Firebase a partir dos segredos que você definiu.
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

export const getIgdbToken = onRequest(
  // A opção {cors: true} lida com as permissões do navegador.
  { cors: true, secrets: ["TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"] },
  (request, response) => {
    logger.info("Iniciando requisição de token para a Twitch...", { structuredData: true });

    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      logger.error("As variáveis de ambiente TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET não foram encontradas.");
      response.status(500).send({ error: "Configuração do servidor incompleta." });
      return;
    }

    const postData = `client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

    const options = {
      hostname: "id.twitch.tv",
      path: "/oauth2/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          logger.info("Token da Twitch obtido com sucesso.");
          response.status(200).send(JSON.parse(data));
        } else {
          logger.error("Erro recebido da API da Twitch:", {
            statusCode: res.statusCode,
            body: data,
          });
          response.status(res.statusCode || 500).send(data); // Envia a resposta de erro da Twitch diretamente
        }
      });
    });

    req.on("error", (e) => {
      logger.error("Erro na requisição HTTPS para a Twitch:", e);
      response.status(500).send({ error: "Erro de comunicação com a Twitch." });
    });

    req.write(postData);
    req.end();
  }
);