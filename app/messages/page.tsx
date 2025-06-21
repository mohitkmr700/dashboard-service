"use client";

import { PageContainer } from "../../components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Mail, Trash2, Archive } from "lucide-react";

const messages = [
  {
    id: 1,
    subject: "Project Update Meeting",
    sender: "John Doe",
    preview: "Hi team, I wanted to share the latest updates on our project...",
    date: "2024-02-20",
    unread: true,
  },
  {
    id: 2,
    subject: "New Feature Proposal",
    sender: "Jane Smith",
    preview: "I've been working on a new feature that could improve...",
    date: "2024-02-19",
    unread: false,
  },
  {
    id: 3,
    subject: "Client Feedback",
    sender: "Mike Johnson",
    preview: "The client has provided some valuable feedback on our...",
    date: "2024-02-18",
    unread: false,
  },
];

export default function MessagesPage() {
  return (
    <PageContainer 
      title="Messages"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  message.unread ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-foreground">{message.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      From: {message.sender} • {message.date}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {message.preview}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
} 