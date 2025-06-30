// functions/src/index.ts

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as https from "https";

// Importa as funções para definir segredos
import {defineString} from "firebase-functions/params";

// Define as suas chaves secretas como variáveis de ambiente seguras
const TWITCH_CLIENT_ID = defineString("TWITCH_CLIENT_ID");
const TWITCH_CLIENT_SECRET = defineString("TWITCH_CLIENT_SECRET");

/**
 * Esta é uma "Callable Function". O nosso site Angular irá chamá-la
 * diretamente para obter um token de acesso da Twitch.
 */
export const getIgdbToken = onRequest(
  {cors: true}, // Permite que o seu site (mesmo em localhost) chame esta função
  (request, response) => {
    // Inicia o processo de obtenção do token
    logger.info("Recebido pedido para obter token da IGDB/Twitch.");

    const postData = `client_id=${TWITCH_CLIENT_ID.value()}` +
      `&client_secret=${TWITCH_CLIENT_SECRET.value()}` +
      "&grant_type=client_credentials";

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
          logger.info("Token obtido com sucesso da Twitch.");
          response.status(200).send(JSON.parse(data));
        } else {
          logger.error("Erro da API da Twitch:", data);
          response.status(res.statusCode || 500)
            .send({error: "Falha ao obter o token da Twitch."});
        }
      });
    });

    req.on("error", (e) => {
      logger.error("Erro na requisição para a Twitch:", e);
      response.status(500).send({error: "Erro de comunicação com a Twitch."});
    });

    req.write(postData);
    req.end();
  }
);
