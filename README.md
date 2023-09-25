# sketch-voronoi

This Voronoi diagram is responsive to multiplayer cursors, and can be found at [multicursor-sketch.vercel.app](https://multicursor-sketch.vercel.app).

![image](/assets/screenshot.png)

## Experimental!

This app was created during [Matt](https://interconnected.org)'s summer 2023 residency. The purpose is to experiment with multiplayer interactions, and simultaneously see what PartyKit can do. It's called a sketch because it's lightweight and quick, and because we learn something in making it.

## What you'll find here

This app is based on Next.js and PartyKit.

To share state, the party rebroadcasts all cursor moves. (The cursor positions are not absolute; they are scaled to the viewport.) All cursors are tracked on the server (party-side) so that new clients can immediately see all cursors. The current cursor state is stashed in the websocket connection object itself.

Mouse and touch pointers are differentiated. For touchscreen users, their own cursor is also drawn for them, under their finger.
