'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatBubbleLeftRightIcon as ChatIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const handleChatClick = () => {
    // Dispatch a custom event to trigger the chat widget
    const chatEvent = new CustomEvent('toggleChat');
    window.dispatchEvent(chatEvent);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <Image 
              src="/PaperTrailLogo.png" 
              alt="PaperTrail Logo" 
              width={125} 
              height={20}
            />
          </Link>
                   <div className="flex items-center space-x-4">
                     <Link href="/timeline" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
                       Timeline
                     </Link>
                     <button 
                       onClick={handleChatClick}
                       className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                       title="Chat with AI Assistant"
                     >
                       <ChatIcon className="w-5 h-5" />
                       <span className="text-sm font-medium hidden sm:inline">AI Chat</span>
                     </button>
                     <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                       Get Started
                     </button>
                   </div>
        </div>
      </div>
    </nav>
  );
}
