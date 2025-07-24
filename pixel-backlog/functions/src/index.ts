// functions/src/index.ts

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as https from "https";

// NÃO usamos mais o defineString

/**
 * Esta é uma "onRequest Function". O nosso site Angular irá chamá-la
 * para obter um token de acesso da Twitch.
 */
export const getIgdbToken = onRequest(
  // AQUI ESTÁ A MUDANÇA: Declaramos os segredos de que a função precisa
  {
    cors: true,
    secrets: ["TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"],
  },
  (request, response) => {
    logger.info("Recebido pedido para obter token da IGDB/Twitch.");

    // As chaves agora são acedidas através de process.env
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      logger.error("Client ID ou Client Secret não encontrados no ambiente da função.");
      response.status(500).send({error: "Configuração interna do servidor em falta."});
      return;
    }

    const postData = `client_id=${clientId}` +
      `&client_secret=${clientSecret}` +
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
          logger.error("Erro da API da Twitch:", data, res.statusCode);
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