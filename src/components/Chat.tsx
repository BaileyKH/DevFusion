import { useState, useEffect, useContext, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atelierCaveDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url?: string;
    display_color?: string; // Added display_color property
  };
}

export const Chat = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesListRef = useRef<any>(null);

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
          username,
          avatar_url,
          display_color
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

  const loadMoreMessages = async () => {
    if (loadingMore) return;

    setLoadingMore(true);

    const oldestMessage = messages[0];
    const cursor = oldestMessage.created_at;
    await fetchMessages(cursor);
    setLoadingMore(false);
  };

  const scrollToBottom = () => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollToItem(messages.length - 1, 'end');
    }
  };

  useEffect(() => {
    fetchMessages();

    // Real-time subscription for new chat messages
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
          const { data: newMessageData } = await supabase
            .from('chat_messages')
            .select(`
              id,
              user_id,
              content,
              created_at,
              user:user_id (
                username,
                avatar_url,
                display_color
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessageData) {
            const normalizedMessage = normalizeMessageData(newMessageData);
            setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
            if (isAtBottom) {
              scrollToBottom();
            }
          }
        }
      )
      .subscribe();

    // Real-time subscription for changes in user profiles (avatar or display color)
    const userChannel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        async (payload) => {
          const updatedUser = payload.new;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.user_id === updatedUser.id
                ? {
                    ...msg,
                    user: {
                      ...msg.user,
                      avatar_url: updatedUser.avatar_url,
                      display_color: updatedUser.display_color,
                    },
                  }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(userChannel);
    };
  }, [projectId]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const isProbablyCode = (text: string): boolean => {
    const hasMultipleLines = text.trim().includes('\n');
    const codeIndicators = ['{', '}', '=>', ';', 'function', 'const', 'let', 'var', 'class', 'import', '#include', 'def', 'if', 'else'];
    const containsCodeIndicators = codeIndicators.some((indicator) => text.includes(indicator));
    return hasMultipleLines && containsCodeIndicators;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === '') return;

    const content = isProbablyCode(newMessage) ? `\`\`\`\n${newMessage.trim()}\n\`\`\`` : newMessage.trim();

    const { error } = await supabase.from('chat_messages').insert({
      project_id: projectId,
      user_id: user.id,
      content,
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      setIsAtBottom(true);
    }
  };

  const codeBlockRegex = /```([\s\S]*?)```/g;

  const Row = ({ index, style }: { index: number; style: any }) => {
    const message = messages[index];
    const messageUser = message.user;
    const hasCodeBlock = codeBlockRegex.test(message.content);

    return (
      <div
        key={message.id}
        className={`message ${message.user_id === user.id ? 'sent' : 'received'} my-4`}
        style={style}
      >
        <div className="flex items-center gap-x-4">
          <div>
            {messageUser.avatar_url && (
              <img
                src={messageUser.avatar_url}
                alt="Avatar"
                className="h-9 w-9 rounded-full"
              />
            )}
          </div>
          <div>
            <div className='flex gap-x-4 items-center'>
              <p
                className="font-bold text-sm"
                style={{ color: messageUser.display_color ?? '#FFF' }}
              >
                {messageUser.username}
              </p>
              <small className='text-white/50'>
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </small>
            </div>
            <div className='mt-1'>
              {hasCodeBlock ? (
                (() => {
                  codeBlockRegex.lastIndex = 0;
                  const parts = message.content.split(codeBlockRegex);
                  return parts.map((part, index) => {
                    if (index % 2 === 1) {
                      return (
                        <SyntaxHighlighter
                          key={index}
                          language=""
                          style={atelierCaveDark}
                          showLineNumbers
                          className="rounded-md"
                        >
                          {part}
                        </SyntaxHighlighter>
                      );
                    } else {
                      return part ? <p key={index}>{part}</p> : null;
                    }
                  });
                })()
              ) : (
                <p className='text-sm'>{message.content}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <List
        height={600}
        itemCount={messages.length}
        itemSize={100}
        width="100%"
        ref={messagesListRef}
        onItemsRendered={({ visibleStopIndex }) => {
          if (visibleStopIndex === messages.length - 1) {
            setIsAtBottom(true);
          }
        }}
      >
        {Row}
      </List>
      <form onSubmit={handleSendMessage} className="border-t-2 border-primDark flex items-center py-4">
        <textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full h-12 mt-2 p-2 bg-transparent border border-primDark rounded-md mr-4 placeholder:text-xs placeholder:text-darkAccent resize-none"
        />
        <button type="submit" className="mt-2 p-2 bg-primAccent hover:bg-red-950 transition duration-300 text-lightAccent rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;


