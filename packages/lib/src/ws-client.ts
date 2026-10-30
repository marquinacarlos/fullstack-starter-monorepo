const baseUrl: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface WsHandlers {
  onOpen?: () => void;
  onMessage?: (data: string) => void;
  onClose?: () => void;
  onError?: () => void;
}

export interface WsConnection {
  send: (data: string) => void;
  close: () => void;
}

/** http://host -> ws://host, https://host -> wss://host */
export function wsUrl(path = "/ws"): string {
  return baseUrl.replace(/^http/, "ws") + path;
}

/** Opens a WebSocket to {API}/ws. The caller owns the lifecycle: call close() on cleanup. */
export function connectWs(handlers: WsHandlers, path = "/ws"): WsConnection {
  const socket = new WebSocket(wsUrl(path));
  socket.onopen = () => handlers.onOpen?.();
  socket.onmessage = (event) => handlers.onMessage?.(String(event.data));
  socket.onclose = () => handlers.onClose?.();
  socket.onerror = () => handlers.onError?.();
  return {
    send: (data) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(data);
    },
    close: () => socket.close(),
  };
}
