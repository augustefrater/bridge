defmodule BridgeWeb.RoomChannel do
  use BridgeWeb, :channel
  alias BridgeWeb.Presence

  @impl true
  def join("room:lobby", _message, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :user, socket.assigns.user)}
  end
  # def join("room:lobby", %{"user_id" => user_id}, socket) do
  #   send(self(), :after_join)
  #   {:ok, assign(socket, :user_id, user_id)}
  # end

  @impl true
  def join("room:42", _message, socket) do
   {:ok, socket}
 end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user, %{
      online_at: :os.system_time(:milli_seconds)
    })
    push socket, "presence_state", Presence.list(socket)
    # broadcast(socket, "player:new", %{user: socket.assigns.user})
    {:noreply, socket}
  end

  @impl true
  def handle_in("message:new", message, socket) do
    broadcast! socket, "message:new", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  @impl true
  def handle_in("player:getcard", message, socket) do
    broadcast! socket, "player:getcard", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  def handle_in("player:setscore", message, socket) do
    broadcast! socket, "player:setscore", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  def handle_in("board:setturn", message, socket) do
    broadcast! socket, "board:setturn", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end
  
  def handle_in("board:setsuit", message, socket) do
    broadcast! socket, "board:setsuit", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  def handle_in("board:clear", _message, socket) do
    broadcast! socket, "board:clear", %{
      user: socket.assigns.user,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  def handle_in("player:playCard", message, socket) do
    broadcast! socket, "player:playCard", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  def handle_in("server:playCard", message, socket) do
    broadcast! socket, "server:playCard", %{
      user: socket.assigns.user,
      body: message,
      timestamp: :os.system_time(:milli_seconds)
    }
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
