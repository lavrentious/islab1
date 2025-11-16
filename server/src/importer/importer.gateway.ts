import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { ImporterServerToClientEvents, ImportOpSocketPayload } from "./types";

@WebSocketGateway({ cors: true, namespace: "imports" })
export class ImporterGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server<ImporterServerToClientEvents>;

  afterInit() {
    console.log("WebSocket gateway initialized");
  }

  notifyStatusChange(payload: ImportOpSocketPayload) {
    this.server.emit("importStatusChanged", payload);
  }
}
