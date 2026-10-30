import asyncio
import contextlib

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


async def _send_counter(websocket: WebSocket) -> None:
    count = 0
    with contextlib.suppress(Exception):  # the socket closed while sending
        while True:
            await asyncio.sleep(1)
            count += 1
            await websocket.send_json({"type": "counter", "value": count})


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket) -> None:
    """Sends a counter every second and echoes any text message it receives."""
    await websocket.accept()
    ticker = asyncio.create_task(_send_counter(websocket))
    try:
        while True:
            text = await websocket.receive_text()
            await websocket.send_json({"type": "echo", "value": text})
    except WebSocketDisconnect:
        pass
    finally:
        ticker.cancel()
