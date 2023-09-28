import type * as Party from "partykit/server";

type Cursor = {
  // country is set upon connection
  country: string | null;

  // cursor fields are only set on first message
  x?: number;
  y?: number;
  pointer?: "mouse" | "touch";
  lastUpdate?: number;
};

type UpdateMessage = {
  type: "update";
  id: string; // websocket.id
} & Cursor;

type SyncMessage = {
  type: "sync";
  cursors: { [id: string]: Cursor };
};

type RemoveMessage = {
  type: "remove";
  id: string; // websocket.id
};

// server.ts
export default class CursorServer implements Party.Server {
  constructor(public party: Party.Party) {}
  options: Party.ServerOptions = {
    hibernate: true,
  };

  onConnect(
    websocket: Party.Connection<Cursor>,
    { request }: Party.ConnectionContext
  ): void | Promise<void> {
    const country = (request.cf?.country as string) ?? null;
    websocket.setState({ country });

    console.log("[connect]", this.party.id, websocket.id, country);

    // On connect, send a "sync" message to the new connection
    // Pull the cursor from all websocket attachments
    let cursors: { [id: string]: Cursor } = {};
    for (const ws of this.party.getConnections<Cursor>()) {
      const id = ws.id;
      let cursor = ws.state;
      if (
        id !== websocket.id &&
        cursor !== null &&
        cursor.x !== undefined &&
        cursor.y !== undefined
      ) {
        cursors[id] = cursor;
      }
    }

    const msg = <SyncMessage>{
      type: "sync",
      cursors: cursors,
    };

    websocket.send(JSON.stringify(msg));
  }

  onMessage(
    message: string,
    websocket: Party.Connection<Cursor>
  ): void | Promise<void> {
    const position = JSON.parse(message as string);
    const cursor = websocket.setState((prev) => ({
      country: prev?.country ?? null,
      x: position.x,
      y: position.y,
      pointer: position.pointer,
      lastUpdate: Date.now(),
    }));

    const msg =
      position.x && position.y
        ? <UpdateMessage>{
            type: "update",
            ...cursor,
            id: websocket.id,
          }
        : <RemoveMessage>{
            type: "remove",
            id: websocket.id,
          };

    // Broadcast, excluding self
    this.party.broadcast(JSON.stringify(msg), [websocket.id]);
  }

  onClose(websocket: Party.Connection) {
    // Broadcast a "remove" message to all connections
    const msg = <RemoveMessage>{
      type: "remove",
      id: websocket.id,
    };

    console.log(
      "[disconnect]",
      this.party.id,
      websocket.id,
      websocket.readyState
    );

    this.party.broadcast(JSON.stringify(msg), []);
  }
}

CursorServer satisfies Party.Worker;
