"use client";

import { connectWs, type WsConnection } from "@repo/lib";
import { Button, Card, CardContent, CardHeader, Input } from "@repo/ui";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Status = "connecting" | "connected" | "disconnected";

const MAX_MESSAGES = 6;

// Independent panel: plain React state + the ws client. No react-query, no REST, no GraphQL.
export function PanelWebSocket() {
  const t = useTranslations("connected");
  const [status, setStatus] = useState<Status>("connecting");
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const connection = useRef<WsConnection | null>(null);

  useEffect(() => {
    const conn = connectWs({
      onOpen: () => setStatus("connected"),
      onClose: () => setStatus("disconnected"),
      onMessage: (data) => setMessages((prev) => [data, ...prev].slice(0, MAX_MESSAGES)),
    });
    connection.current = conn;
    return () => conn.close();
  }, []);

  const statusView = {
    connecting: {
      icon: <Loader2 size={16} className="animate-spin" />,
      text: t("websocket.connecting"),
    },
    connected: {
      icon: <CheckCircle2 size={16} className="text-success" />,
      text: t("websocket.connected"),
    },
    disconnected: {
      icon: <CircleAlert size={16} className="text-danger" />,
      text: t("websocket.disconnected"),
    },
  }[status];

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">{t("websocket.title")}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          {statusView.icon} {statusView.text}
        </p>

        <h3 className="text-sm font-semibold">{t("websocket.messagesTitle")}</h3>
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("websocket.waiting")}</p>
        )}
        <ul className="space-y-1 font-mono text-xs wrap-anywhere">
          {messages.map((message, index) => (
            <li key={`${messages.length - index}-${message}`}>{message}</li>
          ))}
        </ul>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) return;
            connection.current?.send(text.trim());
            setText("");
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("websocket.placeholder")}
          />
          <Button type="submit" disabled={status !== "connected"}>
            {t("websocket.send")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
