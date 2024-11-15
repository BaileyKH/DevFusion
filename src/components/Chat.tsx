import { useState, useEffect, useContext, useRef } from 'react';
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
    display_color?: string;
  };
}

export const Chat = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);

  const normalizeMessageData = (message: any): ChatMessage => {
    if (Array.isArray(message.user)) {
      message.user = message.user[0];
    }
    return message as ChatMessage;
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else if (data) {
      setMessages(data.map(normalizeMessageData));
      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    if (!messagesListRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesListRef.current;

    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 50;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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

  const handleSendMessage = async () => {
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

  // Handle key press in the textarea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Regular expression to detect code blocks
  const codeBlockRegex = /```([\s\S]*?)```/g;

  return (
    <div className="w-full h-screen flex flex-col">
      <div
        className="flex-grow overflow-y-auto p-4 space-y-4"
        ref={messagesListRef}
        onScroll={handleScroll}
      >
        {messages.map((message) => {
          const messageUser = Array.isArray(message.user) ? message.user[0] : message.user;
          const hasCodeBlock = codeBlockRegex.test(message.content);
          const userColor = messageUser.display_color || '#FFFFFF';

          return (
            <div
              key={message.id}
              className="my-8"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <div className="flex gap-x-4 items-start">
                {messageUser.avatar_url ? (
                  <img
                    src={messageUser.avatar_url}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                    {messageUser.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-x-4">
                    <p className="font-bold" style={{ color: userColor }}>
                      {messageUser.username}
                    </p>
                    <small>
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </small>
                  </div>
                  <div
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
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
                                className="rounded-md mt-2"
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
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none">
        <form onSubmit={(e) => e.preventDefault()} className="border-t-2 border-darkAccent/65 flex items-center p-4">
          <textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow h-12 p-2 bg-transparent border border-darkAccent/65 rounded-md mr-4 placeholder:text-xs placeholder:text-darkAccent resize-none"
          />
        </form>
      </div>
    </div>
  );
};

export default Chat;
