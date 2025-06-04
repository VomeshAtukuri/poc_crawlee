"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, HelpCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  text: string;
  id: string;
  isUser: boolean;
};

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello, how can I help you?", id: uuidv4(), isUser: false },
  ]);
  const [question, setQuestion] = useState("");
  const [url, setUrl] = useState("");
  const [crawling, setCrawling] = useState(false);
  const [done, setDone] = useState(false);

  const randomAnswers = [
    "I'm not sure I understand.",
    "That's a great question!",
    "I'm still learning, but I'll do my best to help.",
    "I'm not sure I have an answer to that.",
    "That's a tough one!",
  ];

  const handleSendMessage = () => {
    if (!question.trim()) return;

    const userMessage: Message = {
      text: question,
      id: uuidv4(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    handleSendRandomAnswer(userMessage.text);
  };

  const handleSendRandomAnswer = async (query: string) => {
    try {
      const response = await fetch("http://localhost:5570/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query, url }),
      }).then((res) => res.json());

      if (response?.text) {
        setMessages((prev) => [
          ...prev,
          { text: response.text, id: uuidv4(), isUser: false },
        ]);
      } else {
        throw new Error("No response text");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, something went wrong. Please try again later.",
          id: uuidv4(),
          isUser: false,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendUrl = async () => {
    try {
      setCrawling(true);
      const response = await fetch("http://localhost:5570/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }).then((res) => res.json());

      console.log("Crawl response:", response.message);
      setDone(true);
    } catch (err) {
      console.error("Crawl error:", err);
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">CrawlKit</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Crawl a site
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chat Settings</DialogTitle>
                <DialogDescription>
                  Configure your site preferences here.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex flex-col gap-4">
                <Input
                  placeholder="Enter the site URL"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setDone(false);
                  }}
                />
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSendUrl} disabled={!url.trim()}>
                  {crawling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Crawling...
                    </>
                  ) : done ? (
                    "Crawled"
                  ) : (
                    "Crawl"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages */}
        <ScrollArea className="flex overflow-y-scroll flex-1 p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.isUser ? "flex-row-reverse" : ""}`}
              >
                <Avatar className={message.isUser ? "bg-blue-500" : "bg-gray-300"}>
                  <AvatarFallback>{message.isUser ? "U" : "AI"}</AvatarFallback>
                </Avatar>
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.isUser
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-gray-100 rounded-tl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="relative flex items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute left-2">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quick Responses</DialogTitle>
                  <DialogDescription>Select a quick response to send</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  {randomAnswers.map((answer, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-2 px-3"
                      onClick={() =>
                        setMessages((prev) => [
                          ...prev,
                          { text: answer, id: uuidv4(), isUser: true },
                        ])
                      }
                    >
                      {answer}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Input
              className="p-6 pl-14"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <Button
              className="absolute right-2 rounded-full"
              size="icon"
              onClick={handleSendMessage}
              disabled={!question.trim()}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
