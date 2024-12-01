import { useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';
import { useParams } from 'react-router-dom';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atelierCaveDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { IconPaperclip } from '@tabler/icons-react';

import { Button } from "@/components/ui/button";

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
  files?: ChatFile[];
  status?: 'sending' | 'sent' | 'failed';
}

interface ChatFile {
  id?: string;
  file_name: string;
  file_url?: string;
  file_type: string;
  status: 'uploading' | 'uploaded' | 'failed';
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        ),
        files:chat_files (
          id,
          file_name,
          file_url,
          file_type
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

    const messagesChannel = supabase
      .channel(`public:chat_messages_project_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`,
        },
        handleNewMessage
      )
      .subscribe();

    const filesChannel = supabase
      .channel(`public:chat_files_project_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_files',
          filter: `project_id=eq.${projectId}`,
        },
        handleNewFile
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(filesChannel);
    };
  }, [projectId]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const updateMessageId = (tempId: string, realId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === tempId ? { ...msg, id: realId } : msg
      )
    );
  };

  // Handle new messages from realtime subscription
  const handleNewMessage = async (payload: { eventType: string; new: any; old: any }) => {
    const messageId = payload.new.id;

    const messageExists = messages.some((msg) => msg.id === messageId);
    if (messageExists) {
      return;
    }

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
        ),
        files:chat_files (
          id,
          file_name,
          file_url,
          file_type
        )
      `)
      .eq('id', messageId)
      .single();

    if (newMessageData) {
      const normalizedMessage = normalizeMessageData(newMessageData);
      setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
    }

    if (isAtBottom) {
      scrollToBottom();
    }
  };

  // Handle new files from realtime subscription
  const handleNewFile = async (payload: { eventType: string; new: any; old: any }) => {
    const newFile = payload.new;

    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message.id === newFile.message_id) {
          const updatedFiles = message.files
            ? message.files.map((file) =>
                file.file_name === newFile.file_name
                  ? { ...file, ...newFile, status: 'uploaded' }
                  : file
              )
            : [{ ...newFile, status: 'uploaded' }];
          return { ...message, files: updatedFiles };
        }
        return message;
      })
    );
  };

  // Function to fetch project members for @mention suggestions
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
    const codeIndicators = [
      '{', '}', '=>', ';', 'function', 'const', 'let', 'var', 'class', 'import', '#include', 'def', 'if', 'else'
    ];
    const containsCodeIndicators = codeIndicators.some((indicator) => text.includes(indicator));
    return hasMultipleLines && containsCodeIndicators;
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && selectedFiles.length === 0) return;

    const content = isProbablyCode(newMessage)
      ? `\`\`\`\n${newMessage.trim()}\n\`\`\``
      : newMessage.trim();

    const filesToUpload = [...selectedFiles];

    setNewMessage('');
    setSelectedFiles([]);
    setIsAtBottom(true);

    if (filesToUpload.length > 0) {
      const tempMessageId = `temp-${Date.now()}-${Math.random()}`;

      const tempMessage: ChatMessage = {
        id: tempMessageId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        user: {
          username: user.username,
          avatar_url: user.avatar_url,
          display_color: user.display_color,
        },
        files: filesToUpload.map((file) => ({
          file_name: file.name,
          file_type: file.type,
          status: 'uploading',
        })),
        status: 'sending',
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);

      try {
        const { data: messageData, error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            project_id: projectId,
            user_id: user.id,
            content,
          })
          .select()
          .single();

        if (messageError) throw messageError;

        updateMessageId(tempMessageId, messageData.id);

        for (const file of tempMessage.files || []) {
          const originalFile = filesToUpload.find(
            (f) => f.name === file.file_name && f.type === file.file_type
          );
          if (originalFile) {
            await uploadFile(originalFile, messageData.id);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        updateMessageStatus(tempMessageId, 'failed');
      }
    } else {
      try {
        await supabase.from('chat_messages').insert({
          project_id: projectId,
          user_id: user.id,
          content,
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const updateMessageStatus = (messageId: string, status: 'sending' | 'sent' | 'failed') => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  };

  const updateFileInMessage = (
    messageId: string,
    fileName: string,
    updates: Partial<ChatFile>
  ) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId && msg.files) {
          const updatedFiles = msg.files.map((file) =>
            file.file_name === fileName ? { ...file, ...updates } : file
          );
          return { ...msg, files: updatedFiles };
        }
        return msg;
      })
    );
  };

  const uploadFile = async (file: File, messageId: string) => {
    const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
    const filePath = `${projectId}/${user.id}/${Date.now()}_${sanitizedFileName}`;

    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: publicURLData } = supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      const publicUrl = publicURLData.publicUrl;

      const { data: fileData, error: fileInsertError } = await supabase
        .from('chat_files')
        .insert({
          message_id: messageId,
          project_id: projectId,
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
        })
        .select()
        .single();

      if (fileInsertError) throw fileInsertError;

      updateFileInMessage(messageId, file.name, {
        id: fileData.id,
        file_url: publicUrl,
        status: 'uploaded',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      updateFileInMessage(messageId, file.name, { status: 'failed' });
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
    setNewMessage((prev) => `${prev}@${mentionUsername} `);
    setMentionSuggestions([]);
    setSelectedMentionIndex(-1);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Regular expressions for parsing message content
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const mentionRegex = /@(\w+)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

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
          const files = message.files || [];
          const messageStatus = message.status || 'sent';

          return (
            <div
              key={message.id}
              className="my-8"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                opacity: messageStatus === 'failed' ? 0.5 : 1,
              }}
            >
              <div className="flex gap-x-4 items-start">
                {messageUser.avatar_url ? (
                  <img
                    src={messageUser.avatar_url}
                    alt="User Avatar"
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
                    {messageStatus === 'sending' && (
                      <span className="text-sm text-gray-500 ml-2">Sending...</span>
                    )}
                    {messageStatus === 'failed' && (
                      <span className="text-sm text-red-500 ml-2">Failed to send</span>
                    )}
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
                  {files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {files.map((file) => {
                        const isImage = file.file_type && file.file_type.startsWith('image/');
                        const isUploading = file.status === 'uploading';
                        const uploadFailed = file.status === 'failed';

                        return (
                          <div key={file.id || file.file_name} className="flex items-center">
                            {isImage && file.file_url && !isUploading && !uploadFailed ? (
                              <img
                                src={file.file_url}
                                alt={file.file_name}
                                className="max-w-xs rounded-md"
                              />
                            ) : (
                              <a
                                href={file.file_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primAccent underline hover:text-blue-800 transition-colors duration-200 ease-in"
                              >
                                {file.file_name}
                              </a>
                            )}
                            {isUploading && (
                              <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                            )}
                            {uploadFailed && (
                              <span className="ml-2 text-sm text-red-500">Failed to upload</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-none relative">
        <form onSubmit={(e) => e.preventDefault()} className="border-t-2 border-darkAccent/65 flex items-center py-4">
          <textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow h-14 p-2 bg-transparent border border-darkAccent/65 rounded-md mr-4 placeholder:text-xs placeholder:text-darkAccent resize-none"
          />
          <div className="flex items-center rounded-md border border-darkAccent/65 p-2">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setSelectedFiles(files);
              }}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mr-2 bg-primDark transition duration-200"
            >
              <IconPaperclip className="text-primAccent" />
            </Button>
            <Button
              type="button"
              onClick={handleSendMessage}
              className="bg-primDark text-primAccent text-xs transition duration-200"
            >
              Send
            </Button>
          </div>
        </form>
        {selectedFiles.length > 0 && (
          <div className="flex items-center py-2">
            <p className="font-bold mr-2">Selected Files:</p>
            <ul className="list-disc list-inside">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
