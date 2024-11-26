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
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState<number>(-1);

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

  const fetchMembers = async (search: string) => {
    const { data, error } = await supabase
      .from('project_memberships')
      .select('users:user_id (username, avatar_url)')
      .ilike('users.username', `%${search}%`)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching members for mentions:', error);
    } else if (data) {
      setMentionSuggestions(data.map((item) => item.users));
    }
  };

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === '@') {
      fetchMembers('');
    } else if (mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        setSelectedMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        setSelectedMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      } else if (e.key === 'Enter' && selectedMentionIndex >= 0) {
        e.preventDefault();
        const mention = mentionSuggestions[selectedMentionIndex];
        setNewMessage((prev) => `${prev}@${mention.username} `);
        setMentionSuggestions([]);
        setSelectedMentionIndex(-1);
      }
    }
  };

  const handleMentionClick = (mentionUsername: string) => {
    setNewMessage((prev) => `${prev}${mentionUsername} `);
    setMentionSuggestions([]);
    setSelectedMentionIndex(-1);
  };

  const codeBlockRegex = /```([\s\S]*?)```/g;
  const mentionRegex = /@(\w+)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={messagesListRef} onScroll={handleScroll}>
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
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-primAccent">
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
                  <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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
                      // Highlight mentions and URLs in text
                      message.content.split(mentionRegex).map((part, index) => {
                        if (index % 2 === 1) {
                          const isMentionedUser = part === user.username;
                          return (
                            <span
                              key={index}
                              className={`${
                                isMentionedUser
                                  ? 'text-lightAccent bg-yellow-400/30 p-1 rounded-md font-bold'
                                  : 'text-lightAccent bg-primAccent/50 p-1 rounded-md'
                              }`}
                            >
                              @{part}
                            </span>
                          );
                        }
                        return part.split(urlRegex).map((subPart, subIndex) => {
                          if (urlRegex.test(subPart)) {
                            return (
                              <a
                                key={`${index}-${subIndex}`}
                                href={subPart}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primAccent underline underline-offset-4 hover:text-blue-800 transition-colors duration-200 ease-in"
                              >
                                {subPart}
                              </a>
                            );
                          }
                          return <span key={`${index}-${subIndex}`}>{subPart}</span>;
                        });
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-none relative">
        <form onSubmit={(e) => e.preventDefault()} className="border-t-2 border-darkAccent/65 flex items-center p-4">
          <textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow h-12 p-2 bg-transparent border border-darkAccent/65 rounded-md mr-4 placeholder:text-xs placeholder:text-darkAccent resize-none"
          />
        </form>
        {mentionSuggestions.length > 0 && (
          <div className="absolute bottom-16 left-4 w-full max-w-md bg-primDark rounded-md shadow-lg z-10">
            <ul>
              {mentionSuggestions.map((mention, index) => (
                <li
                  key={mention.username}
                  onClick={() => handleMentionClick(mention.username)}
                  className={`p-2 cursor-pointer hover:bg-primAccent/20 rounded-md ${
                    index === selectedMentionIndex ? 'bg-primAccent/20 rounded-md' : ''
                  }`}
                >
                  {mention.username}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
