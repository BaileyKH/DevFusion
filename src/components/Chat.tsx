import { useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user:
    | {
        username: string;
      }
    | {
        username: string;
      }[];
}

export const Chat = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);

  const normalizeMessageData = (message: any): ChatMessage => {
    if (Array.isArray(message.user)) {
      message.user = message.user[0];
    }
    return message as ChatMessage;
  };

  const fetchMessages = async (cursor?: string) => {
    let query = supabase
      .from('chat_messages')
      .select(`
        id,
        user_id,
        content,
        created_at,
        user:user_id (
          username
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
    } else if (data) {
      console.log('Data fetched:', data);
      const adjustedData = data.map(normalizeMessageData);

      if (cursor) {
        setMessages((prevMessages) => [...adjustedData.reverse(), ...prevMessages]);
      } else {
        setMessages(adjustedData.reverse());
        setIsAtBottom(true);
      }

      if (data.length < 20) {
        setHasMore(false);
      }
    }
  };

  const handleScroll = () => {
    if (!messagesListRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesListRef.current;

    // Determine if user scrolled to the top to load more messages
    if (scrollTop === 0 && !loadingMore && hasMore) {
      loadMoreMessages();
    }

    // Check if user is at the bottom
    const atBottom = scrollHeight - scrollTop <= clientHeight + 1; // Added a threshold
    setIsAtBottom(atBottom);
  };

  const loadMoreMessages = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    const messagesList = messagesListRef.current;
    const scrollHeightBefore = messagesList?.scrollHeight || 0;

    const oldestMessage = messages[0];
    const cursor = oldestMessage.created_at;
    await fetchMessages(cursor);
    setLoadingMore(false);

    const scrollHeightAfter = messagesList?.scrollHeight || 0;
    if (messagesList) {
      messagesList.scrollTop = scrollHeightAfter - scrollHeightBefore;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`public:chat_messages_project_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload: { eventType: string; new: any; old: any }) => {
          console.log('Real-time INSERT event:', payload);

          const { data: newMessageData } = await supabase
            .from('chat_messages')
            .select(`
              id,
              user_id,
              content,
              created_at,
              user:user_id (
                username
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessageData) {
            const normalizedMessage = normalizeMessageData(newMessageData);
            setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
            // Removed scrollToBottom() from here
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === '') return;

    const { error } = await supabase.from('chat_messages').insert({
      project_id: projectId,
      user_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      setIsAtBottom(true);
    }
  };

  return (
    <div className="w-full h-full">
      <div
        className=""
        ref={messagesListRef}
        style={{ overflowY: 'scroll', maxHeight: '80vh' }}
        onScroll={handleScroll}
      >
        {loadingMore && <p>Loading more messages...</p>}
        {messages.map((message) => {
          const messageUser = Array.isArray(message.user) ? message.user[0] : message.user;
          return (
            <div
              key={message.id}
              className={`message ${message.user_id === user.id ? 'sent' : 'received'}`}
            >
              <p>
                <strong>{messageUser.username}</strong>: {message.content}
              </p>
              <small>
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </small>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
