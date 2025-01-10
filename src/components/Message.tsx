import React from 'react';
import { ChatMessage } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const getMessageStyles = () => {
    switch (message.role) {
      case 'assistant':
        return 'justify-start bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
      case 'tool':
        return 'justify-start bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100';
      default:
        return 'justify-end bg-primary-500 text-white';
    }
  };

  // Convert URL-like text in backticks to proper markdown links
  const preprocessContent = (content: string) => {
    return content.replace(
      /`(https?:\/\/[^\s`]+)`/g,
      (match, url) => `[${url}](${url})`
    );
  };

  return (
    <div className={`flex ${message.role === 'system' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${getMessageStyles()}`}>
        <div className="text-sm prose dark:prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({...props}) => <p className="mb-1 last:mb-0" {...props} />,
              a: ({href, ...props}) => {
                const isUrl = href?.startsWith('http');
                return (
                  <a
                    href={href}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-block max-w-full truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={href} // Show full URL on hover
                    {...props}
                  >
                    {isUrl ? new URL(href!).hostname : props.children}
                  </a>
                );
              },
              ul: ({...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
              ol: ({...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
              li: ({...props}) => (
                <li className="mb-1">
                  <div className="flex flex-col">
                    {props.children}
                  </div>
                </li>
              ),
              code: ({inline, children, ...props}: any) => {
                if (inline && typeof children === 'string' && children.startsWith('http')) {
                  return (
                    <a
                      href={children}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-block max-w-full truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={children}
                    >
                      {new URL(children).hostname}
                    </a>
                  );
                }
                return (
                  <code
                    className={`${inline ? 'bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded' :
                      'block bg-gray-200 dark:bg-gray-800 p-2 rounded my-2'}`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {preprocessContent(message.content)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;
