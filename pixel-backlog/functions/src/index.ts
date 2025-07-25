// Copie e cole este conteúdo em: functions/src/index.ts

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";

// Esta única função irá lidar com todas as chamadas para a nossa API
export const api = onRequest(
  {
    cors: true, // Habilita o CORS para o desenvolvimento local
    secrets: ["TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"],
  },
  async (request, response) => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      logger.error("As credenciais da Twitch (secrets) não estão configuradas.");
      response.status(500).json({error: "Erro de configuração no servidor."});
      return;
    }

    try {
      // 1. Obter o token de acesso da Twitch
      const authUrl = "https://id.twitch.tv/oauth2/token";
      const authResponse = await axios.post(authUrl, new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }));
      const accessToken = authResponse.data.access_token;
      logger.info("Token da Twitch obtido com sucesso.");

      // 2. Repassar a requisição original do Angular para a API da IGDB
      const igdbUrl = `https://api.igdb.com${request.path.replace("/api", "")}`;

      const igdbResponse = await axios.post(igdbUrl, request.body, {
        headers: {
          "Client-ID": clientId,
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "text/plain",
          "Accept": "application/json",
        },
      });

      // 3. Enviar a resposta da IGDB de volta para o Angular
      response.status(200).json(igdbResponse.data);
    } catch (error) {
      logger.error("Ocorreu um erro no proxy da API:", error);
      response.status(500).json({error: "Falha ao comunicar com a API da IGDB."});
    }
  }
);