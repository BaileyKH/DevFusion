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
  user:
    | {
        username: string;
      }
    | {
        username: string;
      }[];
}

const Chat = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);

  // Helper function to normalize message data
  const normalizeMessageData = (message: any): ChatMessage => {
    if (Array.isArray(message.user)) {
      message.user = message.user[0];
    }
    return message as ChatMessage;
  };

  // Fetch messages from the database
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
    const atBottom = scrollHeight - scrollTop <= clientHeight + 1;
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

  // Code detection function
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

  // Regular expression to detect code blocks
  const codeBlockRegex = /```([\s\S]*?)```/g;

  // Row component for react-window to virtualize messages
  const Row = ({ index, style }: { index: number; style: any }) => {
    const message = messages[index];
    const messageUser = Array.isArray(message.user) ? message.user[0] : message.user;
    const hasCodeBlock = codeBlockRegex.test(message.content);

    return (
      <div
        key={message.id}
        className={`message ${message.user_id === user.id ? 'sent' : 'received'} my-4`}
        style={style} // Style provided by react-window
      >
        <div className="flex gap-x-4">
          <p className="font-bold">{messageUser.username}</p>
          <small>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </small>
        </div>
        <div>
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
            <p>{message.content}</p>
          )}
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
      >
        {Row}
      </List>
      <form onSubmit={handleSendMessage} className="message-input border-t-2 border-primDark flex flex-col items-start p-4">
        <textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full mt-2 p-2 bg-transparent border border-primDark rounded-md mr-4 placeholder:text-xs"
        />
        <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};


export default Chat;
