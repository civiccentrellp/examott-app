// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;

// export function getSocket(): Socket {
//   if (!socket) {
//     if (typeof window === "undefined") {
//       // Return a dummy socket-like object or throw
//       throw new Error("Socket cannot be used during SSR");
//     }
//     const token = localStorage.getItem("token");
//     socket = io(process.env.NEXT_PUBLIC_API_BASE_URL as string, {
//       auth: { token },
//     });
//   }
//   return socket;
// }

// export default getSocket;


import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  // Prevent socket connection during SSR
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(process.env.NEXT_PUBLIC_API_BASE_URL as string, {
      auth: { token },
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default getSocket;
